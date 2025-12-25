/**
 * Chat Component
 * 
 * Purpose: Main chat interface component.
 * 
 * Features:
 * - Message display area
 * - Input area
 * - Mode selection (System-Initiated vs User-Initiated)
 * - Connection to backend API
 * - Loading and error states
 * - Auto-scroll to latest message
 * - Resolution display
 * 
 * Integration:
 * - Uses chatApi service for backend communication
 * - Manages conversation state
 * - Handles both conversation modes
 */

import { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import {
  startConversation,
  sendMessage as sendMessageApi,
  ConversationMode,
  Question,
  Resolution,
} from '../services/chatApi';
import './Chat.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Chat Component
 */
export default function Chat(): JSX.Element {
  const [mode, setMode] = useState<ConversationMode | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Start Conversation
   */
  const handleStartConversation = async (selectedMode: ConversationMode, initialMessage?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await startConversation(selectedMode, initialMessage);
      
      setMode(selectedMode);
      setSessionId(response.sessionId);
      
      // Add assistant's initial message
      addMessage('assistant', response.message);
      
      // Set current question if provided
      if (response.question) {
        setCurrentQuestion(response.question);
      } else {
        setCurrentQuestion(null);
      }
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError('Failed to connect to support. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send Message
   */
  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;

    // Add user message to UI
    addMessage('user', content);
    
    setLoading(true);
    setError(null);

    try {
      const response = await sendMessageApi(
        sessionId,
        content,
        currentQuestion?.id
      );
      
      // Add assistant's response
      addMessage('assistant', response.message);
      
      // Update current question
      if (response.question) {
        setCurrentQuestion(response.question);
      } else {
        setCurrentQuestion(null);
      }
      
      // Set resolution if provided
      if (response.resolution) {
        setResolution(response.resolution);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add Message to Chat
   */
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  /**
   * Reset Chat
   */
  const handleReset = () => {
    setMode(null);
    setSessionId(null);
    setMessages([]);
    setCurrentQuestion(null);
    setResolution(null);
    setError(null);
  };

  /**
   * Mode Selection Screen
   */
  if (!mode) {
    return (
      <div className="chat-container">
        <div className="chat-mode-selection">
          <h2>How can we help you today?</h2>
          <p>Choose how you'd like to get support:</p>
          
          <div className="mode-options">
            <button
              className="mode-option"
              onClick={() => handleStartConversation('SYSTEM_INITIATED')}
              disabled={loading}
            >
              <div className="mode-icon">🗂️</div>
              <h3>Guided Support</h3>
              <p>Let us guide you through common issues step by step</p>
            </button>
            
            <button
              className="mode-option"
              onClick={() => handleStartConversation('USER_INITIATED', '')}
              disabled={loading}
            >
              <div className="mode-icon">💬</div>
              <h3>Describe Your Issue</h3>
              <p>Tell us what's wrong and we'll help you resolve it</p>
            </button>
          </div>
          
          {loading && <div className="loading-spinner">Connecting...</div>}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  /**
   * Chat Interface
   */
  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <h3>Customer Support</h3>
          <span className="chat-status">
            {resolution ? '✓ Resolved' : '● Active'}
          </span>
        </div>
        <button className="btn-reset" onClick={handleReset}>
          New Chat
        </button>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.timestamp}
          />
        ))}
        
        {loading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        {error && (
          <div className="chat-error">
            <span>⚠️ {error}</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {!resolution && (
        <ChatInput
          onSend={handleSendMessage}
          disabled={loading}
          placeholder={
            currentQuestion
              ? 'Type your answer...'
              : 'Type your message...'
          }
          options={currentQuestion?.options}
          label={currentQuestion ? 'Please answer:' : undefined}
        />
      )}
      
      {resolution && (
        <div className="chat-resolved">
          <div className="resolved-message">
            <span className="resolved-icon">✓</span>
            <span>This conversation has been resolved.</span>
          </div>
          <button className="btn-new-chat" onClick={handleReset}>
            Start New Conversation
          </button>
        </div>
      )}
    </div>
  );
}
