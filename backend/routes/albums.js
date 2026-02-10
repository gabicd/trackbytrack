import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware para verificar autenticação
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Erro de autenticação' });
  }
};

// POST /api/albums/action - Salvar ação do usuário
router.post('/action', authenticateUser, async (req, res) => {
  try {
    const { albumId, isListened, isLiked, wantToListen, rating } = req.body;
    const userId = req.user.id;
    
    if (!albumId) {
      return res.status(400).json({ error: 'albumId é obrigatório' });
    }
    
    // Verificar se já existe ação para este usuário e álbum
    const { data: existingAction } = await supabaseAdmin
      .from('user_album_actions')
      .select('*')
      .eq('user_id', userId)
      .eq('album_id', albumId)
      .single();
    
    let actionData = {
      user_id: userId,
      album_id: albumId,
      updated_at: new Date().toISOString()
    };
    
    if (existingAction) {
      // UPDATE - Preservar valores existentes se não forem fornecidos
      actionData = {
        ...actionData,
        is_listened: isListened !== undefined ? isListened : existingAction.is_listened,
        is_liked: isLiked !== undefined ? isLiked : existingAction.is_liked,
        want_to_listen: wantToListen !== undefined ? wantToListen : existingAction.want_to_listen,
        user_rating: rating !== undefined ? rating : existingAction.user_rating
      };
      
      const { error } = await supabaseAdmin
        .from('user_album_actions')
        .update(actionData)
        .eq('id', existingAction.id);
      
      if (error) throw error;
      
    } else {
      // INSERT - Novo registro
      actionData = {
        ...actionData,
        is_listened: isListened || false,
        is_liked: isLiked || false,
        want_to_listen: wantToListen || false,
        user_rating: rating || null,
        created_at: new Date().toISOString()
      };
      
      const { error } = await supabaseAdmin
        .from('user_album_actions')
        .insert(actionData);
      
      if (error) throw error;
    }
    
    // Buscar estatísticas atualizadas do álbum
    const { data: stats } = await supabaseAdmin
      .from('album_stats')
      .select('*')
      .eq('album_id', albumId)
      .single();
    
    // Buscar ação atualizada do usuário
    const { data: userAction } = await supabaseAdmin
      .from('user_album_actions')
      .select('*')
      .eq('user_id', userId)
      .eq('album_id', albumId)
      .single();
    
    res.json({
      success: true,
      albumStats: stats || null,
      userAction: userAction
    });
    
  } catch (error) {
    console.error('Album action error:', error);
    
    // Verifica se é erro de validação do listened
    if (error.message && error.message.includes('Não é possível remover o status')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erro ao salvar ação' });
  }
});

// GET /api/albums/:id/stats - Buscar estatísticas do álbum
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: stats, error } = await supabaseAdmin
      .from('album_stats')
      .select('*')
      .eq('album_id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    res.json({
      albumId: id,
      avgRating: stats?.avg_rating || 0,
      totalRatings: stats?.total_ratings || 0,
      totalReviews: stats?.total_reviews || 0,
      totalListens: stats?.total_listens || 0,
      totalLikes: stats?.total_likes || 0
    });
    
  } catch (error) {
    console.error('Get album stats error:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/albums/user-actions - Buscar ações do usuário logado (para múltiplos álbuns)
router.get('/user-actions', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { albumIds } = req.query;
    
    let query = supabaseAdmin
      .from('user_album_actions')
      .select('*')
      .eq('user_id', userId);
    
    // Se fornecido array de albumIds, filtra por eles
    if (albumIds) {
      const ids = Array.isArray(albumIds) ? albumIds : [albumIds];
      query = query.in('album_id', ids);
    }
    
    const { data: actions, error } = await query;
    
    if (error) throw error;
    
    res.json({
      actions: actions || []
    });
    
  } catch (error) {
    console.error('Get user actions error:', error);
    res.status(500).json({ error: 'Erro ao buscar ações do usuário' });
  }
});

// GET /api/albums/:id/user-action - Buscar ação específica do usuário para um álbum
router.get('/:id/user-action', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { data: action, error } = await supabaseAdmin
      .from('user_album_actions')
      .select('*')
      .eq('user_id', userId)
      .eq('album_id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    res.json({
      albumId: id,
      action: action || null
    });
    
  } catch (error) {
    console.error('Get user action error:', error);
    res.status(500).json({ error: 'Erro ao buscar ação do usuário' });
  }
});

export default router;
