/**
 * Session Management Service
 * 
 * Purpose: Manage conversation sessions in memory.
 * 
 * Responsibilities:
 * - Create new sessions
 * - Retrieve existing sessions
 * - Update session state
 * - Clean up expired sessions
 * 
 * Design:
 * - In-memory storage (Map) for demo purposes
 * - Session timeout handling
 * - Thread-safe operations
 * 
 * Integration Points:
 * - Used by conversation service to maintain state
 * - Referenced by all API endpoints
 * 
 * Note: In production, this would use a database or Redis.
 */

import { v4 as uuidv4 } from 'uuid';
import { ConversationSession, ConversationMode, Message } from '../types';
import { SESSION_CONFIG } from '../config/constants';

/**
 * In-Memory Session Store
 * 
 * Maps session ID to conversation session.
 * In production, this would be replaced with a database.
 */
const sessions = new Map<string, ConversationSession>();

/**
 * Session Cleanup Interval
 * 
 * Periodically removes expired sessions to prevent memory leaks.
 */
let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Initialize Session Service
 * 
 * Starts the cleanup interval for expired sessions.
 * Should be called when the server starts.
 */
export function initializeSessionService(): void {
  // Clean up expired sessions every 5 minutes
  cleanupInterval = setInterval(() => {
    cleanupExpiredSessions();
  }, 5 * 60 * 1000);
  
  console.log('[SessionService] Initialized with cleanup interval');
}

/**
 * Shutdown Session Service
 * 
 * Stops the cleanup interval.
 * Should be called when the server shuts down.
 */
export function shutdownSessionService(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  
  console.log('[SessionService] Shutdown complete');
}

/**
 * Create Session
 * 
 * Creates a new conversation session.
 * 
 * @param mode - Conversation mode (system-initiated or user-initiated)
 * @param initialMessage - Optional initial message from user (for user-initiated mode)
 * @returns New conversation session
 */
export function createSession(
  mode: ConversationMode,
  initialMessage?: string
): ConversationSession {
  const sessionId = uuidv4();
  const now = new Date();
  
  const session: ConversationSession = {
    sessionId,
    mode,
    answers: {},
    conversationHistory: [],
    createdAt: now,
    updatedAt: now,
    resolved: false
  };
  
  // Add initial user message if provided
  if (initialMessage) {
    session.conversationHistory.push({
      id: uuidv4(),
      role: 'user',
      content: initialMessage,
      timestamp: now
    });
  }
  
  // Check if we're at capacity
  if (sessions.size >= SESSION_CONFIG.MAX_ACTIVE_SESSIONS) {
    // Remove oldest session
    const oldestSessionId = Array.from(sessions.keys())[0];
    sessions.delete(oldestSessionId);
    console.log(`[SessionService] Removed oldest session ${oldestSessionId} due to capacity`);
  }
  
  sessions.set(sessionId, session);
  
  console.log(`[SessionService] Created session ${sessionId} in ${mode} mode`);
  
  return session;
}

/**
 * Get Session
 * 
 * Retrieves an existing session by ID.
 * 
 * @param sessionId - Session ID
 * @returns Session if found, undefined otherwise
 */
export function getSession(sessionId: string): ConversationSession | undefined {
  const session = sessions.get(sessionId);
  
  if (!session) {
    console.log(`[SessionService] Session ${sessionId} not found`);
    return undefined;
  }
  
  // Check if session has expired
  const now = new Date();
  const elapsed = now.getTime() - session.updatedAt.getTime();
  
  if (elapsed > SESSION_CONFIG.TIMEOUT_MS) {
    console.log(`[SessionService] Session ${sessionId} expired`);
    sessions.delete(sessionId);
    return undefined;
  }
  
  return session;
}

/**
 * Update Session
 * 
 * Updates an existing session with new data.
 * 
 * @param sessionId - Session ID
 * @param updates - Partial session data to update
 * @returns Updated session, or undefined if not found
 */
