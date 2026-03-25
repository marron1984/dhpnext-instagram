import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');
const MUSIC_FILE = path.join(DATA_DIR, 'music.json');

function ensure() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PROJECTS_FILE)) fs.writeFileSync(PROJECTS_FILE, '[]');
  if (!fs.existsSync(MUSIC_FILE)) fs.writeFileSync(MUSIC_FILE, '[]');
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
