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

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;
    
    if (!email || !password || !username || !displayName) {
      return res.status(400).json({ 
        error: 'Todos os campos são obrigatórios' 
      });
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        error: 'Username deve ter 3-15 caracteres, apenas letras, números e underscore' 
      });
    }
    
    const { data: existingUser } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();
    
    if (existingUser) {
      return res.status(409).json({ 
        error: 'Username já existe. Escolha outro.' 
      });
    }
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });
    
    if (authError) {
      return res.status(400).json({ error: authError.message });
    }
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        display_name: displayName
      });
    
    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        username,
        displayName
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao criar usuário' 
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    res.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      },
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile ? {
          username: profile.username,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          avatarPublicId: profile.avatar_public_id,
          nListened: profile.n_listened,
          nFollowers: profile.n_followers,
          nFollowing: profile.n_following,
          nLists: profile.n_lists
        } : null
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor' 
    });
  }
});

export default router;
