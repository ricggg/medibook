"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Design tokens matching your landing page ──
const C = {
  blueDark:    '#1e3c7d',
  blue:        '#2563eb',
  blueLight:   '#3b82f6',
  green:       '#10b981',
  greenDark:   '#059669',
  textPrimary: '#0f1729',
  textMuted:   '#64748b',
  textLight:   '#9ca3af',
  border:      '#e8ecf0',
  page:        '#f0f4f8',
};

const GRAD = {
  primary: 'linear-gradient(135deg, #1e3c7d, #2563eb)',
  green:   'linear-gradient(135deg, #059669, #10b981)',
};

// ── Types ──
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Suggested questions ──
const SUGGESTED_QUESTIONS = [
  "How much does MediBook cost?",
  "How long does setup take?",
  "Can patients book without an account?",
  "What's included in the free trial?",
  "How does MediBook reduce no-shows?",
  "Is MediBook HIPAA compliant?",
];

// ── Typing indicator ──
function TypingIndicator() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '12px 16px',
      background: C.page,
      borderRadius: '18px 18px 18px 4px',
      width: 'fit-content',
      border: `1px solid ${C.border}`,
    }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: C.blue,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
}

// ── Message bubble ──
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        marginBottom: 12,
      }}
    >
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: GRAD.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(37,99,235,0.3)',
        }}>
          🤖
        </div>
      )}

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        padding: '11px 15px',
        borderRadius: isUser
          ? '18px 18px 4px 18px'
          : '18px 18px 18px 4px',
        background: isUser ? GRAD.primary : C.page,
        color: isUser ? '#fff' : C.textPrimary,
        fontSize: 13.5,
        lineHeight: 1.6,
        border: isUser ? 'none' : `1px solid ${C.border}`,
        boxShadow: isUser
          ? '0 4px 12px rgba(37,99,235,0.25)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {message.content}
      </div>

      {/* User avatar */}
      {isUser && (
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #64748b, #94a3b8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          flexShrink: 0,
        }}>
          👤
        </div>
      )}
    </motion.div>
  );
}

// ── Main ChatBot Component ──
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm MediBot 👋 I can answer any questions about MediBook — pricing, features, setup, or anything else. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // Pulse notification after 8 seconds
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => setHasNewMessage(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    setShowSuggestions(false);
    setHasNewMessage(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      // ── Parse response data first ──
      const data = await response.json();

      // ── Show real error if request failed ──
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to get response`);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);

      // ── Show REAL error message for debugging ──
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Debug Error:\n${error instanceof Error ? error.message : String(error)}\n\nCheck your browser console and terminal for more details.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setHasNewMessage(false);
  };

  return (
    <>
      {/* ── Chat Window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : 'auto',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              bottom: 90,
              right: 24,
              width: 360,
              zIndex: 9999,
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 8px 24px rgba(37,99,235,0.12)',
              border: `1px solid ${C.border}`,
              background: '#fff',
            }}
          >
            {/* Header */}
            <div style={{
              background: GRAD.primary,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              {/* Bot avatar */}
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                flexShrink: 0,
              }}>
                🤖
              </div>

              {/* Bot info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                  MediBot
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#34d399',
                  }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                    Online · Typically replies instantly
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >
                  {isMinimized ? '▲' : '▼'}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#fff',
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body — hidden when minimized */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  {/* Messages */}
                  <div style={{
                    height: 340,
                    overflowY: 'auto',
                    padding: '16px 14px',
                    background: '#fafbfc',
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${C.border} transparent`,
                  }}>
                    {messages.map(msg => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginBottom: 12 }}
                      >
                        <TypingIndicator />
                      </motion.div>
                    )}

                    {/* Suggested questions */}
                    <AnimatePresence>
                      {showSuggestions && messages.length === 1 && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          style={{ marginTop: 8 }}
                        >
                          <div style={{
                            fontSize: 11,
                            color: C.textLight,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            marginBottom: 8,
                          }}>
                            Quick questions
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {SUGGESTED_QUESTIONS.map(q => (
                              <button
                                key={q}
                                onClick={() => sendMessage(q)}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: 10,
                                  background: '#fff',
                                  border: `1px solid ${C.border}`,
                                  color: C.blue,
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  transition: 'all 0.15s ease',
                                  lineHeight: 1.4,
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = 'rgba(37,99,235,0.05)';
                                  e.currentTarget.style.borderColor = C.blue;
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = '#fff';
                                  e.currentTarget.style.borderColor = C.border;
                                }}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input area */}
                  <div style={{
                    padding: '12px 14px',
                    borderTop: `1px solid ${C.border}`,
                    background: '#fff',
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      background: C.page,
                      borderRadius: 14,
                      border: `1px solid ${C.border}`,
                      padding: '4px 4px 4px 12px',
                      transition: 'border-color 0.2s',
                    }}>
                      <input
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about pricing, features..."
                        disabled={isLoading}
                        style={{
                          flex: 1,
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          fontSize: 13.5,
                          color: C.textPrimary,
                          padding: '6px 0',
                        }}
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: !input.trim() || isLoading
                            ? C.border
                            : GRAD.primary,
                          border: 'none',
                          color: !input.trim() || isLoading ? C.textLight : '#fff',
                          fontSize: 15,
                          cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          flexShrink: 0,
                        }}
                      >
                        ➤
                      </button>
                    </div>

                    {/* Footer note */}
                    <div style={{
                      marginTop: 8,
                      textAlign: 'center',
                      fontSize: 10.5,
                      color: C.textLight,
                    }}>
                      Powered by MediBook AI ·
                      <a
                        href="mailto:hello@medibook.com"
                        style={{ color: C.blue, textDecoration: 'none', fontWeight: 600 }}
                      >
                        {' '}Talk to a human →
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Button ── */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Notification bubble */}
        <AnimatePresence>
          {hasNewMessage && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              style={{
                position: 'absolute',
                bottom: 64,
                right: 0,
                background: '#fff',
                borderRadius: '14px 14px 4px 14px',
                padding: '10px 14px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: `1px solid ${C.border}`,
                width: 200,
                cursor: 'pointer',
              }}
              onClick={handleOpen}
            >
              <div style={{ fontSize: 12.5, color: C.textPrimary, fontWeight: 600, lineHeight: 1.4 }}>
                👋 Questions about MediBook? I'm here to help!
              </div>
              <div style={{
                position: 'absolute',
                bottom: -6,
                right: 14,
                width: 12,
                height: 12,
                background: '#fff',
                border: `1px solid ${C.border}`,
                borderTop: 'none',
                borderLeft: 'none',
                transform: 'rotate(45deg)',
              }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main button */}
        <button
          onClick={isOpen ? () => setIsOpen(false) : handleOpen}
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: GRAD.primary,
            border: 'none',
            color: '#fff',
            fontSize: 24,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 24px rgba(37,99,235,0.45)',
            position: 'relative',
            transition: 'box-shadow 0.2s ease',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? '✕' : '💬'}
            </motion.span>
          </AnimatePresence>

          {/* Notification dot */}
          <AnimatePresence>
            {hasNewMessage && !isOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid #fff',
                }}
              />
            )}
          </AnimatePresence>
        </button>
      </motion.div>
    </>
  );
}
