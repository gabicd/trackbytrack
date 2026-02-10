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
  
  console.log('Auth header received:', authHeader ? 'Present' : 'Missing');
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  console.log('Token extracted, length:', token.length);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Supabase auth error:', error);
      return res.status(401).json({ error: 'Token inválido', details: error.message });
    }
    
    if (!user) {
      console.error('No user found for token');
      return res.status(401).json({ error: 'Token inválido - usuário não encontrado' });
    }
    
    console.log('User authenticated:', user.id);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Erro de autenticação' });
  }
};

// GET /api/users/:username/profile - Buscar perfil público
router.get('/:username/profile', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'Username é obrigatório' });
    }
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, username, display_name, n_listened, n_followers, n_following, n_lists, avatar_url, avatar_public_id, created_at')
      .eq('username', username)
      .single();
    
    if (error || !profile) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({
      user: {
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name,
        nListened: profile.n_listened,
        nFollowers: profile.n_followers,
        nFollowing: profile.n_following,
        nLists: profile.n_lists,
        avatarUrl: profile.avatar_url,
        avatarPublicId: profile.avatar_public_id,
        createdAt: profile.created_at
      }
    });
    
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /api/users/me - Buscar perfil do usuário logado
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !profile) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    res.json({
      user: {
        id: profile.id,
        username: profile.username,
        displayName: profile.display_name,
        nListened: profile.n_listened,
        nFollowers: profile.n_followers,
        nFollowing: profile.n_following,
        nLists: profile.n_lists,
        avatarUrl: profile.avatar_url,
        avatarPublicId: profile.avatar_public_id,
        createdAt: profile.created_at
      }
    });
    
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// PUT /api/users/me - Atualizar perfil próprio
router.put('/me', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { displayName, username, avatarUrl, avatarPublicId } = req.body;
    
    // Validações
    if (!displayName || !username) {
      return res.status(400).json({ error: 'Username e displayName são obrigatórios' });
    }
    
    // Validar formato do username
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        error: 'Username deve ter 3-15 caracteres, apenas letras, números e underscore' 
      });
    }
    
    // Validar displayName
    if (displayName.length > 40) {
      return res.status(400).json({ error: 'Nome de exibição deve ter no máximo 40 caracteres' });
    }
    
    // Buscar username atual
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();
    
    // Se username mudou, verificar disponibilidade
    if (username !== currentProfile.username) {
      const { data: existingUser } = await supabaseAdmin
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        return res.status(409).json({ error: 'Username já existe' });
      }
    }
    
    // Atualizar perfil
    const updateData = {
      username,
      display_name: displayName,
      updated_at: new Date().toISOString()
    };
    
    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl;
    }
    
    if (avatarPublicId !== undefined) {
      updateData.avatar_public_id = avatarPublicId;
    }
    
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedProfile.id,
        username: updatedProfile.username,
        displayName: updatedProfile.display_name,
        nListened: updatedProfile.n_listened,
        nFollowers: updatedProfile.n_followers,
        nFollowing: updatedProfile.n_following,
        nLists: updatedProfile.n_lists,
        avatarUrl: updatedProfile.avatar_url,
        avatarPublicId: updatedProfile.avatar_public_id,
        createdAt: updatedProfile.created_at
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// GET /api/users/check-username/:username - Verificar disponibilidade do username
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();
    
    res.json({
      available: !data,
      username
    });
    
  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({ error: 'Erro ao verificar username' });
  }
});

export default router;
