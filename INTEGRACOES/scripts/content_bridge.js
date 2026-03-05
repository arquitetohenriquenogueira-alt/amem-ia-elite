import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '..', '..', '.env.local') });

/**
 * THE BRIDGE (STABLE VERSION) - Amém IA Content Automation Engine
 * Uses Official Google SDK for maximum reliability.
 */
class AmemIABridge {
    constructor() {
        this.key = process.env.GEMINI_API_KEY;
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
        
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
        1. HOOK: Gancho brutal para os primeiros 3 segundos.
        2. CONTENT: Conexão emocional profunda (storytelling).
        3. VISUALS: Sugestão de imagens/cenas para o B-Roll.
        4. CTA: Direcionamento imediato para o app amemia.com.br.
        
        Retorne APENAS um JSON puro no formato:
        { "hook": "...", "content": "...", "visuals": "...", "cta": "..." }`;

        try {
            console.log(`[DEBUG] Fetching from: ${this.baseUrl}`);
            const response = await fetch(`${this.baseUrl}?key=${this.key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            if (data.error) {
                console.error("[!] API Error:", data.error);
                return null;
            }
            if (!data.candidates || !data.candidates[0].content) {
                console.error("[!] Unexpected API structure:", JSON.stringify(data, null, 2));
                return null;
            }
            const rawText = data.candidates[0].content.parts[0].text;
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
        Inclua: 1. Contexto Histórico. 2. Raízes no Grego/Hebraico. 3. Aplicação Prática Moderna. 4. Referências Cruzadas Supremas.`;

        try {
            const response = await fetch(`${this.baseUrl}?key=${this.key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            const data = await response.json();
            const text = data.candidates[0].content.parts[0].text;
            const filePath = path.join(this.basePath, "ESTUDOS", `${topic.replace(/\s+/g, '_')}_briefing.txt`);
            if (!fs.existsSync(path.dirname(filePath))) fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, text);
            console.log(`[📓] NotebookLM Briefing saved: ${filePath}`);
            return text;
        } catch (error) {
            console.error("[!] Error in Research Generation:", error);
            return "";
        }
    }

    saveScript(name, script) {
        const textPath = path.join(this.scriptPath, `${name}.txt`);
        const csvPath = path.join(this.imagePath, "canva_bulk_import.csv");
        
        const textContent = `==== ROTEIRO PARA CAPCUT (SCRIPT TO VIDEO) ====
TÍTULO: ${script.hook}
SUGESTÃO VISUAL: ${script.visuals}

TEXTO PARA NARRAÇÃO:
${script.content}

CTA FINAL:
${script.cta}
==============================================`;

        fs.writeFileSync(textPath, textContent);
        
        // Append to Canva CSV for Bulk Create
        // Format: Title, VisualHint, Body, CTA
        const csvLine = `"${script.hook.replace(/"/g, '""')}","${script.visuals.replace(/"/g, '""')}","${script.content.replace(/"/g, '""')}","${script.cta.replace(/"/g, '""')}"\n`;
        if (!fs.existsSync(csvPath)) {
            fs.writeFileSync(csvPath, "Title,VisualHint,Body,CTA\n");
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

export async function bulkContentGeneration(themes) {
    const bridge = new AmemIABridge();
    console.log(`[🔥] STRATEGIC BULK RUN: Starting ${themes.length} generations...`);
    
    let canvaCSV = "Title,VisualHint,Body,CTA\n";
    let capcutScripts = "";
    let notebookLMBriefing = "";

    for (let i = 0; i < themes.length; i++) {
        const name = `bulk_criativo_${String(i+1).padStart(3, '0')}`;
        const script = await bridge.generateViralScript(themes[i]);
        if (script) {
            // Canva
            canvaCSV += `"${script.hook.replace(/"/g, '""')}","${script.visuals.replace(/"/g, '""')}","${script.content.replace(/"/g, '""')}","${script.cta.replace(/"/g, '""')}"\n`;
            
            // CapCut
            capcutScripts += `\n==== ROTEIRO: ${script.hook} ====\nVISUAIS: ${script.visuals}\nTEXTO: ${script.content}\nCTA: ${script.cta}\n========================\n`;

            // NotebookLM (Accumulate or return the last one as briefing example)
            const briefing = await bridge.generateNotebookLMBriefing(themes[i]);
            notebookLMBriefing += `\n# ESTUDO: ${themes[i]}\n${briefing}\n---\n`;
        }
    }

    return { canvaCSV, capcutScripts, notebookLMBriefing };
}
