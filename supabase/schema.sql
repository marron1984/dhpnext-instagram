-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  week_role TEXT NOT NULL DEFAULT '',
  theme TEXT NOT NULL DEFAULT '',
  target TEXT NOT NULL DEFAULT '',
  appeal_axis TEXT NOT NULL DEFAULT '',
  video_duration TEXT NOT NULL DEFAULT '15-30秒',
  tone TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'planning',
  monday_done BOOLEAN NOT NULL DEFAULT false,
  tuesday_done BOOLEAN NOT NULL DEFAULT false,
  wednesday_done BOOLEAN NOT NULL DEFAULT false,
  thursday_done BOOLEAN NOT NULL DEFAULT false,
  draft_status TEXT NOT NULL DEFAULT 'pending',
  checkback_status TEXT NOT NULL DEFAULT 'pending',
  final_status TEXT NOT NULL DEFAULT 'pending',
  caption TEXT NOT NULL DEFAULT '',
  hashtags TEXT NOT NULL DEFAULT '',
  bgm_direction TEXT NOT NULL DEFAULT '',
  video_structure TEXT NOT NULL DEFAULT '',
  terop_plan TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Checklist items table
CREATE TABLE IF NOT EXISTS checklist_items (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false
);

-- Music stocks table
CREATE TABLE IF NOT EXISTS music_stocks (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  mood TEXT NOT NULL DEFAULT '',
  bpm INTEGER,
  suitable_scene TEXT NOT NULL DEFAULT '',
  drive_url TEXT NOT NULL DEFAULT '',
  used_in TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_year_month ON projects(year, month);
CREATE INDEX IF NOT EXISTS idx_projects_store ON projects(store_id);
CREATE INDEX IF NOT EXISTS idx_checklist_project ON checklist_items(project_id);
CREATE INDEX IF NOT EXISTS idx_music_store ON music_stocks(store_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
