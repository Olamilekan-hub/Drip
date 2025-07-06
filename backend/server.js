// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Drip Live Streaming API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      events: '/api/events',
      tickets: '/api/tickets',
      history: '/api/history',
      content: '/api/content',
      analytics: '/api/analytics'
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'API endpoint not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Drip Server Running
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🕒 Started: ${new Date().toISOString()}
  `);
});