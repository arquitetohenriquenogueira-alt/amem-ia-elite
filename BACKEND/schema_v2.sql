-- Amém IA - Database Schema V2 (Expansão Elite)
-- Responsibility: Churches, Communities, Cells, and Social Networking

-- 1. Igrejas (Sectores e Denominações)
CREATE TABLE IF NOT EXISTS public.churches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  denomination TEXT,
  sector TEXT, -- Setor da igreja para localização
  address TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Posts da Comunidade (Networking de Fé)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches ON DELETE SET NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  type TEXT DEFAULT 'personal', -- 'personal', 'church_activity'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Comentários
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Células (Gestão de Grupos)
CREATE TABLE IF NOT EXISTS public.cells (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID REFERENCES public.churches ON DELETE CASCADE NOT NULL,
  leader_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  schedule TEXT, -- Ex: "Terça, 20h"
  category TEXT, -- "Jovens", "Casais", etc.
  status TEXT DEFAULT 'active', -- 'active', 'inactive'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Membros da Célula
CREATE TABLE IF NOT EXISTS public.cell_members (
  cell_id UUID REFERENCES public.cells ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (cell_id, user_id)
);

-- 6. Materiais de Estudo (Biblioteca de Célula)
CREATE TABLE IF NOT EXISTS public.cell_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cell_id UUID REFERENCES public.cells ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Leads Quentes (Abandono de Funil/Checkout)
CREATE TABLE IF NOT EXISTS public.hot_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  spiritual_level TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'recovered', 'converted'
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. RLS (Row Level Security)
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cell_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cell_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_leads ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Qualquer um pode ver igrejas" ON public.churches FOR SELECT USING (true);
CREATE POLICY "Usuários podem ver todos os posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Usuários podem criar seus próprios posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem ver membros da sua célula" ON public.cell_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.cell_members WHERE cell_id = public.cell_members.cell_id AND user_id = auth.uid())
);
CREATE POLICY "Líderes podem gerenciar suas células" ON public.cells FOR ALL USING (leader_id = auth.uid());
CREATE POLICY "Anon pode inserir hot leads" ON public.hot_leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin pode gerenciar hot leads" ON public.hot_leads FOR ALL USING (true); -- Idealmente restringir por role admin futuramente
