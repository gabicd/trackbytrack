import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import discogsRoutes from './routes/discogs.js';
import authRoutes from './routes/auth.js';
import albumsRoutes from './routes/albums.js';
import usersRoutes from './routes/users.js';
import uploadsRoutes from './routes/uploads.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS - Permitir qualquer origem durante desenvolvimento
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para lidar com preflight OPTIONS
app.options('*', cors());
app.use(express.json());

// Logger simples
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/api/discogs', discogsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/albums', albumsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/uploads', uploadsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'trackbytrack-backend',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`
 Backend TrackByTrack rodando!
 URL: http://localhost:${PORT}
 Endpoints:
   - GET /health
   - POST /api/auth/register
   - POST /api/auth/login
   - GET /api/users/:username/profile
   - GET /api/users/me (protegido)
   - PUT /api/users/me (protegido)
   - GET /api/users/check-username/:username
   - POST /api/albums/action (protegido)
   - GET /api/albums/:id/stats
   - GET /api/albums/user-actions (protegido)
   - GET /api/albums/:id/user-action (protegido)
   - GET /api/discogs/search?artist=xxx&album=xxx
   - GET /api/discogs/release/:id
   - GET /api/discogs/cache/stats
   - POST /api/discogs/cache/clear
 Cache: Ativo (TTL: 24h)
  `);
});
