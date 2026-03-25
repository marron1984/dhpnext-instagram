import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const MUSIC_FILE = path.join(DATA_DIR, 'music.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, '[]');
  if (!fs.existsSync(MUSIC_FILE)) fs.writeFileSync(MUSIC_FILE, '[]');
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, '[]');
}

export function readProjects(): unknown[] {
  ensure();
  return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf-8'));
}

export function writeProjects(data: unknown[]) {
  ensure();
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2));
}

export function readMusic(): unknown[] {
  ensure();
  return JSON.parse(fs.readFileSync(MUSIC_FILE, 'utf-8'));
}

export function writeMusic(data: unknown[]) {
  ensure();
  fs.writeFileSync(MUSIC_FILE, JSON.stringify(data, null, 2));
}

// --- Users ---
export interface User {
  id: number;
  username: string;
  password_hash: string;
  display_name: string;
  created_at: string;
}

export function readUsers(): User[] {
  ensure();
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
}

export function writeUsers(data: User[]) {
  ensure();
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

// --- Sessions ---
export interface Session {
  token: string;
  user_id: number;
  created_at: string;
  expires_at: string;
}

export function readSessions(): Session[] {
  ensure();
  return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
}

export function writeSessions(data: Session[]) {
  ensure();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(data, null, 2));
}
