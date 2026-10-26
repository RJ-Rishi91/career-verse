import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, isDbConnected } from './config/db.js';
import careerRoutes from './routes/careerRoutes.js';
import callRoutes from './routes/callRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import scenarioRoutes from './routes/scenarioRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  'https://career-verse.onerishi.in',
  'http://career-verse.onerishi.in',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  /\.github\.io$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some(item =>
      typeof item === 'string' ? item === origin : item.test(origin)
    );
    if (isAllowed) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key']
}));

app.use(express.json());

// Routes
app.use('/api/career', careerRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/scenarios', scenarioRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CareerVerse Backend API v1.0',
    database: isDbConnected() ? 'connected' : 'in-memory-fallback',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`[Server] CareerVerse API is running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
