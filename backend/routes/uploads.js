import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const router = express.Router();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Middleware para verificar autenticação
const authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY);
  
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

// GET /api/uploads/config - Retorna configuração para upload unsigned
router.get('/config', authenticateUser, async (req, res) => {
  try {
    res.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'avatar_preset',
      folder: 'avatars'
    });
  } catch (error) {
    console.error('Config error:', error);
    res.status(500).json({ error: 'Erro ao obter configuração' });
  }
});

// POST /api/uploads/delete-avatar - Deletar avatar antigo do Cloudinary
router.post('/delete-avatar', authenticateUser, async (req, res) => {
  try {
    const { publicId } = req.body;
    
    if (!publicId) {
      return res.status(400).json({ error: 'publicId é obrigatório' });
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    res.json({
      success: true,
      result
    });
    
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ error: 'Erro ao deletar avatar' });
  }
});

export default router;
