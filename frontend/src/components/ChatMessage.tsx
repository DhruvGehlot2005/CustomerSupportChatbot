/**
 * Chat Message Component
 * 
 * Purpose: Display a single message in the chat interface.
 * 
 * Features:
 * - User and assistant message styling
 * - Timestamp display
 * - Message content formatting
 * - Avatar icons
 * 
 * Props:
 * - role: 'user' | 'assistant'
 * - content: Message text
 * - timestamp: Message timestamp
 */

import './ChatMessage.css';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

/**
 * Chat Message Component
 */
export default function ChatMessage({ role, content, timestamp }: ChatMessageProps): JSX.Element {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`chat-message ${role}`}>
      <div className="message-avatar">
        {role === 'assistant' ? '🤖' : '👤'}
      </div>
      <div className="message-content">
        <div className="message-text">{content}</div>
        {timestamp && (
          <div className="message-timestamp">{formatTime(timestamp)}</div>
        )}
      </div>
    </div>
  );
}
