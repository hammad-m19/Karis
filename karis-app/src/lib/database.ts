import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'karis.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(db: Database.Database) {
  db.exec(`
    -- User profile parsed from CV
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      location TEXT DEFAULT '',
      summary TEXT DEFAULT '',
      linkedin_url TEXT DEFAULT '',
      portfolio_url TEXT DEFAULT '',
      raw_cv_text TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Skills extracted from CV
    CREATE TABLE IF NOT EXISTS skills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      skill_name TEXT NOT NULL,
      proficiency TEXT DEFAULT 'intermediate',
      category TEXT DEFAULT 'general',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    );

    -- Work experience
    CREATE TABLE IF NOT EXISTS experience (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      company TEXT NOT NULL,
      title TEXT NOT NULL,
      location TEXT DEFAULT '',
      start_date TEXT DEFAULT '',
      end_date TEXT DEFAULT '',
      is_current INTEGER DEFAULT 0,
      description TEXT DEFAULT '',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    );

    -- Education
    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      institution TEXT NOT NULL,
      degree TEXT NOT NULL,
      field_of_study TEXT DEFAULT '',
      start_date TEXT DEFAULT '',
      end_date TEXT DEFAULT '',
      gpa TEXT DEFAULT '',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    );

    -- Projects
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      technologies TEXT DEFAULT '',
      url TEXT DEFAULT '',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    );

    -- Certifications
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      issuer TEXT DEFAULT '',
      date TEXT DEFAULT '',
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    );

    -- Scraped jobs
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT UNIQUE,
      platform TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT DEFAULT '',
      job_type TEXT DEFAULT '',
      work_mode TEXT DEFAULT '',
      description TEXT DEFAULT '',
      requirements TEXT DEFAULT '',
      salary TEXT DEFAULT '',
      url TEXT NOT NULL,
      posted_date TEXT DEFAULT '',
      scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Applications tracking
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER NOT NULL,
      profile_id INTEGER NOT NULL,
      tailored_cv TEXT DEFAULT '',
      cover_letter TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      notes TEXT DEFAULT '',
      FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    );

    -- Chat history for incremental updates
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER NOT NULL,
      user_message TEXT NOT NULL,
      ai_response TEXT DEFAULT '',
      changes_made TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE
    );
  `);
}

// Profile operations
export function getProfile() {
  const db = getDb();
  const profile = db.prepare('SELECT * FROM profile ORDER BY id DESC LIMIT 1').get() as Record<string, unknown> | undefined;
  if (!profile) return null;
  
  const skills = db.prepare('SELECT * FROM skills WHERE profile_id = ?').all(profile.id);
  const experience = db.prepare('SELECT * FROM experience WHERE profile_id = ? ORDER BY is_current DESC, end_date DESC').all(profile.id);
  const education = db.prepare('SELECT * FROM education WHERE profile_id = ? ORDER BY end_date DESC').all(profile.id);
  const projects = db.prepare('SELECT * FROM projects WHERE profile_id = ?').all(profile.id);
  const certifications = db.prepare('SELECT * FROM certifications WHERE profile_id = ?').all(profile.id);

  return {
    ...profile,
    skills,
    experience,
    education,
    projects,
    certifications,
  } as unknown as Record<string, unknown> & { id: number };
}

export function createProfile(data: {
  full_name: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  raw_cv_text?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO profile (full_name, email, phone, location, summary, linkedin_url, portfolio_url, raw_cv_text)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    data.full_name,
    data.email || '',
    data.phone || '',
    data.location || '',
    data.summary || '',
    data.linkedin_url || '',
    data.portfolio_url || '',
    data.raw_cv_text || ''
  );
  return result.lastInsertRowid;
}

