/**
 * Chat API Routes
 * 
 * Purpose: Define HTTP endpoints for chat interactions.
 * 
 * Endpoints:
 * - POST /api/chat/start - Start a new conversation
 * - POST /api/chat/message - Send a message in existing conversation
 * - GET /api/chat/session/:sessionId - Get session details
 * 
 * Integration Points:
 * - Uses all services to orchestrate conversation flow
 * - Manages request/response cycle
 * - Handles errors gracefully
 */

import { Router, Request, Response } from 'express';
import { 
  ConversationMode,
  StartConversationRequest,
  StartConversationResponse,
  SendMessageRequest,
  SendMessageResponse,
  Resolution,
  QuestionType,
  ResolutionType
} from '../types';
import * as sessionService from '../services/sessionService';
import * as classificationService from '../services/classificationService';
import * as responseService from '../services/responseService';
import { ERROR_MESSAGES } from '../config/constants';

const router = Router();

/**
 * POST /api/chat/start
 * 
 * Start a new conversation session with intelligent greeting.
 * 
 * Request Body:
 * - mode: 'SYSTEM_INITIATED' | 'USER_INITIATED'
 * - initialMessage?: string (for user-initiated mode)
 * 
 * Response:
 * - sessionId: string
 * - message: string (greeting or initial response)
 * - question?: Question (first question if applicable)
 * - options?: string[] (quick reply options)
 */
router.post('/start', async (req: Request, res: Response): Promise<void> => {
  try {
    const { mode, initialMessage }: StartConversationRequest = req.body;
    
    // Validate mode
    if (!mode || !Object.values(ConversationMode).includes(mode)) {
      return res.status(400).json({
        error: 'Invalid conversation mode'
      });
    }
    
    console.log(`[ChatRoutes] Starting ${mode} conversation`);
    
    // Create session
    const session = sessionService.createSession(mode, initialMessage);
    
    // Generate greeting
    const greeting = await responseService.generateGreeting(mode);
    
    // Add greeting to session
    sessionService.addMessage(session.sessionId, 'assistant', greeting);
    
    const response: StartConversationResponse = {
      sessionId: session.sessionId,
      message: greeting
    };
    
    // For system-initiated mode, present category options
    if (mode === ConversationMode.SYSTEM_INITIATED) {
      const categoryOptions = await responseService.generateCategoryOptions();
      sessionService.addMessage(session.sessionId, 'assistant', categoryOptions);
      response.message = `${greeting}\n\n${categoryOptions}`;
      
      // Add category options as quick replies
      response.question = {
        id: 'category_selection',
        text: categoryOptions,
        type: QuestionType.SINGLE_CHOICE,
        options: [
          'Orders & Delivery',
          'Payments & Refunds',
          'Products & Quality',
          'Account & Access',
          'Something Else'
        ]
      };
    }
    
    // For user-initiated mode with initial message, use intelligent response
    if (mode === ConversationMode.USER_INITIATED && initialMessage) {
      const { generateIntelligentResponse } = await import('../services/geminiService');
      
      const intelligentResponse = await generateIntelligentResponse(
        initialMessage,
        session.conversationHistory,
        {
          isFirstInteraction: true,
          mode: 'USER_INITIATED'
        }
      );
      
      sessionService.addMessage(session.sessionId, 'assistant', intelligentResponse);
      response.message = `${greeting}\n\n${intelligentResponse}`;
      
      // Classify the issue
      const classification = await classificationService.classifyIssue(
        initialMessage,
        session.conversationHistory
      );
      
      sessionService.updateSession(session.sessionId, {
        category: classification.category,
        confidence: classification.confidence
      });
      
      // Check if we should provide options
      const { shouldProvideOptions } = await import('../services/intelligentConversationService');
      const optionsCheck = await shouldProvideOptions(intelligentResponse, classification.category);
      if (optionsCheck.shouldProvide && optionsCheck.options) {
        response.question = {
          id: 'initial_question',
          text: intelligentResponse,
          type: QuestionType.SINGLE_CHOICE,
          options: optionsCheck.options
        };
      }
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('[ChatRoutes] Error starting conversation:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.API_ERROR
    });
  }
});

/**
 * POST /api/chat/message
 * 
 * Send a message in an existing conversation.
 * Uses intelligent conversation handling for better responses.
 * 
 * Request Body:
 * - sessionId: string
 * - message: string
 * - questionId?: string (if answering a specific question)
 * 
 * Response:
 * - message: string (assistant's response)
 * - question?: Question (next question if applicable)
 * - resolution?: Resolution (if issue is resolved)
 * - requiresEscalation?: boolean
 * - options?: string[] (quick reply options)
 */
