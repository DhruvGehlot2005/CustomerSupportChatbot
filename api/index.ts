/**
 * Vercel Serverless Function Entry Point
 * 
 * Purpose: Export Express app for Vercel serverless deployment
 */

import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes';
import orderChatRoutes from './routes/orderChatRoutes';
import * as sessionService from './services/sessionService';
import * as geminiService from './services/geminiService';

// Initialize Express application
const app: Application = express();

// Enable CORS for all origins in production
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize services on cold start
try {
  geminiService.initializeGeminiService();
  sessionService.initializeSessionService();
  console.log('[API] Services initialized');
} catch (error) {
  console.error('[API] Service initialization error:', error);
}

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/order-chat', orderChatRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeSessions: sessionService.getSessionCount()
  });
});

// Root endpoint
app.get('/api', (_req: Request, res: Response) => {
  res.json({
    name: 'AI Customer Support API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[API] Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// Export for Vercel serverless
export default app;
