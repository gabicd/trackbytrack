-- ============================================
-- SCRIPT SQL COMPLETO - SISTEMA DE INTERAÇÕES COM ÁLBUNS
-- ============================================

-- ============================================
-- 1. TABELA album_stats (Estatísticas Agregadas)
-- ============================================

CREATE TABLE public.album_stats (
    album_id TEXT PRIMARY KEY,              -- ID do Spotify
    avg_rating DECIMAL(3,2) DEFAULT 0.00,   -- Média das avaliações (0.00 - 5.00)
    total_ratings INTEGER DEFAULT 0,        -- Quantidade de avaliações
    total_reviews INTEGER DEFAULT 0,        -- Quantidade de reviews
    total_listens INTEGER DEFAULT 0,        -- Quantidade de vezes marcado como ouvido
    total_likes INTEGER DEFAULT 0,          -- Quantidade de likes
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.album_stats IS 'Estatísticas agregadas dos álbuns para consultas rápidas';
COMMENT ON COLUMN public.album_stats.album_id IS 'ID do álbum no Spotify';
COMMENT ON COLUMN public.album_stats.avg_rating IS 'Média das avaliações dos usuários';
COMMENT ON COLUMN public.album_stats.total_ratings IS 'Número total de avaliações';

-- ============================================
-- 2. TABELA user_album_actions (Ações Individuais)
-- ============================================

CREATE TABLE public.user_album_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    album_id TEXT NOT NULL,
    is_listened BOOLEAN DEFAULT FALSE,
    is_liked BOOLEAN DEFAULT FALSE,
    want_to_listen BOOLEAN DEFAULT FALSE,
    user_rating DECIMAL(3,2) CHECK (user_rating >= 0 AND user_rating <= 5),
    listened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, album_id)
);

COMMENT ON TABLE public.user_album_actions IS 'Ações dos usuários nos álbuns (ouvido, like, rating, etc)';
COMMENT ON COLUMN public.user_album_actions.user_rating IS 'Avaliação do usuário (0-5). NULL = sem avaliação';

-- ============================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_user_actions_user ON public.user_album_actions(user_id);
CREATE INDEX idx_user_actions_album ON public.user_album_actions(album_id);
CREATE INDEX idx_user_actions_listened ON public.user_album_actions(user_id, is_listened) WHERE is_listened = TRUE;
CREATE INDEX idx_user_actions_liked ON public.user_album_actions(user_id, is_liked) WHERE is_liked = TRUE;
CREATE INDEX idx_user_actions_want ON public.user_album_actions(user_id, want_to_listen) WHERE want_to_listen = TRUE;
CREATE UNIQUE INDEX idx_user_actions_unique ON public.user_album_actions(user_id, album_id);

CREATE INDEX idx_album_stats_avg ON public.album_stats(avg_rating DESC);
CREATE INDEX idx_album_stats_likes ON public.album_stats(total_likes DESC);

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Trigger 1: Validação da remoção de listened
-- Regra: Só pode remover listened se NÃO tiver like E NÃO tiver rating
CREATE OR REPLACE FUNCTION public.validate_listened_removal()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_listened = TRUE AND NEW.is_listened = FALSE THEN
        IF NEW.is_liked = TRUE OR NEW.user_rating IS NOT NULL THEN
            RAISE EXCEPTION 'Não é possível remover o status de ouvido enquanto houver like ou avaliação';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_listened_removal
    BEFORE UPDATE ON public.user_album_actions
    FOR EACH ROW EXECUTE FUNCTION public.validate_listened_removal();

-- Trigger 2: Like/Rating → Listened automático
-- Regra: Dar like ou rating automaticamente marca como ouvido
CREATE OR REPLACE FUNCTION public.auto_mark_listened()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_liked = TRUE AND OLD.is_liked = FALSE THEN
        NEW.is_listened := TRUE;
        IF NEW.listened_at IS NULL THEN
            NEW.listened_at := NOW();
        END IF;
    END IF;
    
    IF NEW.user_rating IS NOT NULL AND OLD.user_rating IS NULL THEN
        NEW.is_listened := TRUE;
        IF NEW.listened_at IS NULL THEN
            NEW.listened_at := NOW();
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_mark_listened
    BEFORE UPDATE ON public.user_album_actions
    FOR EACH ROW EXECUTE FUNCTION public.auto_mark_listened();

-- Trigger 3: Cálculo Incremental da Média (inclui remoção de rating)
-- Regra: Recalcula avg_rating quando rating é adicionado/alterado/removido
CREATE OR REPLACE FUNCTION public.update_album_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    old_rating DECIMAL(3,2);
    new_rating DECIMAL(3,2);
