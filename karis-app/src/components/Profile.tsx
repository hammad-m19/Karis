'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  Mail,
  Phone,
  MapPin,
  Link,
  Globe,
  Code,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Award,
  Loader2,
  CheckCircle,
  X,
  Plus,
} from 'lucide-react';

interface ProfileProps {
  profile: Record<string, unknown> | null;
  onProfileUpdate: () => void;
}

export default function Profile({ profile, onProfileUpdate }: ProfileProps) {
  const [uploading, setUploading] = useState(false);
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('cv', file);

      const res = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success('CV parsed successfully! Your profile has been created.');
        onProfileUpdate();
      } else {
        toast.error(data.error || 'Failed to parse CV');
      }
    } catch {
      toast.error('Failed to upload CV');
    } finally {
      setUploading(false);
    }
  }, [onProfileUpdate]);

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('text', manualText);

      const res = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Profile created from text!');
        onProfileUpdate();
        setManualText('');
        setShowManualInput(false);
      } else {
        toast.error(data.error || 'Failed to parse text');
      }
    } catch {
      toast.error('Failed to process text');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  if (!profile) {
    // Upload view
    return (
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Upload Your CV
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 15 }}>
            Upload your CV once — Karis will remember everything and build on it.
          </p>
        </motion.div>

        <motion.div variants={item}>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
            style={{
              opacity: uploading ? 0.6 : 1,
              pointerEvents: uploading ? 'none' : 'auto',
              marginBottom: 20,
            }}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <div>
                <Loader2 size={48} style={{ color: '#6366f1', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                <p style={{ color: '#94a3b8', fontSize: 15 }}>Parsing your CV with AI...</p>
                <p style={{ color: '#475569', fontSize: 13, marginTop: 8 }}>This may take 10-20 seconds</p>
              </div>
            ) : isDragActive ? (
              <div>
                <Upload size={48} style={{ color: '#6366f1', marginBottom: 16 }} />
                <p style={{ color: '#a78bfa', fontSize: 16, fontWeight: 600 }}>Drop it here!</p>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}
                >
                  <Upload size={32} style={{ color: '#6366f1' }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  Drag & drop your CV here
                </p>
                <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
                  or click to browse • PDF, TXT, MD
                </p>
                <span className="badge badge-primary">Powered by GPT-4</span>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ color: '#475569', fontSize: 13 }}>— or —</span>
        </motion.div>

        <motion.div variants={item}>
          {showManualInput ? (
            <div className="card-static">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600 }}>Paste Your CV Text</h3>
                <button onClick={() => setShowManualInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  <X size={18} />
                </button>
              </div>
              <textarea
                className="input"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Paste your CV/resume text here..."
                style={{ minHeight: 200, marginBottom: 16 }}
              />
              <button
                className="btn-primary"
                onClick={handleManualSubmit}
                disabled={uploading || !manualText.trim()}
                style={{ opacity: !manualText.trim() ? 0.5 : 1 }}
              >
                {uploading ? 'Processing...' : 'Parse & Create Profile'}
              </button>
            </div>
          ) : (
            <button className="btn-secondary" onClick={() => setShowManualInput(true)} style={{ width: '100%' }}>
              <FileText size={16} style={{ marginRight: 8, display: 'inline' }} />
              Paste CV text instead
            </button>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Profile view
  const skills = (profile.skills as { id: number; skill_name: string; proficiency: string; category: string }[]) || [];
  const experience = (profile.experience as { id: number; company: string; title: string; location: string; start_date: string; end_date: string; is_current: number; description: string }[]) || [];
  const education = (profile.education as { id: number; institution: string; degree: string; field_of_study: string; start_date: string; end_date: string; gpa: string }[]) || [];
  const projects = (profile.projects as { id: number; name: string; description: string; technologies: string; url: string }[]) || [];
  const certifications = (profile.certifications as { id: number; name: string; issuer: string; date: string }[]) || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
              Your Profile
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 15 }}>
              Managed by AI — say &quot;I also know Python&quot; in chat to update
            </p>
          </div>
          <span className="badge badge-success">
            <CheckCircle size={12} /> Active
          </span>
        </div>
      </motion.div>

      {/* Basic Info */}
      <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{profile.full_name as string}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, marginBottom: 16 }}>
          {!!profile.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
              <Mail size={14} /> {profile.email as any as string}
            </span>
          )}
          {!!profile.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
              <Phone size={14} /> {profile.phone as any as string}
            </span>
          )}
          {!!profile.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
              <MapPin size={14} /> {profile.location as any as string}
            </span>
          )}
          {!!profile.linkedin_url && (
            <a href={profile.linkedin_url as any as string} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#0077b5', textDecoration: 'none' }}>
              <Link size={14} /> LinkedIn
            </a>
          )}
          {!!profile.portfolio_url && (
            <a href={profile.portfolio_url as any as string} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8b5cf6', textDecoration: 'none' }}>
              <Globe size={14} /> Portfolio
            </a>
          )}
        </div>
        {!!profile.summary && (
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.7 }}>{profile.summary as any as string}</p>
        )}
      </motion.div>

      {/* Skills */}
      <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code size={18} style={{ color: '#6366f1' }} />
          Skills
          <span className="badge badge-primary" style={{ marginLeft: 'auto' }}>{skills.length}</span>
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <AnimatePresence>
            {skills.map((skill) => (
              <motion.span
                key={skill.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="chip active"
              >
                {skill.skill_name}
                <span style={{ fontSize: 10, opacity: 0.6 }}>{skill.proficiency}</span>
              </motion.span>
            ))}
          </AnimatePresence>
          {skills.length === 0 && (
            <p style={{ color: '#475569', fontSize: 13 }}>No skills yet — tell me about your skills in chat!</p>
          )}
        </div>
      </motion.div>

      {/* Experience */}
      <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Briefcase size={18} style={{ color: '#10b981' }} />
          Experience
          <span className="badge badge-success" style={{ marginLeft: 'auto' }}>{experience.length}</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {experience.map((exp) => (
            <div
              key={exp.id}
              style={{
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderLeft: '3px solid #10b981',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{exp.title}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>{exp.company}{exp.location ? ` • ${exp.location}` : ''}</div>
                </div>
                {exp.is_current ? (
                  <span className="badge badge-success">Current</span>
                ) : null}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>
                {exp.start_date} — {exp.is_current ? 'Present' : exp.end_date}
              </div>
              {exp.description && (
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{exp.description}</p>
              )}
            </div>
          ))}
          {experience.length === 0 && (
            <p style={{ color: '#475569', fontSize: 13 }}>No experience listed yet</p>
          )}
        </div>
      </motion.div>

      {/* Education */}
      <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <GraduationCap size={18} style={{ color: '#f59e0b' }} />
          Education
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {education.map((edu) => (
            <div
              key={edu.id}
              style={{
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderLeft: '3px solid #f59e0b',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600 }}>{edu.degree}</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                {edu.institution}{edu.field_of_study ? ` — ${edu.field_of_study}` : ''}
              </div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                {edu.start_date} — {edu.end_date}
                {edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
              </div>
            </div>
          ))}
          {education.length === 0 && (
            <p style={{ color: '#475569', fontSize: 13 }}>No education listed yet</p>
          )}
        </div>
      </motion.div>

      {/* Projects */}
      {projects.length > 0 && (
        <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderOpen size={18} style={{ color: '#8b5cf6' }} />
            Projects
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="card"
                style={{ padding: 16 }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{proj.name}</div>
                {proj.description && (
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: 8 }}>{proj.description}</p>
                )}
                {proj.technologies && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {proj.technologies.split(',').map((tech, i) => (
                      <span key={i} className="badge badge-primary" style={{ fontSize: 10 }}>{tech.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} style={{ color: '#ef4444' }} />
            Certifications
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {certifications.map((cert) => (
              <div
                key={cert.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>{cert.name}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  {cert.issuer}{cert.date ? ` • ${cert.date}` : ''}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Re-upload */}
      <motion.div variants={item} style={{ marginTop: 32, padding: '20px', borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Plus size={18} style={{ color: '#ef4444' }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#ef4444' }}>Re-upload CV</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>This will create a new profile, replacing the current one</div>
          </div>
          <div {...getRootProps()} style={{ marginLeft: 'auto' }}>
            <input {...getInputProps()} />
            <button className="btn-secondary" style={{ fontSize: 13, borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
              Upload New
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
