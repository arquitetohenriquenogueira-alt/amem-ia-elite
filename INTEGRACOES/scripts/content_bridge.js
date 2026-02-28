import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

/**
 * THE BRIDGE (STABLE VERSION) - Amém IA Content Automation Engine
 * Uses Official Google SDK for maximum reliability.
 */
class AmemIABridge {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
        
        this.basePath = "G:\\EMPRESA_DIGITAL\\AMEM_IA\\MARKETING";
        this.scriptPath = path.join(this.basePath, "ROTEIROS");
        this.imagePath = path.join(this.basePath, "IMAGENS");
        
        if (!fs.existsSync(this.scriptPath)) fs.mkdirSync(this.scriptPath, { recursive: true });
        if (!fs.existsSync(this.imagePath)) fs.mkdirSync(this.imagePath, { recursive: true });
    }

    async generateViralScript(theme) {
        console.log(`[*] Generating viral script for theme: ${theme}...`);
        
        const prompt = `Você é Brian, o Mega Brain da Amém IA.
        
        OBJETIVO: Criar um roteiro de vídeo curto (Reels/TikTok) ultra-persuasivo.
        TEMA: "${theme}"
        PÚBLICO: Cristãos que buscam profundidade espiritual.
        
        O roteiro deve ter:
        1. HOOK: Gancho brutal.
        2. CONTENT: Conexão emocional profunda.
        3. CTA: Direcionamento imediato para o app Amém IA.
        
        Retorne APENAS um JSON puro no formato:
        { "hook": "...", "content": "...", "cta": "..." }`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const rawText = response.text();
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            return JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
        } catch (error) {
            console.error("[!] Error in Gemini Generation:", error);
            return null;
        }
    }

    async generateNotebookLMBriefing(topic) {
        console.log(`[*] Preparing NotebookLM research briefing for: ${topic}...`);
        const prompt = `Como Brian, compile os fundamentos teológicos mais profundos sobre "${topic}" para servir de base no NotebookLM. 
        Inclua: 
        1. Contexto Histórico.
        2. Raízes no Grego/Hebraico.
        3. Aplicação Prática Moderna.
        4. Referências Cruzadas Supremas.`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const filePath = path.join(this.basePath, "ESTUDOS", `${topic.replace(/\s+/g, '_')}_briefing.txt`);
            if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, text);
            console.log(`[📓] NotebookLM Briefing saved: ${filePath}`);
        } catch (error) {
            console.error("[!] Error in Research Generation:", error);
        }
    }

    saveScript(name, script) {
        const textPath = path.join(this.scriptPath, `${name}.txt`);
        const csvPath = path.join(this.imagePath, "canva_bulk_import.csv");
        
        const textContent = `==== ROTEIRO PARA CAPCUT (SCRIPT TO VIDEO) ====
TÍTULO: ${script.hook}

TEXTO PARA NARRAÇÃO:
${script.content}

CTA FINAL:
${script.cta}
==============================================`;

        fs.writeFileSync(textPath, textContent);
        
        // Append to Canva CSV for Bulk Create
        const csvLine = `"${name}","${script.hook.replace(/"/g, '""')}","${script.content.replace(/"/g, '""')}"\n`;
        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, "ID,Title,Body\n");
        }
        fs.appendFileSync(csvPath, csvLine);
        
        console.log(`[+] Script saved to: ${textPath}`);
        console.log(`[+] Canva CSV updated for Bulk Create: ${csvPath}`);
    }

    async bulkContentGeneration(themes) {
        console.log(`[🔥] STRATEGIC BULK RUN: Starting ${themes.length} generations...`);
        for (let i = 0; i < themes.length; i++) {
            const name = `bulk_criativo_${String(i+1).padStart(3, '0')}`;
            await this.run(themes[i], name);
            // NotebookLM Briefing for each themes as well
            await this.generateNotebookLMBriefing(themes[i]);
        }
    }

    async run(theme, name) {
        const script = await this.generateViralScript(theme);
        if (script) {
            this.saveScript(name, script);
            console.log(`[🚀] SUCCESS: Content '${name}' automated and ready for Canva/CapCut!`);
        }
    }
}

// Production Run (Henrique CEO Mode)
const bridge = new AmemIABridge();

// Example Themes for Strategic Launch
const launchThemes = [
    "Como ouvir a voz de Deus no silêncio",
    "O poder do decreto profético matinal",
    "Ansiedade vs Confiança: A batalha da mente",
    "Finanças sob a óptica do Reino",
    "A cura que vem através do louvor"
];

bridge.bulkContentGeneration(launchThemes);
