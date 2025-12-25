/**
 * Backend Entry Point
 * 
 * Purpose: Initialize and start the Express server for the AI customer support system.
 * 
 * Dependencies:
 * - Express: Web framework for API endpoints
 * - dotenv: Environment variable management
 * - CORS: Cross-origin resource sharing for frontend communication
 * 
 * Integration Points:
 * - Connects to Gemini API for NLU/NLG
 * - Serves REST API for frontend React application
 * - Manages in-memory session state
 */

import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import chatRoutes from './routes/chatRoutes';
import orderChatRoutes from './routes/orderChatRoutes';
import * as sessionService from './services/sessionService';
import * as geminiService from './services/geminiService';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app: Application = express();

// Configuration from environment variables with fallback defaults
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Middleware Configuration
 */

// Enable CORS for frontend communication
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

/**
 * Request Logging Middleware
 * 
 * Logs all incoming requests for debugging and monitoring.
 */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * API Routes
 */

// Chat endpoints (old free-text system)
app.use('/api/chat', chatRoutes);

// Order-based chat endpoints (new option-based system)
app.use('/api/order-chat', orderChatRoutes);

/**
 * Health Check Endpoint
 * 
 * Purpose: Verify server is running and responsive
 * Method: GET
 * Path: /health
 * Response: { status: 'ok', timestamp: ISO string }
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    activeSessions: sessionService.getSessionCount()
  });
});

/**
 * Root Endpoint
 * 
 * Purpose: Basic API information
 * Method: GET
 * Path: /
 * Response: API name and version
 */
app.get('/', (req, res) => {
  res.json({
    name: 'AI Customer Support API',
    version: '1.0.0',
    description: 'Backend API for AI-powered customer support chatbot',
    endpoints: {
      health: '/health',
      chat: {
        start: 'POST /api/chat/start',
        message: 'POST /api/chat/message',
        session: 'GET /api/chat/session/:sessionId',
        health: 'GET /api/chat/health'
      }
    }
  });
});

/**
 * Error Handling Middleware
 * 
 * Catches and handles any unhandled errors.
 */
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Server] Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * Initialize Services
 * 
 * Initializes all backend services before starting the server.
 */
async function initializeServices(): Promise<void> {
  console.log('[Server] Initializing services...');
  
  try {
    // Initialize Gemini service
    geminiService.initializeGeminiService();
    console.log('[Server] ✓ Gemini service initialized');
    
    // Initialize session service
    sessionService.initializeSessionService();
    console.log('[Server] ✓ Session service initialized');
    
    // Test Gemini connection
    const geminiConnected = await geminiService.testGeminiConnection();
    if (geminiConnected) {
      console.log('[Server] ✓ Gemini API connection verified');
    } else {
      console.warn('[Server] ⚠ Gemini API connection failed - using fallback mode');
    }
    
  } catch (error) {
    console.error('[Server] ✗ Service initialization failed:', error);
    throw error;
  }
}

/**
 * Shutdown Handler
 * 
 * Gracefully shuts down services when server stops.
 */
function setupShutdownHandlers(): void {
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    sessionService.shutdownSessionService();
    console.log('[Server] Shutdown complete');
    process.exit(0);
  };
  
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

/**
 * Start Server
 * 
 * Initializes services and starts listening on configured port.
 */
async function startServer(): Promise<void> {
  try {
    // Initialize all services
    await initializeServices();
    
    // Set up shutdown handlers
    setupShutdownHandlers();
    
    // Start listening
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('[Server] 🚀 AI Customer Support API is running');
      console.log('='.repeat(60));
      console.log(`[Server] Port: ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`[Server] Frontend URL: ${FRONTEND_URL}`);
      console.log(`[Server] API Base: http://localhost:${PORT}`);
      console.log(`[Server] Health Check: http://localhost:${PORT}/health`);
      console.log(`[Server] Chat API: http://localhost:${PORT}/api/chat`);
      console.log('='.repeat(60) + '\n');
    });
    
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Export app for testing purposes
export default app;