export function updateSession(
  sessionId: string,
  updates: Partial<ConversationSession>
): ConversationSession | undefined {
  const session = getSession(sessionId);
  
  if (!session) {
    return undefined;
  }
  
  // Merge updates
  const updatedSession: ConversationSession = {
    ...session,
    ...updates,
    updatedAt: new Date()
  };
  
  sessions.set(sessionId, updatedSession);
  
  console.log(`[SessionService] Updated session ${sessionId}`);
  
  return updatedSession;
}

/**
 * Add Message to Session
 * 
 * Adds a message to the conversation history.
 * 
 * @param sessionId - Session ID
 * @param role - Message role (user, assistant, system)
 * @param content - Message content
 * @param metadata - Optional metadata
 * @returns Updated session, or undefined if not found
 */
export function addMessage(
  sessionId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, unknown>
): ConversationSession | undefined {
  const session = getSession(sessionId);
  
  if (!session) {
    return undefined;
  }
  
  // Check message limit
  if (session.conversationHistory.length >= SESSION_CONFIG.MAX_MESSAGES) {
    console.log(`[SessionService] Session ${sessionId} reached message limit`);
    // Remove oldest messages to make room
    session.conversationHistory = session.conversationHistory.slice(-50);
  }
  
  const message: Message = {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date(),
    metadata
  };
  
  session.conversationHistory.push(message);
  session.updatedAt = new Date();
  
  sessions.set(sessionId, session);
  
  console.log(`[SessionService] Added ${role} message to session ${sessionId}`);
  
  return session;
}

/**
 * Add Answer to Session
 * 
 * Records a user's answer to a specific question.
 * 
 * @param sessionId - Session ID
 * @param questionId - Question ID
 * @param answer - User's answer
 * @returns Updated session, or undefined if not found
 */
export function addAnswer(
  sessionId: string,
  questionId: string,
  answer: string
): ConversationSession | undefined {
  const session = getSession(sessionId);
  
  if (!session) {
    return undefined;
  }
  
  session.answers[questionId] = answer;
  session.updatedAt = new Date();
  
  sessions.set(sessionId, session);
  
  console.log(`[SessionService] Added answer for question ${questionId} in session ${sessionId}`);
  
  return session;
}

/**
 * Mark Session as Resolved
 * 
 * Marks a session as resolved with the final resolution.
 * 
 * @param sessionId - Session ID
 * @param resolution - Final resolution
 * @returns Updated session, or undefined if not found
 */
export function markSessionResolved(
  sessionId: string,
  resolution: ConversationSession['resolution']
): ConversationSession | undefined {
  const session = getSession(sessionId);
  
  if (!session) {
    return undefined;
  }
  
  session.resolved = true;
  session.resolution = resolution;
  session.updatedAt = new Date();
  
  sessions.set(sessionId, session);
  
  console.log(`[SessionService] Marked session ${sessionId} as resolved`);
  
  return session;
}

/**
 * Delete Session
 * 
 * Removes a session from storage.
 * 
 * @param sessionId - Session ID
 * @returns True if deleted, false if not found
 */
export function deleteSession(sessionId: string): boolean {
  const deleted = sessions.delete(sessionId);
  
  if (deleted) {
    console.log(`[SessionService] Deleted session ${sessionId}`);
  }
  
  return deleted;
}

/**
 * Clean Up Expired Sessions
 * 
 * Removes all sessions that have exceeded the timeout.
 * Called periodically by the cleanup interval.
 */
function cleanupExpiredSessions(): void {
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [sessionId, session] of sessions.entries()) {
    const elapsed = now.getTime() - session.updatedAt.getTime();
    
    if (elapsed > SESSION_CONFIG.TIMEOUT_MS) {
      sessions.delete(sessionId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`[SessionService] Cleaned up ${cleanedCount} expired sessions`);
  }
}

/**
 * Get Session Count
 * 
 * Returns the number of active sessions.
 * Useful for monitoring and debugging.
 * 
 * @returns Number of active sessions
 */
export function getSessionCount(): number {
  return sessions.size;
}

/**
 * Get All Sessions
 * 
 * Returns all active sessions.
 * For debugging purposes only.
 * 
 * @returns Array of all sessions
 */
export function getAllSessions(): ConversationSession[] {
  return Array.from(sessions.values());
}
