'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  Key,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('karis_openai_key');
    if (stored) {
      setApiKey(stored);
      setSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    localStorage.setItem('karis_openai_key', apiKey);
    setSaved(true);
    toast.success('API key saved!');
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Settings
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>
          Configure Karis to your preferences
        </p>
      </motion.div>

      {/* API Key */}
      <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={18} style={{ color: '#6366f1' }} />
          OpenAI API Key
        </h3>

        <div
          style={{
            padding: '14px 16px',
            borderRadius: 12,
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.12)',
            marginBottom: 16,
            display: 'flex',
            gap: 10,
          }}
        >
          <Info size={16} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
            Your API key is required for CV parsing and tailoring. It&apos;s stored locally in your browser and
            also needs to be set as <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>OPENAI_API_KEY</code> in
            your <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>.env.local</code> file.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              className="input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
              placeholder="sk-..."
              style={{ paddingRight: 44, fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                padding: 4,
              }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            className="btn-primary"
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {saved ? <CheckCircle size={14} /> : <Key size={14} />}
            {saved ? 'Saved' : 'Save'}
          </button>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              color: '#10b981',
            }}
          >
            <CheckCircle size={12} />
            API key saved locally
          </motion.div>
        )}
      </motion.div>

      {/* Security notice */}
      <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={18} style={{ color: '#10b981' }} />
          Security & Privacy
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#94a3b8' }}>
            <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
            <span>All data is stored locally on your machine using SQLite</span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#94a3b8' }}>
            <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
            <span>Your CV content is only sent to OpenAI for parsing and tailoring</span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#94a3b8' }}>
            <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }} />
            <span>No data is shared with third parties</span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 13, color: '#94a3b8' }}>
            <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
            <span>Web scraping LinkedIn/Indeed may violate their Terms of Service — use at your own risk</span>
          </div>
        </div>
      </motion.div>

      {/* Setup guide */}
      <motion.div variants={item} className="card-static">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingsIcon size={18} style={{ color: '#f59e0b' }} />
          Quick Setup Guide
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { step: '1', title: 'Set your OpenAI API key', desc: 'Add OPENAI_API_KEY to .env.local and save it above' },
            { step: '2', title: 'Upload your CV', desc: 'Go to Profile and upload your resume (PDF or text)' },
            { step: '3', title: 'Search for jobs', desc: 'Use Job Search with your preferred filters' },
            { step: '4', title: 'Apply with tailored CVs', desc: 'Click "Tailor CV & Apply" on any job listing' },
            { step: '5', title: 'Keep your profile updated', desc: 'Use AI Chat to add new skills and experiences' },
          ].map((guide) => (
            <div key={guide.step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#818cf8',
                  flexShrink: 0,
                }}
              >
                {guide.step}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{guide.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{guide.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
