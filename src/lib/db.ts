import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data.db');

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeDb(db);
  }
  return db;
}

function initializeDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      main_tone TEXT NOT NULL,
      strong_values TEXT NOT NULL,
      avoid TEXT NOT NULL,
      music_tone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      week_number INTEGER NOT NULL,
      week_role TEXT NOT NULL,
      theme TEXT NOT NULL,
      target TEXT DEFAULT '',
      appeal_axis TEXT DEFAULT '',
      video_duration TEXT DEFAULT '15-30秒',
      tone TEXT DEFAULT '',
      status TEXT DEFAULT 'planning',
      monday_done INTEGER DEFAULT 0,
      tuesday_done INTEGER DEFAULT 0,
      wednesday_done INTEGER DEFAULT 0,
      thursday_done INTEGER DEFAULT 0,
      draft_status TEXT DEFAULT 'pending',
      checkback_status TEXT DEFAULT 'pending',
      final_status TEXT DEFAULT 'pending',
      caption TEXT DEFAULT '',
      hashtags TEXT DEFAULT '',
      bgm_direction TEXT DEFAULT '',
      video_structure TEXT DEFAULT '',
      terop_plan TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS music_stocks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      mood TEXT NOT NULL,
      bpm INTEGER,
      suitable_scene TEXT DEFAULT '',
      used_in TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      item_text TEXT NOT NULL,
      checked INTEGER DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    );
  `);

  // Seed stores if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM stores').get() as { c: number };
  if (count.c === 0) {
    const insert = db.prepare(
      'INSERT INTO stores (name, slug, main_tone, strong_values, avoid, music_tone) VALUES (?, ?, ?, ?, ?, ?)'
    );
    insert.run('大嵓埜', 'ogano', '静謐・上質・和の緊張感', '季節、職人技、特別感、会食品質', '売り込み過多、安っぽい煽り', '静謐、和、上質、余白');
    insert.run('禅園西梅田', 'zen-nishiumeda', '都会的・洗練・落ち着き', '会食、個室、上品さ、使いやすさ', '堅すぎて近寄りがたい表現', 'モダン、都会的、洗練');
    insert.run('禅園心斎橋', 'zen-shinsaibashi', '艶感・夜・ラグジュアリー', '余白、静けさ、大人の時間', '派手すぎる演出、雑な高級感', '艶感、夜、深み');
    insert.run('おでんスタンド', 'odenstand', '軽快・親しみ・ぬくもり', '気軽さ、美味しさ、ちょい飲み導線', '高級店のような重さ、説明過多', '軽快、ぬくもり、カジュアル');
  }
}
