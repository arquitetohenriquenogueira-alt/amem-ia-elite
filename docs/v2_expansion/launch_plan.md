# 📈 MÉTRICAS & PLANO DE LANÇAMENTO: Amém IA v2.0

Este documento define como mediremos o sucesso e como entregaremos as funcionalidades ao CEO.

---

## 🎯 Métricas de Sucesso (KPIs)

| Módulo | KPI Principal | Meta (90 dias) |
| :--- | :--- | :--- |
| **Devocional** | Taxa de Conclusão (Completion Rate) | > 70% dos usuários ativos. |
| **Células** | Retenção de Visitantes | 30% dos visitantes tando presença em 3 reuniões. |
| **Rede do Fiel** | Engajamento (Améns/Glórias) | Média de 10 interações por post de testemunho. |
| **Geral** | NPS (Net Promoter Score) | > 85 (Experiência Premium Elite). |

---

## 🚀 Plano de Lançamento (Fases)

### Fase 1: MVP Estrutural (Semanas 1-2)
- Implementação da nova Home com Seletor Emocional.
- Criação do Menu "Mais" com os 8 links base (IADEB Style).
- Backend: Schema inicial das tabelas `profiles` expandido.

### Fase 2: Segurança & Kids (Semanas 3-4) - [CONCLUÍDO]
- Implementação do **Módulo Kids (Sementinha)** com orações segmentadas.
- Ativação do **Parental Gate** (Controle Parental via PIN).
- Integração do **Protocolo Guardião** no Chat Pastor IA (Detecção de Risco).

### Fase 3: Brain & Community (Semanas 5-6) - [PRÓXIMO PASSO]
- Liberação do Módulo de Testemunhos (Rede do Fiel).
- Integração da IA (Gemini) para personalização dos Devocionais Emocionais.
- Testes Alpha com 5 líderes de células convidados.
- Execução da Migração de Dados Kids para o Supabase.

### Tabela: `social_posts`
- `id`: UUID (PK)
- `author_id`: UUID (FK profiles)
- `type`: TEXT (testimony, prayer_request, praise)
- `content`: TEXT
- `media_url`: TEXT
- `is_anonymous`: BOOLEAN
- `moderation_status`: TEXT (pending, approved, flagged)

### [NOVO] Módulo Kids & Segurança (v2.0 Elite)
- **kids_prayers:** Biblioteca de conteúdo lúdico.
- **kids_profiles:** Perfis vinculados a responsáveis (LGPD).
- **parental_consents:** Gestão de limites e permissões.
- **security_escalations:** Registro de eventos críticos do Protocolo Guardião.
- Lançamento Público para toda a base **Elite**.

### Fase 4: Escala & Gestão (Semanas 7-8)
- Lançamento do Dash de Gestão de Células para Líderes.
- Ativação do "Guardian Moderator" (Moderação automática social).

---

## ⚖️ Critérios de Iteração
1. Se o engajamento na Rede for baixo, simplificar o fluxo de postagem.
2. Se a IA errar o "Feeling", refinar o prompt do Sentiment Analyzer.

— Aria, arquitetando o futuro 🏗️
