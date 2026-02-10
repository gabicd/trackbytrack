-- ============================================
-- TRIGGER PARA ATUALIZAR n_listened DO USUÁRIO
-- ============================================

-- Trigger: Atualizar n_listened na tabela profiles quando usuário ouvir álbum
CREATE OR REPLACE FUNCTION public.update_user_listened_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Caso 1: Marcou como ouvido (INSERT ou UPDATE de false para true)
    IF (TG_OP = 'INSERT' AND NEW.is_listened = TRUE) OR 
       (TG_OP = 'UPDATE' AND OLD.is_listened = FALSE AND NEW.is_listened = TRUE) THEN
        
        UPDATE public.profiles
        SET n_listened = n_listened + 1
        WHERE id = NEW.user_id;
        
    -- Caso 2: Desmarcou como ouvido (UPDATE de true para false)
    ELSIF TG_OP = 'UPDATE' AND OLD.is_listened = TRUE AND NEW.is_listened = FALSE THEN
        
        UPDATE public.profiles
        SET n_listened = GREATEST(n_listened - 1, 0)
        WHERE id = NEW.user_id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger
CREATE TRIGGER trigger_update_user_listened_count
    AFTER INSERT OR UPDATE OF is_listened ON public.user_album_actions
    FOR EACH ROW EXECUTE FUNCTION public.update_user_listened_count();

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Verificar se trigger foi criado:
-- SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_user_listened_count';
