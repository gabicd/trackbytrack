-- ============================================
-- SQL ADICIONAL - Adicionar coluna avatar_url (se necessário)
-- ============================================

-- Adicionar coluna avatar_url na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Comentário sobre a coluna
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL da foto de perfil do usuário (opcional)';

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar estrutura da tabela:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles';
