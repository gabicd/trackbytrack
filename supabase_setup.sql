-- ============================================
-- SCRIPT SQL PARA SUPABASE - TABELA PROFILES
-- ============================================

-- 1. CRIAR TABELA PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(15) UNIQUE NOT NULL,
    display_name VARCHAR(40) NOT NULL,
    n_listened INTEGER DEFAULT 0 CHECK (n_listened >= 0),
    n_followers INTEGER DEFAULT 0 CHECK (n_followers >= 0),
    n_following INTEGER DEFAULT 0 CHECK (n_following >= 0),
    n_lists INTEGER DEFAULT 0 CHECK (n_lists >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT username_format CHECK (
        username ~ '^[a-zA-Z0-9_]{3,15}$'
    )
);

-- 2. COMENTÁRIOS SOBRE A TABELA
COMMENT ON TABLE public.profiles IS 'Tabela de perfis dos usuários, vinculada à auth.users';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (UUID vindo do auth.users)';
COMMENT ON COLUMN public.profiles.username IS 'Nome de usuário único (3-15 caracteres, a-z, A-Z, 0-9, _)';
COMMENT ON COLUMN public.profiles.display_name IS 'Nome de exibição público do usuário (até 40 caracteres)';

-- 3. ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_followers ON public.profiles(n_followers DESC);
CREATE INDEX idx_profiles_listened ON public.profiles(n_listened DESC);

-- 4. FUNÇÃO PARA ATUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em updates
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. POLÍTICAS DE SEGURANÇA (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Todos podem ver todos os perfis (público)
CREATE POLICY "Profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Política 2: Usuário só pode inserir seu próprio perfil
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Política 3: Usuário só pode atualizar seu próprio perfil
-- Nota: Contadores (n_*) não devem ser atualizados diretamente
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Política 4: Usuário só pode deletar seu próprio perfil
CREATE POLICY "Users can delete own profile" 
    ON public.profiles FOR DELETE 
    USING (auth.uid() = id);

