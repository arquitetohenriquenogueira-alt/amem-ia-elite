"""
Read.ai Transcript Harvester — bulk downloads meeting transcripts from Read.ai API.

YOLO mode: autonomous, continuous, checkpointed, resumable.

CLI:
    python3 -m core.intelligence.pipeline.read_ai_harvester run
    python3 -m core.intelligence.pipeline.read_ai_harvester resume
    python3 -m core.intelligence.pipeline.read_ai_harvester stop
    python3 -m core.intelligence.pipeline.read_ai_harvester status

Architecture:
    Read.ai API → [HARVESTER] → staging/ → [ROUTER] → inbox/empresa|pessoal/MEETINGS/
                                                         ↓ (every N pessoal)
                                                    [GARDENER] reorganizes
"""

import base64
import json
import sys
import time
import urllib.error
import urllib.request
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

from core.intelligence.pipeline.read_ai_config import ReadAIConfig, load_config
from core.intelligence.pipeline.read_ai_gardener import PessoalGardener
from core.intelligence.pipeline.read_ai_router import MeetingRouter

# ============================================================================
# Constants
# ============================================================================

MAX_RETRIES = 3
BACKOFF_BASE = 2  # 2^attempt seconds
REQUEST_TIMEOUT = 30  # seconds per HTTP request


# ============================================================================
# State
# ============================================================================

@dataclass
class HarvestState:
    """Persistent state for resume support."""

    version: str = "1.0.0"
    status: str = "idle"  # idle, running, completed, stopped, failed
    started_at: str | None = None
    stopped_at: str | None = None
    last_updated: str | None = None

    # Progress
    meetings_discovered: int = 0
    meetings_downloaded: int = 0
    meetings_skipped: int = 0
    meetings_failed: int = 0

    # Routing
    routed_empresa: int = 0
    routed_pessoal: int = 0
    pessoal_since_garden: int = 0

    # Tag counter
    next_tag_number: int = 1

    # Already-processed meeting IDs (for resume)
    processed_ids: list[str] = field(default_factory=list)

    # Pagination
    last_page_token: str | None = None
    all_pages_fetched: bool = False

    # Gardener
    gardener_runs: int = 0


def _load_state(path: Path) -> HarvestState:
    """Load state from JSON file."""
    if not path.exists():
        return HarvestState()
    try:
        with open(path) as f:
            data = json.load(f)
        # Handle list fields that may be missing
        s = HarvestState()
        for k, v in data.items():
            if hasattr(s, k):
                setattr(s, k, v)
        return s
    except (json.JSONDecodeError, OSError):
        return HarvestState()


