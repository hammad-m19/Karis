'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Send,
  Sparkles,
  User,
  Loader2,
  MessageSquare,
  Plus,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface ChatProps {
  hasProfile: boolean;
  onProfileUpdate: () => void;
  onNavigate: (tab: string) => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  changes?: string[];
  timestamp: Date;
}

export default function Chat({ hasProfile, onProfileUpdate, onNavigate }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: hasProfile
        ? "Hey! I'm Karis, your AI profile assistant. Tell me about any new skills, experiences, projects, or certifications, and I'll add them to your profile. For example:\n\n• \"I just learned Docker and Kubernetes\"\n• \"I started an internship at Google as a SWE intern\"\n• \"I built a React dashboard for analytics\"\n\nWhat's new?"
        : "Welcome! I'm Karis. Upload your CV first on the Profile page, then come back here to update your profile with new skills and experiences.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage, timestamp: new Date() },
    ]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            changes: data.changes,
            timestamp: new Date(),
          },
        ]);

        if (data.changes && data.changes.length > 0) {
          toast.success(`Updated: ${data.changes.length} change(s) applied`);
          onProfileUpdate();
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'system',
            content: data.error || 'Something went wrong',
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          content: 'Failed to send message. Check your connection.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const suggestions = [
    "I learned TypeScript recently",
    "I built a full-stack e-commerce app",
    "I got AWS Cloud Practitioner certified",
    "I started freelancing on Fiverr",
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 48px)' }}
    >
      <motion.div variants={item} style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
          AI Chat
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>
          Tell me about new skills or experiences — I&apos;ll update your profile automatically
        </p>
      </motion.div>

      {!hasProfile && (
        <motion.div
          variants={item}
          style={{
            padding: '16px 20px',
            borderRadius: 12,
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <AlertCircle size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Profile required</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>Upload your CV first to enable chat updates</p>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('profile')} style={{ fontSize: 12, padding: '8px 16px' }}>
            Upload CV
          </button>
        </motion.div>
      )}

      {/* Messages area */}
      <motion.div
        variants={item}
        style={{
          flex: 1,
          overflow: 'auto',
          marginBottom: 16,
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-glass-border)',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'flex',
                  gap: 12,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role !== 'user' && (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: msg.role === 'system'
                        ? 'rgba(239,68,68,0.12)'
                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {msg.role === 'system' ? (
                      <AlertCircle size={16} style={{ color: '#ef4444' }} />
                    ) : (
                      <Sparkles size={16} style={{ color: 'white' }} />
                    )}
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '75%',
                    padding: '14px 18px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))'
                      : msg.role === 'system'
                      ? 'rgba(239,68,68,0.08)'
                      : 'rgba(255,255,255,0.03)',
                    border: msg.role === 'user'
                      ? '1px solid rgba(99,102,241,0.2)'
                      : msg.role === 'system'
                      ? '1px solid rgba(239,68,68,0.15)'
                      : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <p style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: msg.role === 'system' ? '#ef4444' : '#e2e8f0',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.content}
                  </p>

                  {/* Changes applied */}
                  {msg.changes && msg.changes.length > 0 && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.15)',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Changes Applied
                      </div>
                      {msg.changes.map((change, ci) => (
                        <div
                          key={ci}
                          style={{
                            fontSize: 12,
                            color: '#94a3b8',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginTop: 4,
                          }}
                        >
                          <CheckCircle size={12} style={{ color: '#10b981' }} />
                          {change}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: 10, color: '#475569', marginTop: 8 }}>
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={16} style={{ color: '#94a3b8' }} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', gap: 12 }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} style={{ color: 'white' }} />
              </div>
              <div
                style={{
                  padding: '14px 20px',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Loader2 size={14} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Karis is thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Quick suggestions */}
      {messages.length <= 2 && hasProfile && (
        <motion.div
          variants={item}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
        >
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              className="chip"
              onClick={() => {
                setInput(suggestion);
                inputRef.current?.focus();
              }}
            >
              <Plus size={12} />
              {suggestion}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input area */}
      <motion.div
        variants={item}
        style={{
          display: 'flex',
          gap: 12,
          padding: '16px 20px',
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-glass-border)',
        }}
      >
        <textarea
          ref={inputRef}
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={hasProfile ? "Tell me about new skills, projects, or experiences..." : "Upload your CV first to use chat..."}
          disabled={!hasProfile || sending}
          style={{
            flex: 1,
            minHeight: 44,
            maxHeight: 120,
            resize: 'none',
            background: 'transparent',
            border: 'none',
            padding: '10px 0',
          }}
          rows={1}
        />
        <button
          className="btn-primary"
          onClick={handleSend}
          disabled={!hasProfile || sending || !input.trim()}
          style={{
            alignSelf: 'flex-end',
            padding: '10px 18px',
            opacity: (!hasProfile || !input.trim()) ? 0.4 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {sending ? (
            <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={16} />
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
