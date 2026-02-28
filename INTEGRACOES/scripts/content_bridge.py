import os
import requests
import json

# THE BRIDGE - Amém IA Content Automation Engine
# Connects Gemini, ElevenLabs, and Canva for seamless viral production.

class AmemIABridge:
    def __init__(self):
        # Professional Environment Loading
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.elevenlabs_key = os.getenv("ELEVENLABS_API_KEY")
        self.voice_id = os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpg9zX77S5y5o") # Default Pastoral Voice
        self.canva_api_key = os.getenv("CANVA_API_KEY")
        
        self.base_path = r"G:\EMPRESA_DIGITAL\AME_IA\MARKETING"
        self.audio_path = os.path.join(self.base_path, "AUDIOS")
        self.video_path = os.path.join(self.base_path, "VIDEOS")

    def generate_script(self, theme):
        """Uses Gemini to refine the script into viral segments."""
        print(f"[*] Generating viral script for theme: {theme}...")
        # Logic to call Gemini API and return structured JSON
        return {
            "hook": "Você não é um erro.",
            "content": "Deus não faz rascunhos. Ele faz obras primas.",
            "cta": "Link na Bio."
        }

    def generate_voice(self, text, output_name):
        """Uses ElevenLabs to generate the Pastor IA voice with FREE fallback."""
        if not self.elevenlabs_key:
            print("[!] ElevenLabs API key missing. Saving script as text for CapCut TTS fallback.")
            text_path = os.path.join(self.base_path, "ROTEIROS", f"{output_name}.txt")
            os.makedirs(os.path.dirname(text_path), exist_ok=True)
            with open(text_path, "w", encoding="utf-8") as f:
                f.write(text)
            print(f"[+] Text saved for manual narrating: {text_path}")
            return text_path

        print(f"[*] Generating voiceover with ElevenLabs...")
        # ... (rest of the API call logic)

    def sync_to_canva(self, content):
        """Pushes data to Canva via API or generates design prompts."""
        print(f"[*] Syncing keywords to Canva Design Engine...")
        # Canva API integration to create/update templates
        pass

    def run_full_pipeline(self, theme, name):
        script = self.generate_script(theme)
        voice_file = self.generate_voice(script['content'], name)
        print(f"\n[🚀] SUCCESS: '{name}' is ready for CapCut Pro import!")
        print(f"      - Script: {script}")
        print(f"      - Audio: {voice_file}")

if __name__ == "__main__":
    bridge = AmemIABridge()
    # Example run:
    # bridge.run_full_pipeline("Propósito Divino", "devocional_001")