def _save_state(state: HarvestState, path: Path) -> None:
    """Persist state to JSON file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    state.last_updated = datetime.utcnow().isoformat() + "Z"
    with open(path, "w") as f:
        json.dump(asdict(state), f, indent=2)


# ============================================================================
# API Client
# ============================================================================

class ReadAIClient:
    """HTTP client for Read.ai API using stdlib only."""

    def __init__(self, config: ReadAIConfig):
        self.config = config
        self.base_url = config.api_url.rstrip("/")
        self._token: str | None = None

    def list_meetings(
        self, page_token: str | None = None
    ) -> dict[str, Any]:
        """
        List meetings with pagination.

        Returns dict with keys: meetings (list), next_page_token (str|None)
        """
        params = f"page_size={self.config.page_size}"
        if page_token:
            params += f"&page_token={page_token}"

        url = f"{self.base_url}/list_meetings?{params}"
        return self._request("GET", url)

    def get_meeting(self, meeting_id: str) -> dict[str, Any]:
        """Get full meeting details including transcript."""
        url = f"{self.base_url}/get_meeting?meeting_id={meeting_id}"
        return self._request("GET", url)

    def _request(
        self, method: str, url: str, body: bytes | None = None
    ) -> dict[str, Any]:
        """Make HTTP request with auth and retry logic."""
        headers = self._auth_headers()
        headers["Accept"] = "application/json"

        for attempt in range(MAX_RETRIES):
            try:
                req = urllib.request.Request(
                    url, data=body, headers=headers, method=method
                )
                with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                    data = resp.read().decode("utf-8")
                    return json.loads(data)

            except urllib.error.HTTPError as e:
                if e.code == 401 and attempt == 0:
                    # Try bearer token auth on 401
                    self._token = None
                    headers = self._auth_headers(force_bearer=True)
                    continue
                if e.code == 429:
                    # Rate limited — backoff
                    wait = BACKOFF_BASE ** (attempt + 1)
                    time.sleep(wait)
                    continue
                if e.code >= 500 and attempt < MAX_RETRIES - 1:
                    wait = BACKOFF_BASE ** (attempt + 1)
                    time.sleep(wait)
                    continue
                raise

            except (urllib.error.URLError, OSError):
                if attempt < MAX_RETRIES - 1:
                    wait = BACKOFF_BASE ** (attempt + 1)
                    time.sleep(wait)
                    continue
                raise

        raise RuntimeError(f"Request failed after {MAX_RETRIES} attempts: {url}")

    def _auth_headers(self, force_bearer: bool = False) -> dict[str, str]:
        """Build auth headers. Tries Basic auth first, Bearer as fallback."""
        if force_bearer or self._token:
            if not self._token:
                self._token = self._get_bearer_token()
            return {"Authorization": f"Bearer {self._token}"}

        # Basic auth
        creds = f"{self.config.email}:{self.config.password}"
        encoded = base64.b64encode(creds.encode()).decode()
        return {"Authorization": f"Basic {encoded}"}

    def _get_bearer_token(self) -> str:
        """Authenticate and get bearer token (fallback)."""
        url = f"{self.base_url}/auth/token"
        body = json.dumps({
            "email": self.config.email,
            "password": self.config.password,
        }).encode()

        req = urllib.request.Request(
            url, data=body, method="POST",
            headers={"Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("token", data.get("access_token", ""))


# ============================================================================
# Transcript Formatter
# ============================================================================

def format_transcript(meeting: dict[str, Any]) -> str:
    """
    Convert Read.ai meeting JSON to timestamped .txt format.

    Expected meeting structure:
        title, date, duration, participants, speaker_blocks/transcript
    """
    title = meeting.get("title", "Untitled Meeting")
    date = meeting.get("date", meeting.get("start_time", "Unknown"))
    duration = meeting.get("duration", meeting.get("duration_minutes", "?"))
    meeting_id = meeting.get("id", meeting.get("meeting_id", "unknown"))

    # Participants
    participants_raw = meeting.get("participants", [])
    if isinstance(participants_raw, list):
        if participants_raw and isinstance(participants_raw[0], dict):
            names = [p.get("name", p.get("email", "?")) for p in participants_raw]
        else:
            names = participants_raw
    else:
        names = [str(participants_raw)]

    participants_str = ", ".join(names) if names else "Unknown"

    lines = [
        "=" * 55,
        "MEETING TRANSCRIPT",
        "=" * 55,
        f"Title: {title}",
        f"Date: {date}",
        f"Duration: {duration} minutes",
        f"Participants: {participants_str}",
        f"Source: Read.ai | Meeting ID: {meeting_id}",
        "=" * 55,
        "",
    ]

    # Extract transcript blocks
    blocks = (
        meeting.get("speaker_blocks")
        or meeting.get("transcript_blocks")
        or meeting.get("transcript", [])
    )

    if isinstance(blocks, str):
        # Plain text transcript
        lines.append(blocks)
    elif isinstance(blocks, list):
        for block in blocks:
            if isinstance(block, dict):
                ts = block.get("timestamp", block.get("start_time", ""))
                speaker = block.get("speaker", block.get("speaker_name", "Unknown"))
                text = block.get("text", block.get("content", ""))

                # Format timestamp (ts can be int, float, str, or None)
                if ts is not None and ts != "":
                    ts_str = str(ts)
                    if not ts_str.startswith("["):
                        ts_str = _format_timestamp(ts)
                else:
                    ts_str = ""

                if ts_str:
                    lines.append(f"[{ts_str}] {speaker}:")
                else:
                    lines.append(f"{speaker}:")
                lines.append(text)
                lines.append("")
            elif isinstance(block, str):
                lines.append(block)
    else:
        lines.append("(No transcript content available)")

    return "\n".join(lines)


def _format_timestamp(ts: Any) -> str:
    """Convert seconds/ms to HH:MM:SS format."""
    try:
        seconds = float(ts)
        # Detect if milliseconds
        if seconds > 86400:
            seconds = seconds / 1000
        h = int(seconds // 3600)
        m = int((seconds % 3600) // 60)
        s = int(seconds % 60)
        return f"{h:02d}:{m:02d}:{s:02d}"
    except (ValueError, TypeError):
        return str(ts)


# ============================================================================
# Main Harvester
# ============================================================================

class ReadAIHarvester:
    """Main harvester engine — YOLO mode."""

    def __init__(self, config: ReadAIConfig | None = None):
        self.config = config or load_config()
        self.client = ReadAIClient(self.config)
        self.router = MeetingRouter(self.config)
        self.gardener = PessoalGardener(self.config)
        self.state = _load_state(self.config.state_path)
        self._log_path = self.config.log_dir / "harvest.jsonl"

    def run(self) -> dict[str, Any]:
        """
        Main YOLO loop: paginate → download → route → checkpoint.

        Runs until all meetings processed or stop signal received.
        """
        errors = self.config.validate()
        if errors:
            return {"success": False, "errors": errors}

        self._clear_stop_signal()
        self.state.status = "running"
        self.state.started_at = datetime.utcnow().isoformat() + "Z"
        _save_state(self.state, self.config.state_path)

        self._log({"event": "harvest_started"})

        downloads_since_ingest = 0

        try:
            # Phase 1: Discover all meetings
            if not self.state.all_pages_fetched:
                self._discover_meetings()

            # Phase 2: Download and route each meeting
            all_meetings = self._get_pending_meetings()
            total = len(all_meetings)
            self._log({"event": "processing_start", "total_pending": total})

            for i, meeting_summary in enumerate(all_meetings):
                if self._should_stop():
                    self.state.status = "stopped"
                    self._log({"event": "stop_signal_received", "processed": i})
                    break

                mid = meeting_summary.get("id", meeting_summary.get("meeting_id", ""))
                if mid in self.state.processed_ids:
                    continue

                # Download full meeting
                try:
                    meeting = self.client.get_meeting(mid)
                except Exception as e:
                    self.state.meetings_failed += 1
                    self._log({"event": "download_failed", "id": mid, "error": str(e)})
                    _save_state(self.state, self.config.state_path)
                    continue

                # Format transcript
                transcript = format_transcript(meeting)

                # Save to staging
                self.config.staging_dir.mkdir(parents=True, exist_ok=True)
                staging_file = self.config.staging_dir / f"{mid}.txt"
                staging_file.write_text(transcript, encoding="utf-8")

                # Classify and route
                router_data = self._extract_router_data(meeting)
                decision = self.router.classify(router_data)

                # Generate tag
                tag = self._next_tag()

                # Move from staging to inbox
                dest = self.router.move_file(staging_file, decision, tag)

                # Update state
                self.state.processed_ids.append(mid)
                self.state.meetings_downloaded += 1
                if decision.bucket == "empresa":
                    self.state.routed_empresa += 1
                else:
                    self.state.routed_pessoal += 1
                    self.state.pessoal_since_garden += 1

                downloads_since_ingest += 1

                self._log({
                    "event": "meeting_processed",
                    "id": mid,
                    "title": decision.title,
                    "bucket": decision.bucket,
                    "score": decision.score,
                    "tag": tag,
                    "destination": str(dest),
                    "progress": f"{i + 1}/{total}",
                })

                # Checkpoint after every download
                _save_state(self.state, self.config.state_path)

                # Gardener trigger
                if (
                    self.state.pessoal_since_garden
                    >= self.config.gardener_trigger
                ):
                    self._log({"event": "gardener_triggered"})
                    result = self.gardener.run()
                    self.state.gardener_runs += 1
                    self.state.pessoal_since_garden = 0
                    self._log({
                        "event": "gardener_completed",
                        "moved": result.files_moved,
                        "themes": result.moves,
                    })
                    _save_state(self.state, self.config.state_path)

                # Ingestion trigger (logged but not auto-executed — Pipeline Jarvis
                # is a separate process that the user/skill triggers)
                if downloads_since_ingest >= self.config.ingestion_batch:
                    self._log({
                        "event": "ingestion_batch_ready",
                        "count": downloads_since_ingest,
                        "message": (
                            "Batch ready for Pipeline Jarvis ingestion. "
                            "Run /process-inbox or /jarvis-full to process."
                        ),
                    })
                    downloads_since_ingest = 0

            # Done
            if self.state.status != "stopped":
                self.state.status = "completed"

        except Exception as e:
            self.state.status = "failed"
            self._log({"event": "harvest_error", "error": str(e)})
            raise

        finally:
            self.state.stopped_at = datetime.utcnow().isoformat() + "Z"
            _save_state(self.state, self.config.state_path)

        return {
            "success": True,
            "status": self.state.status,
            "downloaded": self.state.meetings_downloaded,
            "empresa": self.state.routed_empresa,
            "pessoal": self.state.routed_pessoal,
            "failed": self.state.meetings_failed,
            "gardener_runs": self.state.gardener_runs,
        }

    def resume(self) -> dict[str, Any]:
        """Resume from last saved state."""
        if not self.config.state_path.exists():
            return {"success": False, "error": "No state file found. Run 'run' first."}

        self.state = _load_state(self.config.state_path)
        self._log({"event": "harvest_resumed", "processed_so_far": len(self.state.processed_ids)})
        return self.run()

    def stop(self) -> None:
        """Create stop signal file."""
        self.config.stop_signal.parent.mkdir(parents=True, exist_ok=True)
        self.config.stop_signal.touch()

    def status(self) -> dict[str, Any]:
        """Return current state summary."""
        state = _load_state(self.config.state_path)
        return {
            "status": state.status,
            "started_at": state.started_at,
            "stopped_at": state.stopped_at,
            "last_updated": state.last_updated,
            "meetings_discovered": state.meetings_discovered,
            "meetings_downloaded": state.meetings_downloaded,
            "meetings_failed": state.meetings_failed,
            "routed_empresa": state.routed_empresa,
            "routed_pessoal": state.routed_pessoal,
            "gardener_runs": state.gardener_runs,
            "next_tag": state.next_tag_number,
            "all_pages_fetched": state.all_pages_fetched,
        }

    # ── Internal ────────────────────────────────────────────────────────

    def _discover_meetings(self) -> None:
        """Paginate through list_meetings to discover all meeting IDs."""
        page_token = self.state.last_page_token
        discovered = self.state.meetings_discovered

        while True:
            if self._should_stop():
                break

            response = self.client.list_meetings(page_token=page_token)
            meetings = response.get("meetings", [])
            next_token = response.get("next_page_token")

            discovered += len(meetings)

            # Save meeting summaries to staging for later processing
            summaries_path = self.config.staging_dir / "meeting_summaries.jsonl"
            summaries_path.parent.mkdir(parents=True, exist_ok=True)
            with open(summaries_path, "a") as f:
                for m in meetings:
                    f.write(json.dumps(m) + "\n")

            self.state.meetings_discovered = discovered
            self.state.last_page_token = next_token

            self._log({
                "event": "page_fetched",
                "meetings_on_page": len(meetings),
                "total_discovered": discovered,
                "has_next": bool(next_token),
            })

            if not next_token:
                self.state.all_pages_fetched = True
                break

            page_token = next_token
            _save_state(self.state, self.config.state_path)

        _save_state(self.state, self.config.state_path)
        self._log({"event": "discovery_complete", "total": discovered})

    def _get_pending_meetings(self) -> list[dict[str, Any]]:
        """Load meeting summaries from staging, filter out already processed."""
        summaries_path = self.config.staging_dir / "meeting_summaries.jsonl"
        if not summaries_path.exists():
            return []

        meetings = []
        processed = set(self.state.processed_ids)
        with open(summaries_path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                m = json.loads(line)
                mid = m.get("id", m.get("meeting_id", ""))
                if mid and mid not in processed:
                    meetings.append(m)
        return meetings

    def _extract_router_data(self, meeting: dict[str, Any]) -> dict[str, Any]:
        """Extract data needed by MeetingRouter from full meeting response."""
        participants = meeting.get("participants", [])
        emails = []
        for p in participants:
            if isinstance(p, dict):
                email = p.get("email", "")
                if email:
                    emails.append(email)
            elif isinstance(p, str) and "@" in p:
                emails.append(p)

        organizer = meeting.get("organizer_email", "")
        if not organizer and meeting.get("organizer"):
            org = meeting["organizer"]
            if isinstance(org, dict):
                organizer = org.get("email", "")
            elif isinstance(org, str):
                organizer = org

        return {
            "id": meeting.get("id", meeting.get("meeting_id", "")),
            "title": meeting.get("title", ""),
            "organizer_email": organizer,
            "participants": emails,
            "description": meeting.get("description", ""),
        }

    def _next_tag(self) -> str:
        """Generate next sequential tag like [MEET-0042]."""
        num = self.state.next_tag_number
        self.state.next_tag_number = num + 1
        return f"[{self.config.tag_prefix}-{num:04d}]"

    def _should_stop(self) -> bool:
        """Check if stop signal file exists."""
        return self.config.stop_signal.exists()

    def _clear_stop_signal(self) -> None:
        """Remove stop signal if exists."""
        if self.config.stop_signal.exists():
            self.config.stop_signal.unlink()

    def _log(self, entry: dict[str, Any]) -> None:
        """Append to JSONL log."""
        self._log_path.parent.mkdir(parents=True, exist_ok=True)
        entry["timestamp"] = datetime.utcnow().isoformat() + "Z"
        with open(self._log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")


# ============================================================================
# CLI
# ============================================================================

def _print_usage():
    print("""
