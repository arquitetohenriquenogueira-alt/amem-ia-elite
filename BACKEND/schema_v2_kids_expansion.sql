-- EXPANSÃO AMÉM IA v2.0: Módulo Kids e Segurança
-- Integração de tabelas para Orações, Perfis Infantis e Consentimento

-- 1. Biblioteca de Orações Kids
CREATE TABLE IF NOT EXISTS kids_prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    age_min INTEGER,
    age_max INTEGER,
    content_text TEXT NOT NULL,
    audio_url TEXT,
    image_url TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Perfis Infantis (Sub-contas da Família)
CREATE TABLE IF NOT EXISTS kids_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardian_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age INTEGER,
    avatar_url TEXT,
    xp_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    daily_streak INTEGER DEFAULT 0,
    accepted_terms BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Consentimento Parental e Segurança
CREATE TABLE IF NOT EXISTS parental_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardian_id UUID REFERENCES profiles(id),
    consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    allowed_features JSONB -- { "community": false, "audio": true, "max_screen_time_min": 30 }
);

-- 4. Logs de Segurança (Escalonamento Crítico) 
-- Nota: Apenas acessível por moderadores autorizados sob LGPD
CREATE TABLE IF NOT EXISTS security_escalations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    risk_level TEXT, -- 'low', 'medium', 'high'
    detected_keywords TEXT[],
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    assigned_pastor_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
