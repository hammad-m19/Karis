'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Briefcase,
  Monitor,
  Link,
  Globe,
  Loader2,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Building2,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface JobSearchProps {
  jobs: Record<string, unknown>[];
  onJobsUpdate: () => void;
  hasProfile: boolean;
  onApply: (job: Record<string, unknown>) => void;
}

export default function JobSearch({ jobs, onJobsUpdate, hasProfile, onApply }: JobSearchProps) {
  const [searching, setSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    keywords: '',
    location: '',
    job_type: '',
    work_mode: '',
    date_posted: '7',
    platform: 'both',
  });

  const handleSearch = async () => {
    if (!filters.keywords.trim()) {
      toast.error('Please enter keywords to search');
      return;
    }

    setSearching(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Found ${data.count} jobs!`);
        onJobsUpdate();
      } else {
        toast.error(data.error || 'Search failed');
      }
    } catch {
      toast.error('Failed to search jobs');
    } finally {
      setSearching(false);
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

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.div variants={item} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Job Search
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>
          Search LinkedIn & Indeed — Karis will tailor your CV for each position
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={item} className="card-static" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              className="input"
              style={{ paddingLeft: 42 }}
              placeholder="Job title, keywords, or company..."
              value={filters.keywords}
              onChange={(e) => setFilters({ ...filters, keywords: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div style={{ position: 'relative', width: 220 }}>
            <MapPin size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input
              className="input"
              style={{ paddingLeft: 42 }}
              placeholder="Location..."
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={searching}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minWidth: 130,
              justifyContent: 'center',
              opacity: searching ? 0.7 : 1,
            }}
          >
            {searching ? (
              <>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Searching...
              </>
            ) : (
              <>
                <Search size={16} />
                Search
              </>
            )}
          </button>
        </div>

        {/* Filter toggle */}
        <button
          className="btn-ghost"
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
        >
          <Filter size={14} />
          {showFilters ? 'Hide' : 'Show'} Filters
          <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        </button>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 12,
                  marginTop: 16,
                  padding: '16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Date Posted */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> Date Posted
                  </label>
                  <select
                    className="select"
                    value={filters.date_posted}
                    onChange={(e) => setFilters({ ...filters, date_posted: e.target.value })}
                  >
                    <option value="1">Last 24 hours</option>
                    <option value="3">Last 3 days</option>
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                    <option value="30">Last 30 days</option>
                  </select>
                </div>

                {/* Job Type */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Briefcase size={12} /> Job Type
                  </label>
                  <select
                    className="select"
                    value={filters.job_type}
                    onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

                {/* Work Mode */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Monitor size={12} /> Work Mode
                  </label>
                  <select
                    className="select"
                    value={filters.work_mode}
                    onChange={(e) => setFilters({ ...filters, work_mode: e.target.value })}
                  >
                    <option value="">All Modes</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>

                {/* Platform */}
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Globe size={12} /> Platform
                  </label>
                  <select
                    className="select"
                    value={filters.platform}
                    onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                  >
                    <option value="both">Both Platforms</option>
                    <option value="linkedin">LinkedIn Only</option>
                    <option value="indeed">Indeed Only</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Searching indicator */}
      {searching && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-static"
          style={{
            marginBottom: 20,
            textAlign: 'center',
            padding: '40px 24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ position: 'relative' }}>
              <Loader2 size={40} style={{ color: '#6366f1', animation: 'spin 1s linear infinite' }} />
              <div style={{
                position: 'absolute', inset: -8,
                border: '2px solid rgba(99,102,241,0.1)',
                borderRadius: '50%',
                animation: 'pulse-glow 2s ease-in-out infinite',
              }} />
            </div>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Scraping jobs...</p>
          <p style={{ fontSize: 13, color: '#94a3b8' }}>
            Searching {filters.platform === 'both' ? 'LinkedIn & Indeed' : filters.platform} for &quot;{filters.keywords}&quot;
          </p>
        </motion.div>
      )}

      {/* Results */}
      {!searching && jobs.length > 0 && (
        <motion.div variants={item}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>
              {jobs.length} Jobs Found
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="badge platform-linkedin">
                <Link size={10} />
                {jobs.filter(j => j.platform === 'linkedin').length}
              </span>
              <span className="badge platform-indeed">
                <Globe size={10} />
                {jobs.filter(j => j.platform === 'indeed').length}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {jobs.map((job, i) => (
                <motion.div
                  key={job.id as number || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedJob(expandedJob === i ? null : i)}
                >
                  <div style={{ display: 'flex', gap: 14 }}>
                    {/* Platform icon */}
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: (job.platform as string) === 'linkedin' ? 'rgba(0,119,181,0.12)' : 'rgba(33,100,243,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {(job.platform as string) === 'linkedin' ? (
                        <Link size={20} style={{ color: '#0077b5' }} />
                      ) : (
                        <Globe size={20} style={{ color: '#2164f3' }} />
                      )}
                    </div>

                    {/* Job info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{job.title as any as string}</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: '#94a3b8' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Building2 size={13} /> {job.company as any as string}
                            </span>
                            {!!job.location && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <MapPin size={13} /> {job.location as any as string}
                              </span>
                            )}
                            {!!job.salary && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <DollarSign size={13} /> {job.salary as string}
                              </span>
                            )}
                            {!!job.posted_date && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Calendar size={13} /> {job.posted_date as any as string}
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {!!job.job_type && (
                            <span className="badge badge-primary">{job.job_type as any as string}</span>
                          )}
                          {!!job.work_mode && (
                            <span className="badge badge-info">{job.work_mode as any as string}</span>
                          )}
                        </div>
                      </div>

                      {/* Expanded content */}
                      <AnimatePresence>
                        {expandedJob === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ overflow: 'hidden' }}
                          >
                            {(job.description as string) && (
                              <div
                                style={{
                                  marginTop: 16,
                                  padding: 16,
                                  borderRadius: 10,
                                  background: 'rgba(255,255,255,0.02)',
                                  border: '1px solid rgba(255,255,255,0.04)',
                                  fontSize: 13,
                                  color: '#94a3b8',
                                  lineHeight: 1.7,
                                  maxHeight: 300,
                                  overflow: 'auto',
                                  whiteSpace: 'pre-wrap',
                                }}
                              >
                                {(job.description as any as string).slice(0, 1500)}
                                {(job.description as any as string).length > 1500 ? '...' : ''}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                              {hasProfile && (
                                <button
                                  className="btn-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onApply(job);
                                  }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}
                                >
                                  <Sparkles size={14} />
                                  Tailor CV & Apply
                                </button>
                              )}
                              <a
                                href={job.url as string}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-secondary"
                                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={14} />
                                View on {job.platform as any as string}
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!searching && jobs.length === 0 && (
        <motion.div variants={item} className="empty-state" style={{ padding: '60px 24px' }}>
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
            <Search size={36} style={{ color: '#475569' }} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No jobs yet</h3>
          <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 400 }}>
            Enter keywords and filters above to search for jobs on LinkedIn and Indeed
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