export function updateProfile(id: number, data: Partial<{
  full_name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin_url: string;
  portfolio_url: string;
  raw_cv_text: string;
}>) {
  const db = getDb();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db.prepare(`UPDATE profile SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values, id);
}

export function addSkill(profileId: number, skillName: string, proficiency?: string, category?: string) {
  const db = getDb();
  // Check if skill already exists
  const existing = db.prepare('SELECT id FROM skills WHERE profile_id = ? AND LOWER(skill_name) = LOWER(?)').get(profileId, skillName);
  if (existing) return;
  db.prepare('INSERT INTO skills (profile_id, skill_name, proficiency, category) VALUES (?, ?, ?, ?)').run(
    profileId, skillName, proficiency || 'intermediate', category || 'general'
  );
}

export function addExperience(profileId: number, exp: {
  company: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO experience (profile_id, company, title, location, start_date, end_date, is_current, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    profileId, exp.company, exp.title, exp.location || '', exp.start_date || '',
    exp.end_date || '', exp.is_current ? 1 : 0, exp.description || ''
  );
}

export function addEducation(profileId: number, edu: {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO education (profile_id, institution, degree, field_of_study, start_date, end_date, gpa)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    profileId, edu.institution, edu.degree, edu.field_of_study || '',
    edu.start_date || '', edu.end_date || '', edu.gpa || ''
  );
}

export function addProject(profileId: number, proj: {
  name: string;
  description?: string;
  technologies?: string;
  url?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO projects (profile_id, name, description, technologies, url)
    VALUES (?, ?, ?, ?, ?)
  `).run(profileId, proj.name, proj.description || '', proj.technologies || '', proj.url || '');
}

export function addCertification(profileId: number, cert: {
  name: string;
  issuer?: string;
  date?: string;
}) {
  const db = getDb();
  db.prepare(`
    INSERT INTO certifications (profile_id, name, issuer, date)
    VALUES (?, ?, ?, ?)
  `).run(profileId, cert.name, cert.issuer || '', cert.date || '');
}

// Job operations
export function saveJob(job: {
  external_id: string;
  platform: string;
  title: string;
  company: string;
  location?: string;
  job_type?: string;
  work_mode?: string;
  description?: string;
  requirements?: string;
  salary?: string;
  url: string;
  posted_date?: string;
}) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO jobs (external_id, platform, title, company, location, job_type, work_mode, description, requirements, salary, url, posted_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    job.external_id, job.platform, job.title, job.company,
    job.location || '', job.job_type || '', job.work_mode || '',
    job.description || '', job.requirements || '', job.salary || '',
    job.url, job.posted_date || ''
  );
  return result.lastInsertRowid;
}

export function getJobs(filters?: {
  platform?: string;
  job_type?: string;
  work_mode?: string;
  search?: string;
}) {
  const db = getDb();
  let query = 'SELECT * FROM jobs WHERE 1=1';
  const params: string[] = [];

  if (filters?.platform && filters.platform !== 'all') {
    query += ' AND platform = ?';
    params.push(filters.platform);
  }
  if (filters?.job_type && filters.job_type !== 'all') {
    query += ' AND job_type = ?';
    params.push(filters.job_type);
  }
  if (filters?.work_mode && filters.work_mode !== 'all') {
    query += ' AND work_mode = ?';
    params.push(filters.work_mode);
  }
  if (filters?.search) {
    query += ' AND (title LIKE ? OR company LIKE ? OR description LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }

  query += ' ORDER BY scraped_at DESC';
  return db.prepare(query).all(...params);
}

// Application operations
export function saveApplication(data: {
  job_id: number;
  profile_id: number;
  tailored_cv?: string;
  cover_letter?: string;
  status?: string;
  notes?: string;
}) {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO applications (job_id, profile_id, tailored_cv, cover_letter, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    data.job_id, data.profile_id, data.tailored_cv || '', data.cover_letter || '',
    data.status || 'pending', data.notes || ''
  );
  return result.lastInsertRowid;
}

export function getApplications() {
  const db = getDb();
  return db.prepare(`
    SELECT a.*, j.title as job_title, j.company, j.platform, j.url as job_url
    FROM applications a
    JOIN jobs j ON a.job_id = j.id
    ORDER BY a.applied_at DESC
  `).all();
}

export function updateApplicationStatus(id: number, status: string) {
  const db = getDb();
  db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(status, id);
}

// Chat history
export function addChatEntry(profileId: number, userMessage: string, aiResponse: string, changesMade: string) {
  const db = getDb();
  db.prepare(`
    INSERT INTO chat_history (profile_id, user_message, ai_response, changes_made)
    VALUES (?, ?, ?, ?)
  `).run(profileId, userMessage, aiResponse, changesMade);
}

export function getChatHistory(profileId: number) {
  const db = getDb();
  return db.prepare('SELECT * FROM chat_history WHERE profile_id = ? ORDER BY created_at DESC LIMIT 50').all(profileId);
}
