#!/usr/bin/env pwsh

# ====================================================================
# SCRIPT DE INICIALIZAÇÃO: TRIO ELITE (VERSÃO 1.0)
# MANTRA: DESIGN PREMIUM | CÓDIGO LIMPO | FOCO EM LUCRO
# ====================================================================

$projectName = $args[0]
if (-not $projectName) {
    Write-Host "[!] ERRO: Forneça um nome para o projeto." -ForegroundColor Red
    Write-Host "Uso: ./init-elite.ps1 NomeDoProjeto"
    exit
}

Write-Host "`n[🚀] INICIANDO PROTOCOLO SUMAÚMA PARA: $projectName" -ForegroundColor Gold
Write-Host "--------------------------------------------------------------------"

# 1. Criação da Estrutura de Pastas Elite
$folders = @(
    "FRONTEND/public/assets",
    "FRONTEND/public/styles",
    "FRONTEND/public/scripts",
    "FRONTEND/stitch",
    "MARKETING/ROTEIROS",
    "MARKETING/CREATIVES",
    "BACKEND/api",
    "BACKEND/database"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path "./$projectName/$folder" | Out-Null
    Write-Host "[✔] Estrutura criada: $folder" -ForegroundColor Cyan
}

# 2. Criação do Arquivo de Configuração Global (Design Bible)
$globalCss = @"
:root {
    --royal-navy: #050B18;
    --premium-gold: #C8A951;
    --gold-glow: #E5D296;
    --pure-white: #FFFFFF;
}

body {
    background-color: var(--royal-navy);
    color: var(--pure-white);
    font-family: 'Inter', sans-serif;
}
"@

$globalCss | Out-File "./$projectName/FRONTEND/public/styles/global.css"
Write-Host "[✔] Design Bible (CSS) inicializado." -ForegroundColor Green

# 3. Manifesto Trio Elite (Inject)
$manifesto = Get-Content "C:\Users\Administrador\.gemini\antigravity\brain\cf96d41c-d6e6-4acb-92e9-d3ac6038d921\manifesto_trio_elite.md"
$manifesto | Out-File "./$projectName/MANIFESTO_ELITE.md"
Write-Host "[✔] Manifesto Trio Elite selado no projeto." -ForegroundColor Gold

Write-Host "`n[🏆] PROJETO $projectName ESTÁ AGORA SOB O PROTOCOLO SUMAÚMA." -ForegroundColor Gold
Write-Host "FOCO TOTAL EM ESCALA E PADRÃO TEATRO AMAZONAS.`n"
