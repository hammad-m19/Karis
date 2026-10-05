'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  ExternalLink,
  Link,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Copy,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

interface ApplicationsProps {
  applications: Record<string, unknown>[];
  onStatusUpdate: (id: number, status: string) => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.2)', icon: Clock },
  cv_ready: { label: 'CV Ready', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.2)', icon: FileText },
  applied: { label: 'Applied', color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.2)', icon: CheckCircle },
  interview: { label: 'Interview', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.2)', icon: Sparkles },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.2)', icon: XCircle },
  offer: { label: 'Offer!', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: CheckCircle },
};

export default function Applications({ applications, onStatusUpdate }: ApplicationsProps) {
  const [expandedApp, setExpandedApp] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'cv' | 'cover'>('cv');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const stats = [
    { label: 'Total', value: applications.length, color: '#6366f1' },
    { label: 'Applied', value: applications.filter(a => a.status === 'applied').length, color: '#10b981' },
    { label: 'CV Ready', value: applications.filter(a => a.status === 'cv_ready').length, color: '#8b5cf6' },
    { label: 'Interviews', value: applications.filter(a => a.status === 'interview').length, color: '#3b82f6' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Applications
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>
          Track your applications and tailored CVs
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        variants={item}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 24,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: '16px 20px',
              borderRadius: 14,
              background: 'var(--bg-card)',
              border: '1px solid var(--bg-glass-border)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Applications list */}
      {applications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <AnimatePresence>
            {applications.map((app, i) => {
              const status = statusConfig[(app.status as string) || 'pending'] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expandedApp === i;

              return (
                <motion.div
                  key={app.id as number || i}
                  variants={item}
                  layout
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedApp(isExpanded ? null : i)}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Platform icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: (app.platform as string) === 'linkedin' ? 'rgba(0,119,181,0.12)' : 'rgba(33,100,243,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {(app.platform as string) === 'linkedin' ? (
                        <Link size={20} style={{ color: '#0077b5' }} />
                      ) : (
                        <Globe size={20} style={{ color: '#2164f3' }} />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                        {app.job_title as any as string}
                      </h4>
                      <p style={{ fontSize: 13, color: '#94a3b8' }}>
                        {app.company as any as string}
                        {app.applied_at ? ` • ${new Date(app.applied_at as any as string).toLocaleDateString()}` : ''}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 10,
                        background: status.bg,
                        border: `1px solid ${status.border}`,
                        color: status.color,
                        fontSize: 12,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </div>

                    {/* Expand icon */}
                    {isExpanded ? (
                      <ChevronUp size={18} style={{ color: '#475569', flexShrink: 0 }} />
                    ) : (
                      <ChevronDown size={18} style={{ color: '#475569', flexShrink: 0 }} />
                    )}
                  </div>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
                          {/* Status update buttons */}
                          <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 8, display: 'block' }}>
                              Update Status
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                              {Object.entries(statusConfig).map(([key, config]) => (
                                <button
                                  key={key}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onStatusUpdate(app.id as number, key);
                                  }}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: 8,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    background: (app.status as string) === key ? config.bg : 'transparent',
                                    border: `1px solid ${(app.status as string) === key ? config.border : 'rgba(255,255,255,0.06)'}`,
                                    color: (app.status as string) === key ? config.color : '#94a3b8',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Inter, sans-serif',
                                  }}
                                >
                                  {config.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* CV / Cover Letter toggle */}
                          {((app.tailored_cv as string) || (app.cover_letter as string)) && (
                            <div>
                              <div className="tab-nav" style={{ marginBottom: 16, width: 'fit-content' }}>
                                <button
                                  className={`tab-btn ${viewMode === 'cv' ? 'active' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); setViewMode('cv'); }}
                                >
                                  Tailored CV
                                </button>
                                <button
                                  className={`tab-btn ${viewMode === 'cover' ? 'active' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); setViewMode('cover'); }}
                                >
                                  Cover Letter
                                </button>
                              </div>

                              <div
                                style={{
                                  padding: 20,
                                  borderRadius: 12,
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255,255,255,0.04)',
                                  fontSize: 13,
                                  color: '#cbd5e1',
                                  lineHeight: 1.8,
                                  maxHeight: 400,
                                  overflow: 'auto',
                                  whiteSpace: 'pre-wrap',
                                  fontFamily: "'JetBrains Mono', monospace",
                                }}
                              >
                                {viewMode === 'cv' ? (app.tailored_cv as any as string) : (app.cover_letter as any as string)}
                              </div>

                              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                                <button
                                  className="btn-secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(
                                      viewMode === 'cv' ? (app.tailored_cv as string) : (app.cover_letter as string),
                                      viewMode === 'cv' ? 'Tailored CV' : 'Cover Letter'
                                    );
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                                >
                                  <Copy size={14} />
                                  Copy {viewMode === 'cv' ? 'CV' : 'Letter'}
                                </button>
                                {!!app.job_url && (
                                  <a
                                    href={app.job_url as any as string}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-primary"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}
                                  >
                                    <ExternalLink size={14} />
                                    Open Job Posting
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div variants={item} className="empty-state" style={{ padding: '80px 24px' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: 'rgba(99, 102, 241, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <FileCheck size={36} style={{ color: '#475569' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No applications yet</h3>
          <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 400 }}>
            Search for jobs and click &quot;Tailor CV & Apply&quot; to get started. Karis will create a tailored CV that highlights your real skills.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
