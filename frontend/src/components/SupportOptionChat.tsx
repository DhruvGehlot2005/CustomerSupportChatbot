/**
 * Support Option-Based Chat
 *
 * Purpose: Provide an option-only support chat for the general Support page.
 *
 * Flow:
 * 1. Ask user to select which product they need help with
 * 2. Once selected, use the order-chat API with that product context
 * 3. Function exactly like the OrderChat component
 */

import { useEffect, useRef, useState } from 'react';
import './OrderChat.css';
import { PRODUCTS } from '../data/products';

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

const API_URL = import.meta.env.VITE_API_URL || '';

export default function SupportOptionChat(): JSX.Element {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<ChatOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productSelected, setProductSelected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Show product selection on mount
    initializeProductSelection();
  }, []);

  const initializeProductSelection = () => {
    const greeting = 'Hello! I\'m here to help you with your order.\n\nWhich product did you order that you have a query about?';
    
    setMessages([{
      id: Date.now().toString(),
      type: 'bot',
      content: greeting,
      timestamp: new Date()
    }]);

    // Create options from products
    const productOptions = PRODUCTS.map(product => ({
      id: product.id,
      text: product.name
    }));

    setOptions(productOptions);
  };

  const handleProductSelect = async (_productId: string, productName: string) => {
    if (loading) return;

    // Add user selection to messages
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: productName,
      timestamp: new Date()
    }]);

    setProductSelected(true);
    setLoading(true);
    setError(null);

    try {
      // Start order chat session with selected product
      const response = await fetch(`${API_URL}/api/order-chat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `SUPPORT-${Date.now()}`,
          customerName: 'Customer',
          productName: productName,
          deliveryStatus: 'processing',
          deliveryDate: undefined
        })
      });

      if (!response.ok) throw new Error('Failed to start chat');

      const data = await response.json();
      
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, {
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
        <div className="order-chat-title"><span className="chat-icon">💬</span><span>Support</span></div>
      </div>

      <div className="order-chat-messages">
        {messages.map(m => (
          <div key={m.id} className={`order-chat-message ${m.type}`}>
            <div className="message-avatar">{m.type === 'bot' ? '🤖' : '👤'}</div>
            <div className="message-bubble">{m.content}</div>
          </div>
        ))}

        {loading && (
          <div className="order-chat-message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-bubble typing"><span></span><span></span><span></span></div>
          </div>
        )}

        {error && <div className="order-chat-error">⚠️ {error}</div>}

        <div ref={messagesEndRef} />
      </div>

      {!resolved && options.length > 0 && (
        <div className="order-chat-options">
          <div className="options-label">Please select an option:</div>
          <div className="options-grid">
            {options.map(opt => (
              <button 
                key={opt.id} 
                className="option-button" 
                onClick={() => productSelected ? handleOptionSelect(opt.id, opt.text) : handleProductSelect(opt.id, opt.text)} 
                disabled={loading}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {resolved && (
        <div className="order-chat-resolved">
          <div className="resolved-icon">✓</div>
          <div className="resolved-text">Chat Ended</div>
        </div>
      )}
    </div>
  );
}