BEGIN
    old_rating := COALESCE(OLD.user_rating, 0);
    new_rating := COALESCE(NEW.user_rating, 0);
    
    -- Caso 1: Novo rating (INSERT ou UPDATE de NULL para valor)
    IF OLD.user_rating IS NULL AND NEW.user_rating IS NOT NULL THEN
        -- Cria registro em album_stats se não existir
        INSERT INTO public.album_stats (album_id, avg_rating, total_ratings)
        VALUES (NEW.album_id, new_rating, 1)
        ON CONFLICT (album_id) DO UPDATE SET
            avg_rating = CASE 
                WHEN public.album_stats.total_ratings = 0 THEN new_rating
                ELSE ((public.album_stats.avg_rating * public.album_stats.total_ratings) + new_rating) / (public.album_stats.total_ratings + 1)
            END,
            total_ratings = public.album_stats.total_ratings + 1,
            updated_at = NOW();
        
    -- Caso 2: Alterou rating (UPDATE de valor para outro valor)
    ELSIF OLD.user_rating IS NOT NULL AND NEW.user_rating IS NOT NULL 
          AND OLD.user_rating != NEW.user_rating THEN
        UPDATE public.album_stats
        SET 
            avg_rating = CASE 
                WHEN total_ratings = 1 THEN new_rating
                ELSE ((avg_rating * total_ratings) - old_rating + new_rating) / total_ratings
            END,
            updated_at = NOW()
        WHERE album_id = NEW.album_id;
        
    -- Caso 3: REMOVEU rating (clicou no "X")
    ELSIF OLD.user_rating IS NOT NULL AND NEW.user_rating IS NULL THEN
        UPDATE public.album_stats
        SET 
            avg_rating = CASE 
                WHEN total_ratings <= 1 THEN 0.00
                ELSE ((avg_rating * total_ratings) - old_rating) / (total_ratings - 1)
            END,
            total_ratings = GREATEST(total_ratings - 1, 0),
            updated_at = NOW()
        WHERE album_id = NEW.album_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_album_rating_stats
    AFTER INSERT OR UPDATE ON public.user_album_actions
    FOR EACH ROW EXECUTE FUNCTION public.update_album_rating_stats();

-- Trigger 4: Contadores de Likes e Listens
-- Regra: Atualiza total_likes e total_listens em album_stats
CREATE OR REPLACE FUNCTION public.update_album_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza likes
    IF NEW.is_liked IS DISTINCT FROM OLD.is_liked THEN
        INSERT INTO public.album_stats (album_id, total_likes)
        VALUES (NEW.album_id, CASE WHEN NEW.is_liked THEN 1 ELSE 0 END)
        ON CONFLICT (album_id) DO UPDATE SET
            total_likes = CASE 
                WHEN NEW.is_liked THEN public.album_stats.total_likes + 1
                ELSE GREATEST(public.album_stats.total_likes - 1, 0)
            END,
            updated_at = NOW();
    END IF;
    
    -- Atualiza listens
    IF NEW.is_listened IS DISTINCT FROM OLD.is_listened THEN
        INSERT INTO public.album_stats (album_id, total_listens)
        VALUES (NEW.album_id, CASE WHEN NEW.is_listened THEN 1 ELSE 0 END)
        ON CONFLICT (album_id) DO UPDATE SET
            total_listens = CASE 
                WHEN NEW.is_listened THEN public.album_stats.total_listens + 1
                ELSE GREATEST(public.album_stats.total_listens - 1, 0)
            END,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_album_counters
    AFTER INSERT OR UPDATE ON public.user_album_actions
    FOR EACH ROW EXECUTE FUNCTION public.update_album_counters();

-- Trigger 5: Atualizar n_listened do usuário
-- Regra: Quando usuário marca/desmarca álbum como ouvido, atualiza contador no perfil
CREATE OR REPLACE FUNCTION public.update_user_listened_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Caso 1: Marcou como ouvido
    IF (TG_OP = 'INSERT' AND NEW.is_listened = TRUE) OR 
       (TG_OP = 'UPDATE' AND OLD.is_listened = FALSE AND NEW.is_listened = TRUE) THEN
        
        UPDATE public.profiles
        SET n_listened = n_listened + 1
        WHERE id = NEW.user_id;
        
    -- Caso 2: Desmarcou como ouvido
    ELSIF TG_OP = 'UPDATE' AND OLD.is_listened = TRUE AND NEW.is_listened = FALSE THEN
        
        UPDATE public.profiles
        SET n_listened = GREATEST(n_listened - 1, 0)
        WHERE id = NEW.user_id;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_listened_count
    AFTER INSERT OR UPDATE OF is_listened ON public.user_album_actions
    FOR EACH ROW EXECUTE FUNCTION public.update_user_listened_count();

-- ============================================
-- 5. RLS POLICIES
-- ============================================

ALTER TABLE public.album_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_album_actions ENABLE ROW LEVEL SECURITY;

-- Album stats: Todos podem ver (público)
CREATE POLICY "Album stats are viewable by everyone" 
    ON public.album_stats FOR SELECT USING (true);

-- User actions: Usuário só vê as próprias ações
CREATE POLICY "Users can view own actions" 
    ON public.user_album_actions FOR SELECT 
    USING (auth.uid() = user_id);

-- User actions: Usuário só gerencia as próprias ações
CREATE POLICY "Users can manage own actions" 
    ON public.user_album_actions FOR ALL 
    USING (auth.uid() = user_id);

-- ============================================
-- INSTRUÇÕES
-- ============================================

-- Para verificar se tudo foi criado corretamente:
-- SELECT * FROM public.album_stats LIMIT 1;
-- SELECT * FROM public.user_album_actions LIMIT 1;
-- SELECT * FROM pg_policies WHERE tablename IN ('album_stats', 'user_album_actions');