Read.ai Transcript Harvester
=============================

Usage:
    python3 -m core.intelligence.pipeline.read_ai_harvester <command>

Commands:
    run       Start harvesting (YOLO mode — runs until done or stopped)
    resume    Resume from last checkpoint
    stop      Send stop signal (graceful shutdown)
    status    Show current harvest status
    """)


def main():
    if len(sys.argv) < 2:
        _print_usage()
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "run":
        harvester = ReadAIHarvester()
        print("Starting Read.ai Harvest (YOLO mode)...")
        result = harvester.run()
        if result.get("success"):
            print(f"\nCompleted: {result['status']}")
            print(f"  Downloaded: {result['downloaded']}")
            print(f"  Empresa:    {result['empresa']}")
            print(f"  Pessoal:    {result['pessoal']}")
            print(f"  Failed:     {result['failed']}")
            print(f"  Gardener:   {result['gardener_runs']} runs")
        else:
            print(f"Failed: {result.get('errors', result.get('error'))}")
            sys.exit(1)

    elif command == "resume":
        harvester = ReadAIHarvester()
        print("Resuming harvest...")
        result = harvester.resume()
        if result.get("success"):
            print(f"Completed: {result['status']}")
            print(f"  Downloaded: {result['downloaded']}")
        else:
            print(f"Failed: {result.get('error')}")
            sys.exit(1)

    elif command == "stop":
        harvester = ReadAIHarvester()
        harvester.stop()
        print("Stop signal sent. Harvest will stop after current download.")

    elif command == "status":
        harvester = ReadAIHarvester()
        s = harvester.status()
        print("Read.ai Harvest Status:")
        for k, v in s.items():
            print(f"  {k}: {v}")

    else:
        print(f"Unknown command: {command}")
        _print_usage()
        sys.exit(1)


if __name__ == "__main__":
    main()
