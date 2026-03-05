# Script de Automação Elite
# Salve este código como 'instalar_trio_elite.ps1' na raiz de qualquer novo projeto.

Write-Host "🚀 Iniciando Setup Elite (Nova + AIOS + Protocolo Sumaúma)..." -ForegroundColor Cyan

# 1. Instalar AIOS Core framework
Write-Host "📦 Instalando Synkra AIOS..." -ForegroundColor Yellow
npx aios-core install --force --quiet

# 2. Criar diretórios necessários
$agentsDir = ".aios-core\development\agents"
$commandsDir = ".gemini\commands"
if (!(Test-Path $agentsDir)) { New-Item -ItemType Directory -Path $agentsDir -Force }
if (!(Test-Path $commandsDir)) { New-Item -ItemType Directory -Path $commandsDir -Force }

# 3. Injetar a Nova (Orquestradora) em Português
Write-Host "🧠 Configurando a Nova (Orquestradora Estratégica)..." -ForegroundColor Yellow
$novaContent = @"
# Agent: Nova (Orquestradora Estratégica de Produto)

## Persona Profile
Você é **Nova**, a **Orquestradora Estratégica de Produto** e o braço direito do CEO. Sua função é atuar como a **inteligência central** que supervisiona, direciona e avalia o trabalho de todos os agentes especialistas sob sua alçada...

## Princípios Operacionais Fundamentais
1. Ceticismo Construtivo e Imparcialidade.
2. Análise Pré e Pós Abrangente (OBRIGATÓRIO).
3. Objetividade e Profissionalismo.
"@
$novaContent | Out-File -FilePath "$agentsDir\nova-orchestrator.md" -Encoding utf8

# 4. Configurar comando /nova
$commandContent = @"
description = "Nova - Orquestradora Estratégica de Produto (Supervisão Elite)"
prompt = \"\"\"
Ative a agente **Nova**:
1. Leia a definição em .aios-core/development/agents/nova-orchestrator.md
2. Assuma a posição de Orquestradora Estratégica.
3. Inicie a supervisão estratégica e aguarde comandos do CEO.
Mantenha a persona ativa até *exit.
\"\"\"
"@
$commandContent | Out-File -FilePath "$commandsDir\aios-nova.toml" -Encoding utf8

# 5. Atualizar package.json com scripts de atalho
$packagePath = "package.json"
if (Test-Path $packagePath) {
    $pj = Get-Content $packagePath | ConvertFrom-Json
    if (!$pj.scripts) { $pj | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{} }
    $pj.scripts | Add-Member -MemberType NoteProperty -Name "sync:ide:gemini" -Value "node .aios-core/development/scripts/unified-activation-pipeline.js --ide gemini" -Force
    $pj.scripts | Add-Member -MemberType NoteProperty -Name "aios:doctor" -Value "npx aios-core doctor" -Force
    $pj | ConvertTo-Json -Depth 10 | Out-File $packagePath -Encoding utf8
}

# 6. Sincronizar
Write-Host "🔄 Sincronizando agentes com o Gemini..." -ForegroundColor Yellow
npm run sync:ide:gemini

Write-Host "──────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host "🎉 Setup Elite concluído com sucesso!" -ForegroundColor Green
Write-Host "Dica: Use /nova para iniciar a orquestração estratégica." -ForegroundColor Cyan
Write-Host "──────────────────────────────────────────────────" -ForegroundColor Gray
