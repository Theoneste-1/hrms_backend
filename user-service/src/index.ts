import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { logger } from './config/logger';
import { redisClient } from './config/redisClient';
import { prismaClient } from './config/prismaClient';
import { errorHandler } from './middlewares/errorHandler';
import { authMiddleware } from './middlewares/authMiddleware';

// Import routes
import userRoutes from './routes/users';
import profileRoutes from './routes/profiles';
import preferenceRoutes from './routes/preferences';
import relationshipRoutes from './routes/relationships';
import analyticsRoutes from './routes/analytics';
import teamRoutes from './routes/teams';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'user-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/v1/users', authMiddleware, userRoutes);
app.use('/api/v1/profiles', authMiddleware, profileRoutes);
app.use('/api/v1/preferences', authMiddleware, preferenceRoutes);
app.use('/api/v1/relationships', authMiddleware, relationshipRoutes);
app.use('/api/v1/analytics', authMiddleware, analyticsRoutes);
app.use('/api/v1/teams', authMiddleware, teamRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await redisClient.quit();
  await prismaClient.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  await redisClient.quit();
  await prismaClient.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  logger.info(`User service started on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
});

export default app;
