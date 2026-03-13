import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { initDatabase } from '../config/database.js';

// Model imports (for associations)
import * as models from './models/index.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import rankingRoutes from './routes/rankingRoutes.js';
import venueRoutes from './routes/venueRoutes.js';
import tournamentRegistrationRoutes from './routes/tournamentRegistrationRoutes.js';

dotenv.config();

// Parse CORS_ORIGIN comma-separated string into array
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: corsOrigins,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Socket.io middleware
io.use((socket, next) => {
  // Add authentication middleware here
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/tournaments', tournamentRegistrationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Socket.io events
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join_match', (matchId) => {
    socket.join(`match_${matchId}`);
  });

  socket.on('live_score_update', (data) => {
    io.to(`match_${data.matchId}`).emit('score_updated', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Initialize and start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initDatabase();
    
    server.listen(PORT, () => {
      console.log(`\n✓ Squash Platform Backend running on port ${PORT}`);
      console.log(`  API: http://localhost:${PORT}/api`);
      console.log(`  Environment: ${process.env.NODE_ENV}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, io };
