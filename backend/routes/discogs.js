import express from 'express';
import axios from 'axios';
import { cache } from '../cache/memoryCache.js';

const router = express.Router();
const DISCOGS_API_BASE = 'https://api.discogs.com';

// GET /api/discogs/search?artist=xxx&album=xxx
router.get('/search', async (req, res) => {
  try {
    const { artist, album } = req.query;
    
    if (!artist || !album) {
      return res.status(400).json({ 
        error: 'Parâmetros artist e album são obrigatórios' 
      });
    }

    // Verifica cache primeiro
    const cached = cache.get(artist, album);
    if (cached) {
      return res.json({
        ...cached,
        fromCache: true,
        cachedAt: new Date().toISOString()
      });
    }

    // Se não está no cache, busca na API Discogs
    console.log(`🔍 Buscando na Discogs API: ${artist} - ${album}`);
    
    const response = await axios.get(
      `${DISCOGS_API_BASE}/database/search`,
      {
        params: {
          q: `${album} ${artist}`,
          type: 'release',
          key: process.env.DISCOGS_CONSUMER_KEY,
          secret: process.env.DISCOGS_CONSUMER_SECRET
        },
        timeout: 10000
      }
    );

    const data = response.data;

    // Salva no cache se encontrou resultados
    if (data.results && data.results.length > 0) {
      cache.set(artist, album, data);
    }

    res.json({
      ...data,
      fromCache: false
    });

  } catch (error) {
    console.error('❌ Discogs search error:', error.message);
    res.status(500).json({ 
      error: 'Erro ao buscar na Discogs API',
      message: error.message 
    });
  }
});

// GET /api/discogs/release/:id
router.get('/release/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const response = await axios.get(
      `${DISCOGS_API_BASE}/releases/${id}`,
      {
        params: {
          key: process.env.DISCOGS_CONSUMER_KEY,
          secret: process.env.DISCOGS_CONSUMER_SECRET
        },
        timeout: 10000
      }
    );

    res.json(response.data);
    
  } catch (error) {
    console.error('❌ Discogs release error:', error.message);
    res.status(500).json({ 
      error: 'Erro ao buscar detalhes do release',
      message: error.message 
    });
  }
});

// GET /api/discogs/cache/stats - Estatísticas do cache
router.get('/cache/stats', (req, res) => {
  res.json(cache.stats());
});

// POST /api/discogs/cache/clear - Limpa cache (para debug)
router.post('/cache/clear', (req, res) => {
  const size = cache.clear();
  res.json({ message: `Cache limpo: ${size} itens removidos` });
});

export default router;
