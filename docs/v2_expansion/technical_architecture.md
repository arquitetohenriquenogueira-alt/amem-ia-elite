# 🏗️ ARQUITETURA TÉCNICA: AMÉM IA v2.0

Este documento detalha o "Backbone" necessário para sustentar a expansão para Devocional, Células e Rede Social.

---

## 💾 Modelagem de Dados (Supabase)

### Tabela: `devotionals`
- `id`: UUID (PK)
- `emotion_tag`: TEXT (ansiedade, alegria, luto, etc)
- `content_json`: JSONB (versículo, reflexão, oração_sugerida)
- `ai_generated`: BOOLEAN

### Tabela: `cells`
- `id`: UUID (PK)
- `leader_id`: UUID (FK profiles)
- `name`: TEXT
- `location`: GEOGRAPHY(POINT)
- `meeting_day`: INTEGER (0-6)
- `type`: TEXT (jovens, casais, kids)

### Tabela: `social_posts`
- `id`: UUID (PK)
- `author_id`: UUID (FK profiles)
- `type`: TEXT (testimony, prayer_request, praise)
- `content`: TEXT
- `media_url`: TEXT
- `is_anonymous`: BOOLEAN
- `moderation_status`: TEXT (pending, approved, flagged)

---

## 📡 APIs & Endpoints (REST)

### 🧩 Devocional IA
- `GET /api/devotional/suggest?emotion=xxx` -> Retorna conteúdo personalizado.
- `POST /api/devotional/favorite` -> Salva no perfil do usuário.

### 🧩 Comunidade
- `GET /api/cells/nearby?lat=xxx&lng=xxx` -> Busca geográfica de células.
- `POST /api/social/post` -> Envio de testemunho com trigger de moderação IA.
- `POST /api/social/pray` -> Incrementa contador de intercessão.

---

## 🧠 Integração com IA (Google Gemini)

1.  **Sentiment Analyzer:** Analisa o check-in emocional do usuário para priorizar categorias de conteúdo.
2.  **Devotional Generator:** Cria reflexões curtas e bíblicas se não houver conteúdo pré-definido para determinado sentimento.
3.  **Guardian Moderator:** Serviço que intercepta `social_posts` para garantir o ambiente seguro (Rede do Fiel).

---

## 🚀 Estratégia de Escalabilidade
- **Storage:** Uso do Supabase Storage para imagens de testemunhos e avatares.
- **Células:** Índices espaciais no PostGIS para busca por localização.
- **Realtime:** Supabase Realtime para notificações de "Alguém orou por você".

— Aria, arquitetando o futuro 🏗️
