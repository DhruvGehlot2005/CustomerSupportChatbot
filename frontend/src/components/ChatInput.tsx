/**
 * Chat Input Component
 * 
 * Purpose: Input area for user messages in the chat interface.
 * 
 * Features:
 * - Text input with auto-resize
 * - Send button
 * - Quick reply options (for choice questions)
 * - Loading state
 * - Enter to send (Shift+Enter for new line)
 * 
 * Props:
 * - onSend: Callback when message is sent
 * - disabled: Whether input is disabled
 * - placeholder: Input placeholder text
 * - options: Quick reply options
 */

import { useState, KeyboardEvent } from 'react';
import './ChatInput.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  options?: string[];
  label?: string;
}

/**
 * Chat Input Component
 */
export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  options,
  label,
}: ChatInputProps): JSX.Element {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleOptionClick = (option: string) => {
    if (!disabled) {
      onSend(option);
    }
  };

  return (
    <div className="chat-input-container">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-wrapper">
          {label && <div className="input-label">{label}</div>}
          
          <textarea
            className="chat-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
          />
          
          {options && options.length > 0 && (
            <div className="quick-options">
              {options.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  className="quick-option-btn"
                  onClick={() => handleOptionClick(option)}
                  disabled={disabled}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-send"
          disabled={disabled || !message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
