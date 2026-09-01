import { useState } from 'react';
import { sendMessageToAI } from '@/services/chat';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedMessage,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const result = await sendMessageToAI({
        message: trimmedMessage,
        conversationId,
      });

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        content: result.message,
      };

      setMessages((previous) => [...previous, aiMessage]);
      setConversationId(result.conversationId);
    } catch (error) {
      console.error('AI Error:', error);

      setError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();

      if (!loading) {
        handleSendMessage();
      }
    }
  };

  return (
    <>
      {/* ================================
          AI FLOATING BUTTON
      ================================= */}

      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={
          isOpen
            ? 'Close AI Assistant'
            : 'Open AI Assistant'
        }
        aria-expanded={isOpen}
        style={{
          position: 'fixed',
          right: '24px',
          bottom: '24px',
          width: '58px',
          height: '58px',
          border: 'none',
          borderRadius: '50%',
          background: '#2563eb',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          boxShadow:
            '0 8px 24px rgba(37, 99, 235, 0.35)',
          transition:
            'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.transform =
            'scale(1.06)';

          event.currentTarget.style.boxShadow =
            '0 12px 30px rgba(37, 99, 235, 0.45)';
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.transform =
            'scale(1)';

          event.currentTarget.style.boxShadow =
            '0 8px 24px rgba(37, 99, 235, 0.35)';
        }}
      >
        {isOpen ? (
          /* Close Icon */
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M6 6L18 18" />
            <path d="M18 6L6 18" />
          </svg>
        ) : (
          /* AI Icon */
          <svg
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />

            <path d="M19 16L19.7 18.3L22 19L19.7 19.7L19 22L18.3 19.7L16 19L18.3 18.3L19 16Z" />
          </svg>
        )}
      </button>

      {/* ================================
          AI CHAT WINDOW
      ================================= */}

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '94px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9998,
            boxShadow:
              '0 20px 50px rgba(15, 23, 42, 0.18)',
          }}
        >
          {/* ================================
              HEADER
          ================================= */}

          <div
            style={{
              minHeight: '64px',
              padding: '14px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#ffffff',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3L13.5 8.5L19 10L13.5 11.5L12 17L10.5 11.5L5 10L10.5 8.5L12 3Z" />

                <path d="M19 16L19.7 18.3L22 19L19.7 19.7L19 22L18.3 19.7L16 19L18.3 18.3L19 16Z" />
              </svg>
            </div>

            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#111827',
                }}
              >
                ToolShare AI
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  marginTop: '2px',
                }}
              >
                How can I help you?
              </div>
            </div>
          </div>

          {/* ================================
              MESSAGE AREA
          ================================= */}

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              background: '#f8fafc',
            }}
          >
            {/* Empty State */}

            {messages.length === 0 && (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '14px',
                  padding: '20px',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '28px',
                      marginBottom: '10px',
                    }}
                  >
                    ✨
                  </div>

                  <div
                    style={{
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '6px',
                    }}
                  >
                    Welcome to ToolShare AI
                  </div>

                  <div>
                    Ask me anything about tools,
                    bookings or ToolShare.
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}

            {messages.map((chatMessage) => {
              const isUser =
                chatMessage.role === 'user';

              return (
                <div
                  key={chatMessage.id}
                  style={{
                    display: 'flex',
                    justifyContent: isUser
                      ? 'flex-end'
                      : 'flex-start',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '80%',
                      padding: '10px 13px',
                      borderRadius: isUser
                        ? '14px 14px 4px 14px'
                        : '14px 14px 14px 4px',
                      background: isUser
                        ? '#2563eb'
                        : '#ffffff',
                      color: isUser
                        ? '#ffffff'
                        : '#1f2937',
                      border: isUser
                        ? 'none'
                        : '1px solid #e5e7eb',
                      fontSize: '14px',
                      lineHeight: 1.5,
                      wordBreak: 'break-word',
                    }}
                  >
                    {chatMessage.content}
                  </div>
                </div>
              );
            })}

            {/* Loading */}

            {loading && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius:
                      '14px 14px 14px 4px',
                    color: '#6b7280',
                    fontSize: '13px',
                  }}
                >
                  AI is typing...
                </div>
              </div>
            )}
          </div>

          {/* ================================
              ERROR
          ================================= */}

          {error && (
            <div
              style={{
                padding: '8px 14px',
                background: '#fef2f2',
                borderTop: '1px solid #fecaca',
                color: '#dc2626',
                fontSize: '12px',
              }}
            >
              {error}
            </div>
          )}

          {/* ================================
              INPUT
          ================================= */}

          <div
            style={{
              padding: '12px',
              borderTop: '1px solid #e5e7eb',
              background: '#ffffff',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask ToolShare AI..."
              disabled={loading}
              style={{
                flex: 1,
                minWidth: 0,
                height: '42px',
                padding: '0 13px',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                outline: 'none',
                fontSize: '14px',
                color: '#111827',
                background: '#ffffff',
              }}
            />

            <button
              type="button"
              onClick={handleSendMessage}
              disabled={
                loading || !message.trim()
              }
              aria-label="Send message"
              style={{
                width: '42px',
                height: '42px',
                border: 'none',
                borderRadius: '10px',
                background:
                  loading || !message.trim()
                    ? '#d1d5db'
                    : '#2563eb',
                color: '#ffffff',
                cursor:
                  loading || !message.trim()
                    ? 'not-allowed'
                    : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}