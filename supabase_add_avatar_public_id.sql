-- ============================================
-- SQL PARA ADICIONAR COLUNA avatar_public_id
-- ============================================

-- Adicionar coluna para armazenar o public_id do Cloudinary
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_public_id TEXT;

-- Comentário sobre a coluna
COMMENT ON COLUMN public.profiles.avatar_public_id IS 'Public ID da imagem no Cloudinary (para deletar/gerenciar)';

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar estrutura da tabela:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles';
