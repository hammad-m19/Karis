'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Profile from '@/components/Profile';
import JobSearch from '@/components/JobSearch';
import Applications from '@/components/Applications';
import Chat from '@/components/Chat';
import Settings from '@/components/Settings';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [jobs, setJobs] = useState<Record<string, unknown>[]>([]);
  const [applications, setApplications] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/apply');
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProfile(), fetchJobs(), fetchApplications()]);
      setLoading(false);
    };
    init();
  }, [fetchProfile, fetchJobs, fetchApplications]);

  const handleApply = async (job: Record<string, unknown>) => {
    if (!profile) {
      toast.error('Upload your CV first!');
      setActiveTab('profile');
      return;
    }

    setApplying(true);
    const toastId = toast.loading('Tailoring CV for this position...');

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          job_title: job.title,
          company: job.company,
          description: job.description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('CV tailored! Check Applications tab.', { id: toastId });
        await fetchApplications();
        setActiveTab('applications');
      } else {
        toast.error(data.error || 'Failed to tailor CV', { id: toastId });
      }
    } catch {
      toast.error('Failed to create application', { id: toastId });
    } finally {
      setApplying(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await fetch('/api/apply', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      await fetchApplications();
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 size={40} style={{ color: '#6366f1' }} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ color: '#94a3b8', fontSize: 15, fontWeight: 500 }}
        >
          Loading Karis...
        </motion.p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            profile={profile}
            applications={applications}
            jobs={jobs}
            onNavigate={setActiveTab}
          />
        );
      case 'profile':
        return (
          <Profile
            profile={profile}
            onProfileUpdate={() => { fetchProfile(); }}
          />
        );
      case 'search':
        return (
          <JobSearch
            jobs={jobs}
            onJobsUpdate={fetchJobs}
            hasProfile={!!profile}
            onApply={handleApply}
          />
        );
      case 'applications':
        return (
          <Applications
            applications={applications}
            onStatusUpdate={handleStatusUpdate}
          />
        );
      case 'chat':
        return (
          <Chat
            hasProfile={!!profile}
            onProfileUpdate={fetchProfile}
            onNavigate={setActiveTab}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 260,
          padding: '24px 32px',
          transition: 'margin-left 0.3s ease',
          maxWidth: 1100,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Applying overlay */}
      <AnimatePresence>
        {applying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card-static"
              style={{
                padding: '40px 48px',
                textAlign: 'center',
                maxWidth: 400,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                style={{ display: 'inline-block', marginBottom: 20 }}
              >
                <Loader2 size={40} style={{ color: '#6366f1' }} />
              </motion.div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Tailoring Your CV...
              </h3>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                GPT-4 is creating a custom CV highlighting your relevant skills. This takes about 15-30 seconds.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
