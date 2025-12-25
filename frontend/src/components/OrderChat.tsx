/**
 * Order-Based Chat Component
 * 
 * Purpose: Option-based chat interface for order-specific support.
 * 
 * Features:
 * - No free text input, only option selection
 * - Order context passed at initialization
 * - Structured conversation flow
 * - Clear resolution or escalation
 */

import { useState, useEffect, useRef } from 'react';
import './OrderChat.css';

interface ChatOption {
  id: string;
  text: string;
}

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface OrderChatProps {
  orderId: string;
  customerName: string;
  productName: string;
  deliveryStatus: 'delivered' | 'in_transit' | 'processing';
  deliveryDate?: string;
  onClose?: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function OrderChat({
  orderId,
  customerName,
  productName,
  deliveryStatus,
  deliveryDate,
  onClose
}: OrderChatProps): JSX.Element {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<ChatOption[]>([]);
  const [resolved, setResolved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat on mount
  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/order-chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          customerName,
          productName,
          deliveryStatus,
          deliveryDate
        })
      });

      if (!response.ok) throw new Error('Failed to start chat');

      const data = await response.json();
      
      setSessionId(data.sessionId);
      setMessages([{
        id: Date.now().toString(),
        type: 'bot',
        content: data.message,
        timestamp: new Date()
      }]);
      setOptions(data.options || []);

    } catch (err) {
      console.error('Failed to initialize chat:', err);
      setError('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = async (optionId: string, optionText: string) => {
    if (!sessionId || loading) return;

    // Add user selection to messages
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: optionText,
      timestamp: new Date()
    }]);

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/order-chat/select-option`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          optionId
        })
      });

      if (!response.ok) throw new Error('Failed to process selection');

      const data = await response.json();

      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: data.message,
        timestamp: new Date()
      }]);

      // Update options
      setOptions(data.options || []);

      // Check if resolved
      if (data.resolved) {
        setResolved(true);
      }

    } catch (err) {
      console.error('Failed to process option:', err);
      setError('Failed to process your selection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="order-chat-container">
      <div className="order-chat-header">
        <div className="order-chat-title">
          <span className="chat-icon">💬</span>
          <span>Order Support</span>
        </div>
        {onClose && (
          <button className="btn-close-chat" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="order-chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`order-chat-message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'bot' ? '🤖' : '👤'}
            </div>
            <div className="message-bubble">
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="order-chat-message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="order-chat-error">
            ⚠️ {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {!resolved && options.length > 0 && (
        <div className="order-chat-options">
          <div className="options-label">Please select an option:</div>
          <div className="options-grid">
            {options.map(option => (
              <button
                key={option.id}
                className="option-button"
                onClick={() => handleOptionSelect(option.id, option.text)}
                disabled={loading}
              >
                {option.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {resolved && (
        <div className="order-chat-resolved">
          <div className="resolved-icon">✓</div>
          <div className="resolved-text">Chat Ended</div>
          {onClose && (
            <button className="btn-close-resolved" onClick={onClose}>
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}
