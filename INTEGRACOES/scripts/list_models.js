import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

const key = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

const response = await fetch(url);
const data = await response.json();
console.log("API Response:", data);
if (data.models) {
    const models = data.models.map(m => ({
        name: m.name,
        displayName: m.displayName,
        methods: m.supportedGenerationMethods
    }));
    process.stdout.write(JSON.stringify(models, null, 2));
} else {
    console.log("No models found in response.");
}
