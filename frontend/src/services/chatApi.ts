/**
 * Chat API Service
 * 
 * Purpose: Interface with the backend chat API.
 * 
 * Responsibilities:
 * - Start new conversations
 * - Send messages
 * - Retrieve session details
 * - Handle API errors
 * 
 * Integration Points:
 * - Connects to backend API endpoints
 * - Used by chat components
 */

const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * API Response Types
 */
export interface StartConversationResponse {
  sessionId: string;
  message: string;
  question?: Question;
}

export interface SendMessageResponse {
  message: string;
  question?: Question;
  resolution?: Resolution;
  requiresEscalation?: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
}

export interface Resolution {
  type: string;
  message: string;
  steps?: string[];
  escalationDetails?: {
    team: string;
    priority: string;
    estimatedResponseTime: string;
    ticketNumber: string;
  };
  referenceNumber?: string;
}

/**
 * Conversation Mode
 */
export type ConversationMode = 'SYSTEM_INITIATED' | 'USER_INITIATED';

/**
 * Start Conversation
 * 
 * Starts a new conversation with the chatbot.
 * 
 * @param mode - Conversation mode
 * @param initialMessage - Optional initial message for user-initiated mode
 * @returns Response with session ID and initial message
 */
export async function startConversation(
  mode: ConversationMode,
  initialMessage?: string
): Promise<StartConversationResponse> {
  try {
    const response = await fetch(`${API_URL}/api/chat/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        initialMessage,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ChatAPI] Error starting conversation:', error);
    throw error;
  }
}

/**
 * Send Message
 * 
 * Sends a message in an existing conversation.
 * 
 * @param sessionId - Session ID
 * @param message - User's message
 * @param questionId - Optional question ID if answering a specific question
 * @returns Response with assistant's message and next question
 */
export async function sendMessage(
  sessionId: string,
  message: string,
  questionId?: string
): Promise<SendMessageResponse> {
  try {
    const response = await fetch(`${API_URL}/api/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        message,
        questionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ChatAPI] Error sending message:', error);
    throw error;
  }
}

/**
 * Get Session
 * 
 * Retrieves session details.
 * 
 * @param sessionId - Session ID
 * @returns Session details
 */
export async function getSession(sessionId: string): Promise<any> {
  try {
    const response = await fetch(`${API_URL}/api/chat/session/${sessionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[ChatAPI] Error getting session:', error);
    throw error;
  }
}

/**
 * Check API Health
 * 
 * Checks if the backend API is accessible.
 * 
 * @returns True if API is healthy
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error('[ChatAPI] Health check failed:', error);
    return false;
  }
}
