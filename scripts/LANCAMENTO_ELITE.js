/**
 * AMÉM IA - LANCAMENTO ELITE (Marketing Automation Hub)
 * Responsibility: Generate all marketing assets for the amemia.com.br launch.
 */

import { bulkContentGeneration } from '../INTEGRACOES/scripts/content_bridge.js';
import fs from 'fs';
import path from 'path';

const domain = "amemia.com.br";
const outputDir = path.resolve("MARKETING/OUTPUT_LANCAMENTO");

async function startLaunchFactory() {
    console.log(`[🚀] BRIAN: Iniciando Fábrica de Criativos para o domínio ${domain}...`);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const launchThemes = [
        "Como a IA pode acelerar sua maturidade espiritual",
        "Protocolo Sumaúma: O guia para uma vida cristã de elite",
        "Mentoria com IA: Como ouvir a voz de Deus no caos moderno",
        "3 segredos para um devocional inabalável com Amém IA",
        "Amém IA Elite: Por que este é o seu próximo nível espiritual"
    ];

    try {
        console.log("[🎨] Gerando Kit de Lançamento em Massa...");
        const kit = await bulkContentGeneration(launchThemes);

        // Salvar os arquivos para uso manual
        fs.writeFileSync(path.join(outputDir, "canva_bulk_posts.csv"), kit.canvaCSV);
        fs.writeFileSync(path.join(outputDir, "capcut_reels_scripts.txt"), kit.capcutScripts);
        fs.writeFileSync(path.join(outputDir, "notebooklm_briefing.md"), kit.notebookLMBriefing);

        console.log(`
[✅] SUCESSO! Kit de Lançamento gerado em: ${outputDir}

PRÓXIMOS PASSOS:
1. CANVA: Importe o CSV 'canva_bulk_posts.csv' no seu Template Elite.
2. CAPCUT: Use os roteiros em 'capcut_reels_scripts.txt' na função 'Script to Video'.
3. NOTEBOOKLM: Suba o 'notebooklm_briefing.md' como fonte para gerar o Podcast do Lançamento.
        `);

    } catch (error) {
        console.error("[❌] Erro na Fábrica de Criativos:", error);
    }
}

startLaunchFactory();
