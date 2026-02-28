import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const key = process.env.GEMINI_API_KEY;
// Testing a super simple URL from the official docs
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

const payload = {
  contents: [{ parts: [{ text: "Reponda 'OK' se você estiver funcionando." }] }]
};

try {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("STATUS:", response.status);
    console.log("DATA:", JSON.stringify(data, null, 2));
} catch (e) {
    console.error("FETCH ERROR:", e);
}
