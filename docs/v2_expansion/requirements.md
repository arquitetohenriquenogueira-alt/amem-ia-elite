# 📄 REQUISITOS & USER STORIES: AMÉM IA v2.0

Este documento define as funcionalidades centrais para os novos módulos, sob a perspectiva do usuário, focando na integração inteligente e engajamento.

---

## 📅 Módulo 1: Devocional Inteligente
*Foco: Personalização baseada em estado emocional (Análise de Sentimento).*

| ID | User Story | Critérios de Aceitação |
| :--- | :--- | :--- |
| US01 | "Como usuário, quero informar meu sentimento atual para receber um devocional personalizado." | Sugestões de texto/áudio/versículo baseados em 8 estados emocionais principais. |
| US02 | "Como usuário, quero que a IA me sugira orações específicas para o momento que estou vivendo." | Integração com o Mentor IA para gerar conteúdo contextual de oração. |
| US03 | "Como fiel, quero salvar meus devocionais favoritos para leitura offline." | Função de favoritos com persistência no Supabase. |

---

## 🏚️ Módulo 2: Gestão de Células
*Foco: Organização e crescimento da comunidade local.*

| ID | User Story | Critérios de Aceitação |
| :--- | :--- | :--- |
| US04 | "Como líder, quero cadastrar membros e visitantes da minha célula." | Interface de formulário simplificada com sincronização em tempo real. |
| US05 | "Como líder, quero gerar relatórios de frequência para a liderança da igreja." | Dashboard com gráficos de presença e novos convertidos. |
| US06 | "Como membro, quero localizar células próximas à minha localização (GPS)." | Mapa integrado (Google Maps) filtrando por tipo de célula. |

---

## 🤝 Módulo 3: Rede do Fiel
*Foco: Comunidade segura e edificação mútua.*

| ID | User Story | Critérios de Aceitação |
| :--- | :--- | :--- |
| US07 | "Como fiel, quero postar testemunhos em texto e imagem para edificar outros." | Feed social com curtidas (amém) e comentários (glória). |
| US08 | "Como usuário, quero publicar pedidos de oração e saber que outros estão orando por mim." | Botão "Estou Orando" que notifica o autor do pedido. |
| US09 | "Como administrador, quero que a IA modere conteúdos ofensivos ou inadequados." | Filtro automático de IA para posts/comentários antes da publicação. |

---

## 🛠️ Requisitos Não-Funcionais (NFRs)
- **Segurança:** Autenticação via Supabase com Roles (Elite vs Free).
- **Performance:** Carregamento de mídia (testemunhos) otimizado com CDN.
- **Privacidade:** Opção de anonimato para pedidos de oração sensíveis.

— Aria, arquitetando o futuro 🏗️