router.post('/message', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId, message }: SendMessageRequest = req.body;
    
    // Validate input
    if (!sessionId || !message) {
      return res.status(400).json({
        error: 'Session ID and message are required'
      });
    }
    
    console.log(`[ChatRoutes] Processing message for session ${sessionId}`);
    
    // Get session
    const session = sessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({
        error: ERROR_MESSAGES.SESSION_NOT_FOUND
      });
    }
    
    // Add user message to session
    sessionService.addMessage(sessionId, 'user', message);
    
    const response: SendMessageResponse = {
      message: ''
    };
    
    // Check if this question was already answered
    const { checkIfAlreadyAnswered, extractKeyInformation } = 
      await import('../services/intelligentConversationService');
    
    const previousAnswer = checkIfAlreadyAnswered(session.conversationHistory, message);
    if (previousAnswer) {
      console.log('[ChatRoutes] Question already answered, returning previous response');
      sessionService.addMessage(sessionId, 'assistant', previousAnswer);
      response.message = previousAnswer;
      return res.json(response);
    }
    
    // If session doesn't have a category yet, classify the message
    if (!session.category) {
      const classification = await classificationService.classifyIssue(
        message,
        session.conversationHistory
      );
      
      // Update session
      sessionService.updateSession(sessionId, {
        category: classification.category,
        confidence: classification.confidence
      });
      
      // Use intelligent conversation to determine next action
      const { generateIntelligentResponse } = await import('../services/geminiService');
      const intelligentResponse = await generateIntelligentResponse(
        message,
        session.conversationHistory,
        {
          category: classification.category,
          confidence: classification.confidence,
          isFirstInteraction: true
        }
      );
      
      sessionService.addMessage(sessionId, 'assistant', intelligentResponse);
      response.message = intelligentResponse;
      
      // Check if we should provide options
      const { shouldProvideOptions } = await import('../services/intelligentConversationService');
      const optionsCheck = await shouldProvideOptions(intelligentResponse, classification.category);
      if (optionsCheck.shouldProvide && optionsCheck.options) {
        response.question = {
          id: 'dynamic_question_1',
          text: intelligentResponse,
          type: QuestionType.SINGLE_CHOICE,
          options: optionsCheck.options
        };
      }
      
      return res.json(response);
    }
    
    // Use intelligent conversation service to determine next action
    const { determineNextAction, generateSolution, handleOutOfScope } = 
      await import('../services/intelligentConversationService');
    
    const updatedSession = sessionService.getSession(sessionId);
    if (!updatedSession) {
      return res.status(404).json({ error: ERROR_MESSAGES.SESSION_NOT_FOUND });
    }
    
    // Extract collected information from conversation (using function imported earlier)
    const collectedInfo = extractKeyInformation(updatedSession.conversationHistory);
    collectedInfo.category = updatedSession.category;
    collectedInfo.messageCount = updatedSession.conversationHistory.length;
    
    console.log('[ChatRoutes] Collected info:', collectedInfo);
    
    const nextAction = await determineNextAction(
      updatedSession.conversationHistory,
      updatedSession.category,
      collectedInfo
    );
    
    console.log(`[ChatRoutes] Next action: ${nextAction.action} - ${nextAction.reasoning}`);
    
    switch (nextAction.action) {
      case 'ask_question':
        // Need more information
        sessionService.addMessage(sessionId, 'assistant', nextAction.response);
        response.message = nextAction.response;
        
        // Check if we should provide options
        const { shouldProvideOptions: checkOptions } = await import('../services/intelligentConversationService');
        const optionsCheck = await checkOptions(nextAction.response, updatedSession.category);
        if (optionsCheck.shouldProvide && optionsCheck.options) {
          response.question = {
            id: `dynamic_question_${Date.now()}`,
            text: nextAction.response,
            type: QuestionType.SINGLE_CHOICE,
            options: optionsCheck.options
          };
        }
        break;
        
      case 'provide_solution':
        // Generate comprehensive solution
        const solution = await generateSolution(
          updatedSession.conversationHistory,
          updatedSession.category!,
          collectedInfo
        );
        
        sessionService.addMessage(sessionId, 'assistant', solution);
        
        // Mark as resolved
        const resolution: Resolution = {
          type: ResolutionType.INFORMATION_PROVIDED,
          message: solution
        };
        
        sessionService.markSessionResolved(sessionId, resolution);
        
        response.message = solution;
        response.resolution = resolution;
        break;
        
      case 'escalate':
        // Escalate to human agent
        const ticketNumber = `TKT-${Date.now()}`;
        const escalationMessage = `${nextAction.response}\n\nI've created ticket #${ticketNumber} for our support team. They'll contact you within 24 hours via email.`;
        
        sessionService.addMessage(sessionId, 'assistant', escalationMessage);
        
        const escalationResolution: Resolution = {
          type: ResolutionType.ESCALATE_AGENT,
          message: escalationMessage,
          escalationDetails: {
            team: 'Customer Support Team',
            priority: 'medium',
            estimatedResponseTime: '24 hours',
            ticketNumber
          },
          referenceNumber: ticketNumber
        };
        
        sessionService.markSessionResolved(sessionId, escalationResolution);
        
        response.message = escalationMessage;
        response.resolution = escalationResolution;
        response.requiresEscalation = true;
        break;
        
      case 'out_of_scope':
        // Handle out of scope
        const outOfScopeResponse = await handleOutOfScope(message);
        sessionService.addMessage(sessionId, 'assistant', outOfScopeResponse);
        response.message = outOfScopeResponse;
        break;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('[ChatRoutes] Error processing message:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.API_ERROR
    });
  }
});

/**
 * GET /api/chat/session/:sessionId
 * 
 * Get details about a conversation session.
 * 
 * Response:
 * - session: ConversationSession
 */
router.get('/session/:sessionId', (req: Request, res: Response): void => {
  try {
    const { sessionId } = req.params;
    
    const session = sessionService.getSession(sessionId);
    
    if (!session) {
      return res.status(404).json({
        error: ERROR_MESSAGES.SESSION_NOT_FOUND
      });
    }
    
    res.json({ session });
    
  } catch (error) {
    console.error('[ChatRoutes] Error getting session:', error);
    res.status(500).json({
      error: ERROR_MESSAGES.API_ERROR
    });
  }
});

/**
 * GET /api/chat/health
 * 
 * Health check for chat service.
 */
router.get('/health', (_req: Request, res: Response) => {
  const sessionCount = sessionService.getSessionCount();
  
  res.json({
    status: 'ok',
    activeSessions: sessionCount,
    timestamp: new Date().toISOString()
  });
});

export default router;
