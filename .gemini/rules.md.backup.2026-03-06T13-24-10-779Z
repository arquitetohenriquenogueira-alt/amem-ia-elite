# Regras do Gemini - Synkra AIOS

Este arquivo define as instruções do projeto para o Gemini CLI neste repositório.

<!-- AIOS-MANAGED-START: core -->
## Regras Principais

1. Siga a Constituição em `.aios-core/constitution.md` (v1.1.0 - Liderado pelo Produto pela Nova)
2. Priorize `CLI Primeiro -> Observabilidade Segundo -> UI Terceira`
3. Ative `@nova` para decisões estratégicas e supervisão de produto.
4. Trabalhe por histórias (stories) em `docs/stories/`
5. Não invente requisitos fora dos artefatos existentes
<!-- AIOS-MANAGED-END: core -->

<!-- AIOS-MANAGED-START: quality -->
## Portões de Qualidade

- Execute `npm run lint`
- Execute `npm run typecheck`
- Execute `npm test`
- Atualize a checklist e a lista de arquivos da história antes de concluir
<!-- AIOS-MANAGED-END: quality -->

<!-- AIOS-MANAGED-START: codebase -->
## Mapa do Projeto

- Framework central: `.aios-core/`
- Pontos de entrada da CLI: `bin/`
- Pacotes compartilhados: `packages/`
- Testes: `tests/`
- Documentação: `docs/`
<!-- AIOS-MANAGED-END: codebase -->

<!-- AIOS-MANAGED-START: gemini-integration -->
## Integração com Gemini

Fonte da verdade dos agentes:
- Canônico: `.aios-core/development/agents/*.md`
- Espelhado para Gemini: `.gemini/rules/AIOS/agents/*.md`

Hooks e configurações:
- Hooks locais: `.gemini/hooks/`
- Configurações locais: `.gemini/settings.json`

Sempre que houver divergência, execute:
- `npm run sync:ide:gemini`
- `npm run validate:gemini-sync`
- `npm run validate:gemini-integration`
<!-- AIOS-MANAGED-END: gemini-integration -->

<!-- AIOS-MANAGED-START: parity -->
## Paridade Multi-IDE

Para garantir a paridade entre Claude Code, Codex e Gemini:
- `npm run validate:parity`
- `npm run validate:paths`
<!-- AIOS-MANAGED-END: parity -->

<!-- AIOS-MANAGED-START: activation -->
## Ativação de Agentes

Preferência de ativação:
1. Use agentes em `.gemini/rules/AIOS/agents/`
2. Se necessário, use a fonte canônica em `.aios-core/development/agents/`

Ao ativar um agente:
- Carregue a definição completa do agente
- Renderize a saudação via `node .aios-core/development/scripts/generate-greeting.js <agent-id>`
- Mantenha a persona ativa até `*exit`

Atalhos recomendados no Gemini:
- `/aios-menu` para listar agentes
- `/aios-<agent-id>` (ex: `/aios-dev`, `/aios-architect`)
- `/aios-agent <agent-id>` para lançador genérico
- `/nova` para a Orquestradora Estratégica
<!-- AIOS-MANAGED-END: activation -->

<!-- AIOS-MANAGED-START: commands -->
## Comandos Comuns

- `npm run sync:ide`
- `npm run sync:ide:check`
- `npm run sync:ide:gemini`
- `npm run validate:gemini-sync`
- `npm run validate:gemini-integration`
- `npm run validate:parity`
- `npm run validate:structure`
- `npm run validate:agents`
<!-- AIOS-MANAGED-END: commands -->
