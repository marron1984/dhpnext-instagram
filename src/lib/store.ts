export interface Store {
  id: number;
  name: string;
  slug: string;
  main_tone: string;
  strong_values: string;
  avoid: string;
  music_tone: string;
}

export interface Project {
  id: number;
  store_id: number;
  year: number;
  month: number;
  week_number: number;
  week_role: string;
  theme: string;
  target: string;
  appeal_axis: string;
  video_duration: string;
  tone: string;
  status: string;
  monday_done: boolean;
  tuesday_done: boolean;
  wednesday_done: boolean;
  thursday_done: boolean;
  draft_status: string;
  checkback_status: string;
  final_status: string;
  caption: string;
  hashtags: string;
  bgm_direction: string;
  video_structure: string;
  terop_plan: string;
  notes: string;
  checklist: ChecklistItem[];
  created_at: string;
}

export interface ChecklistItem {
  id: number;
  item_text: string;
  checked: boolean;
}

export interface MusicStock {
  id: number;
  store_id: number;
  title: string;
  mood: string;
  bpm: number | null;
  suitable_scene: string;
  used_in: string;
  notes: string;
  created_at: string;
}

const STORES: Store[] = [
  { id: 1, name: '大嵓埜', slug: 'ogano', main_tone: '静謐・上質・和の緊張感', strong_values: '季節、職人技、特別感、会食品質', avoid: '売り込み過多、安っぽい煽り', music_tone: '静謐、和、上質、余白' },
  { id: 2, name: '禅園西梅田', slug: 'zen-nishiumeda', main_tone: '都会的・洗練・落ち着き', strong_values: '会食、個室、上品さ、使いやすさ', avoid: '堅すぎて近寄りがたい表現', music_tone: 'モダン、都会的、洗練' },
  { id: 3, name: '禅園心斎橋', slug: 'zen-shinsaibashi', main_tone: '艶感・夜・ラグジュアリー', strong_values: '余白、静けさ、大人の時間', avoid: '派手すぎる演出、雑な高級感', music_tone: '艶感、夜、深み' },
  { id: 4, name: 'おでんスタンド', slug: 'odenstand', main_tone: '軽快・親しみ・ぬくもり', strong_values: '気軽さ、美味しさ、ちょい飲み導線', avoid: '高級店のような重さ、説明過多', music_tone: '軽快、ぬくもり、カジュアル' },
];

const CHECKLIST_DEFAULTS = [
  '店舗名の表記ゆれがないか',
  '漢字、料理名、地名に誤字がないか',
  '日本語として不自然な表現がないか',
  'テロップ量が多すぎないか',
  '店の格と動画トーンが一致しているか',
  '画像と文言の整合性が取れているか',
  '予約や来店につながる導線が明確か',
  'フォントが中国語系に見えないか',
];

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

let nextProjectId = 0;
let nextMusicId = 0;
let nextCheckId = 0;

function ensureIds() {
  const projects = getItem<Project[]>('projects', []);
  const music = getItem<MusicStock[]>('music', []);
  nextProjectId = projects.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  nextMusicId = music.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  nextCheckId = projects.reduce((max, p) => Math.max(max, p.checklist.reduce((cm, c) => Math.max(cm, c.id), 0)), 0) + 1;
}

// --- Stores ---
export function getStores(): Store[] {
  return STORES;
}

export function getStore(id: number): Store | undefined {
  return STORES.find(s => s.id === id);
}

// --- Projects ---
export function getProjects(filter?: { year?: number; month?: number; store_id?: number }): Project[] {
  const all = getItem<Project[]>('projects', []);
  return all.filter(p => {
    if (filter?.year && p.year !== filter.year) return false;
    if (filter?.month && p.month !== filter.month) return false;
    if (filter?.store_id && p.store_id !== filter.store_id) return false;
    return true;
  });
}

export function getProject(id: number): (Project & { store: Store }) | null {
  const all = getItem<Project[]>('projects', []);
  const p = all.find(p => p.id === id);
  if (!p) return null;
  const store = getStore(p.store_id);
  if (!store) return null;
  return { ...p, store };
}

export function createProject(data: {
  store_id: number;
  year: number;
  month: number;
  week_number: number;
  week_role: string;
  theme: string;
}): Project {
  ensureIds();
  const checklistItems: ChecklistItem[] = CHECKLIST_DEFAULTS.map((text, i) => ({
    id: nextCheckId + i,
    item_text: text,
    checked: false,
  }));
  nextCheckId += CHECKLIST_DEFAULTS.length;

  const project: Project = {
    id: nextProjectId++,
    store_id: data.store_id,
    year: data.year,
    month: data.month,
    week_number: data.week_number,
    week_role: data.week_role,
    theme: data.theme,
    target: '',
    appeal_axis: '',
    video_duration: '15-30秒',
    tone: '',
    status: 'planning',
    monday_done: false,
    tuesday_done: false,
    wednesday_done: false,
    thursday_done: false,
    draft_status: 'pending',
    checkback_status: 'pending',
    final_status: 'pending',
    caption: '',
    hashtags: '',
    bgm_direction: '',
    video_structure: '',
    terop_plan: '',
    notes: '',
    checklist: checklistItems,
    created_at: new Date().toISOString(),
  };

  const all = getItem<Project[]>('projects', []);
  all.push(project);
  setItem('projects', all);
  return project;
}

export function updateProject(id: number, updates: Partial<Project>): void {
  const all = getItem<Project[]>('projects', []);
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...updates };
  setItem('projects', all);
}

export function toggleChecklist(projectId: number, checkId: number): void {
  const all = getItem<Project[]>('projects', []);
  const proj = all.find(p => p.id === projectId);
  if (!proj) return;
  const item = proj.checklist.find(c => c.id === checkId);
  if (item) item.checked = !item.checked;
  setItem('projects', all);
}

export function deleteProject(id: number): void {
  const all = getItem<Project[]>('projects', []).filter(p => p.id !== id);
  setItem('projects', all);
}

// --- Music ---
export function getMusicStocks(storeId?: number): MusicStock[] {
  const all = getItem<MusicStock[]>('music', []);
  return storeId ? all.filter(m => m.store_id === storeId) : all;
}

export function addMusicStock(data: {
  store_id: number;
  title: string;
  mood: string;
  bpm: number | null;
  suitable_scene: string;
  notes: string;
}): MusicStock {
  ensureIds();
  const stock: MusicStock = {
    id: nextMusicId++,
    ...data,
    used_in: '',
    created_at: new Date().toISOString(),
  };
  const all = getItem<MusicStock[]>('music', []);
  all.push(stock);
  setItem('music', all);
  return stock;
}

export function deleteMusicStock(id: number): void {
  const all = getItem<MusicStock[]>('music', []).filter(m => m.id !== id);
  setItem('music', all);
}
