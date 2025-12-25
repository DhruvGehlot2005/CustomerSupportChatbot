/**
 * Order-Based Chat Routes
 * 
 * Purpose: Handle order-specific, option-based chat conversations.
 * 
 * Features:
 * - Initialize chat with order context
 * - Option-based navigation only (no free text)
 * - Structured decision trees
 * - Automatic resolution or escalation
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  generateInitialGreeting,
  getChatStep,
  ChatStep
} from '../config/orderChatFlow';

const router = Router();

// In-memory storage for order chat sessions
interface OrderChatSession {
  sessionId: string;
  orderId: string;
  customerName: string;
  productName: string;
  deliveryStatus: 'delivered' | 'in_transit' | 'processing';
  deliveryDate?: string;
  currentStep: string;
  conversationHistory: Array<{
    type: 'bot' | 'user';
    message: string;
    timestamp: Date;
  }>;
  resolved: boolean;
  ticketNumber?: string;
}

const orderChatSessions = new Map<string, OrderChatSession>();

/**
 * POST /api/order-chat/start
 * 
 * Initialize order-specific chat with order context
 * 
 * Request Body:
 * - orderId: string
 * - customerName: string
 * - productName: string
 * - deliveryStatus: 'delivered' | 'in_transit' | 'processing'
 * - deliveryDate?: string
 */
router.post('/start', (req: Request, res: Response): void => {
  try {
    const {
      orderId,
      customerName,
      productName,
      deliveryStatus,
      deliveryDate
    } = req.body;

    // Validate required fields
    if (!orderId || !customerName || !productName || !deliveryStatus) {
      return res.status(400).json({
        error: 'Missing required fields: orderId, customerName, productName, deliveryStatus'
      });
    }

    // Create session
    const sessionId = uuidv4();
    
    // Generate initial greeting
    const initialStep = generateInitialGreeting(
      customerName,
      productName,
      deliveryStatus,
      deliveryDate
    );

    // Create session
    const session: OrderChatSession = {
      sessionId,
      orderId,
      customerName,
      productName,
      deliveryStatus,
      deliveryDate,
      currentStep: 'initial',
      conversationHistory: [
        {
          type: 'bot',
          message: initialStep.message,
          timestamp: new Date()
        }
      ],
      resolved: false
    };

    orderChatSessions.set(sessionId, session);

    console.log(`[OrderChat] Started session ${sessionId} for order ${orderId}`);

    res.json({
      sessionId,
      message: initialStep.message,
      options: initialStep.options
    });

  } catch (error) {
    console.error('[OrderChat] Error starting chat:', error);
    res.status(500).json({
      error: 'Failed to start chat session'
    });
  }
});

/**
 * POST /api/order-chat/select-option
 * 
 * Handle user option selection
 * 
 * Request Body:
 * - sessionId: string
 * - optionId: string
 */
router.post('/select-option', (req: Request, res: Response): void => {
  try {
    const { sessionId, optionId } = req.body;

    if (!sessionId || !optionId) {
      return res.status(400).json({
        error: 'Missing required fields: sessionId, optionId'
      });
    }

    // Get session
    const session = orderChatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    // Get current step
    let currentStep: ChatStep;
    if (session.currentStep === 'initial') {
      currentStep = generateInitialGreeting(
        session.customerName,
        session.productName,
        session.deliveryStatus,
        session.deliveryDate
      );
    } else {
      const step = getChatStep(session.currentStep);
      if (!step) {
        return res.status(400).json({
          error: 'Invalid current step'
        });
      }
      currentStep = step;
    }

    // Find selected option
    const selectedOption = currentStep.options.find(opt => opt.id === optionId);
    if (!selectedOption) {
      return res.status(400).json({
        error: 'Invalid option selected'
      });
    }

    // Add user selection to history
    session.conversationHistory.push({
      type: 'user',
      message: selectedOption.text,
      timestamp: new Date()
    });

    // Handle next step
    if (selectedOption.nextStep === 'RESOLVE') {
      // Resolve conversation
      session.resolved = true;
      const message = selectedOption.resolutionMessage || 'Thank you for contacting us!';
      
      session.conversationHistory.push({
        type: 'bot',
        message,
        timestamp: new Date()
      });

      console.log(`[OrderChat] Session ${sessionId} resolved`);

      return res.json({
        message,
        resolved: true,
        options: []
      });
    }

    if (selectedOption.nextStep === 'ESCALATE') {
      // Escalate to support team
      session.resolved = true;
      const ticketNumber = `TKT-${Date.now()}`;
      session.ticketNumber = ticketNumber;

      let message = selectedOption.resolutionMessage || 
        'I\'ve escalated your issue to our support team. They\'ll contact you within 24 hours.';
      
      // Replace {timestamp} placeholder with actual ticket number
      message = message.replace('{timestamp}', Date.now().toString());

      session.conversationHistory.push({
        type: 'bot',
        message,
        timestamp: new Date()
      });

      console.log(`[OrderChat] Session ${sessionId} escalated with ticket ${ticketNumber}`);

      return res.json({
        message,
        resolved: true,
        escalated: true,
        ticketNumber,
        options: []
      });
    }

    // Move to next step
    const nextStep = getChatStep(selectedOption.nextStep!);
    if (!nextStep) {
      return res.status(400).json({
        error: 'Invalid next step'
      });
    }

    session.currentStep = selectedOption.nextStep!;
    
    session.conversationHistory.push({
      type: 'bot',
      message: nextStep.message,
      timestamp: new Date()
    });

    console.log(`[OrderChat] Session ${sessionId} moved to step ${nextStep.id}`);

    res.json({
      message: nextStep.message,
      options: nextStep.options,
      resolved: false
    });

  } catch (error) {
    console.error('[OrderChat] Error selecting option:', error);
    res.status(500).json({
      error: 'Failed to process option selection'
    });
  }
});

/**
 * GET /api/order-chat/session/:sessionId
 * 
 * Get session details
 */
router.get('/session/:sessionId', (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;

    const session = orderChatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }

    res.json({ session });

  } catch (error) {
    console.error('[OrderChat] Error getting session:', error);
    res.status(500).json({
      error: 'Failed to get session'
    });
  }
});

export default router;
