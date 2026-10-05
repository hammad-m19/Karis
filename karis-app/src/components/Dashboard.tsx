'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  FileCheck,
  TrendingUp,
  Clock,
  Link,
  Globe,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardProps {
  profile: Record<string, unknown> | null;
  applications: Record<string, unknown>[];
  jobs: Record<string, unknown>[];
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ profile, applications, jobs, onNavigate }: DashboardProps) {
  const stats = [
    {
      label: 'Jobs Found',
      value: jobs.length,
      icon: Briefcase,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)',
    },
    {
      label: 'Applications',
      value: applications.length,
      icon: FileCheck,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
    },
    {
      label: 'Skills',
      value: profile ? ((profile.skills as unknown[]) || []).length : 0,
      icon: TrendingUp,
      color: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.1)',
    },
    {
      label: 'Pending',
      value: applications.filter((a) => a.status === 'pending' || a.status === 'cv_ready').length,
      icon: Clock,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Header */}
      <motion.div variants={item} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Welcome back{profile ? `, ${(profile.full_name as string)?.split(' ')[0]}` : ''}
          <span style={{ marginLeft: 8 }}>👋</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>
          Here&apos;s your job search overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={item}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="card"
              whileHover={{ scale: 1.02 }}
              style={{ cursor: 'default' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: stat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="stat-value" style={{ color: stat.color, marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{stat.label}</div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Actions + Profile Status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          marginBottom: 32,
        }}
      >
        {/* Quick Actions */}
        <motion.div variants={item} className="card-static">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} style={{ color: '#8b5cf6' }} />
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn-secondary"
              onClick={() => onNavigate('search')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Briefcase size={16} />
                Search Jobs
              </span>
              <ArrowUpRight size={14} style={{ color: '#94a3b8' }} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => onNavigate('profile')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <FileCheck size={16} />
                {profile ? 'Update Profile' : 'Upload CV'}
              </span>
              <ArrowUpRight size={14} style={{ color: '#94a3b8' }} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => onNavigate('chat')}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={16} />
                AI Chat Update
              </span>
              <ArrowUpRight size={14} style={{ color: '#94a3b8' }} />
            </button>
          </div>
        </motion.div>

        {/* Profile Status */}
        <motion.div variants={item} className="card-static">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Profile Completeness</h3>
          {profile ? (
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {[
                  { label: 'Basic Info', done: !!(profile.full_name && profile.email) },
                  { label: 'Skills', done: ((profile.skills as unknown[]) || []).length > 0 },
                  { label: 'Experience', done: ((profile.experience as unknown[]) || []).length > 0 },
                  { label: 'Education', done: ((profile.education as unknown[]) || []).length > 0 },
                  { label: 'Projects', done: ((profile.projects as unknown[]) || []).length > 0 },
                ].map((section) => (
                  <span
                    key={section.label}
                    className={`badge ${section.done ? 'badge-success' : 'badge-warning'}`}
                  >
                    {section.done ? '✓' : '○'} {section.label}
                  </span>
                ))}
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.05)',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      [
                        !!(profile.full_name && profile.email),
                        ((profile.skills as unknown[]) || []).length > 0,
                        ((profile.experience as unknown[]) || []).length > 0,
                        ((profile.education as unknown[]) || []).length > 0,
                        ((profile.projects as unknown[]) || []).length > 0,
                      ].filter(Boolean).length * 20
                    }%`,
                  }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  style={{
                    height: '100%',
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                  }}
                />
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#94a3b8', marginBottom: 16 }}>No profile yet. Upload your CV to get started!</p>
              <button className="btn-primary" onClick={() => onNavigate('profile')}>
                Upload CV
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Jobs & Applications */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}
      >
        {/* Recent Jobs */}
        <motion.div variants={item} className="card-static">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Jobs</h3>
            <button className="btn-ghost" onClick={() => onNavigate('search')} style={{ fontSize: 13 }}>
              View all →
            </button>
          </div>
          {jobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {jobs.slice(0, 4).map((job, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: (job.platform as string) === 'linkedin' ? 'rgba(0,119,181,0.15)' : 'rgba(0,51,160,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {(job.platform as string) === 'linkedin' ? (
                      <Link size={16} style={{ color: '#0077b5' }} />
                    ) : (
                      <Globe size={16} style={{ color: '#2164f3' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {job.title as string}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      {job.company as string}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <Briefcase size={32} style={{ color: '#475569', marginBottom: 8 }} />
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No jobs found yet</p>
              <button className="btn-primary" onClick={() => onNavigate('search')} style={{ marginTop: 12, fontSize: 13 }}>
                Search Jobs
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Applications */}
        <motion.div variants={item} className="card-static">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Applications</h3>
            <button className="btn-ghost" onClick={() => onNavigate('applications')} style={{ fontSize: 13 }}>
              View all →
            </button>
          </div>
          {applications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {applications.slice(0, 4).map((app, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{app.job_title as string}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{app.company as string}</div>
                  </div>
                  <span
                    className={`badge ${
                      (app.status as string) === 'applied'
                        ? 'badge-success'
                        : (app.status as string) === 'cv_ready'
                        ? 'badge-primary'
                        : 'badge-warning'
                    }`}
                  >
                    {app.status as string}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <FileCheck size={32} style={{ color: '#475569', marginBottom: 8 }} />
              <p style={{ color: '#94a3b8', fontSize: 13 }}>No applications yet</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
