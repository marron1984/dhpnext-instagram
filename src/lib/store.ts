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
  drive_url: string;
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

// --- Stores (static) ---
export function getStores(): Store[] {
  return STORES;
}

export function getStore(id: number): Store | undefined {
  return STORES.find(s => s.id === id);
}

// --- Projects (API) ---
export async function fetchProjects(filter?: { year?: number; month?: number; store_id?: number }): Promise<Project[]> {
  const params = new URLSearchParams();
  if (filter?.year) params.set('year', String(filter.year));
  if (filter?.month) params.set('month', String(filter.month));
  if (filter?.store_id) params.set('store_id', String(filter.store_id));
  const res = await fetch(`/api/projects?${params}`);
  return res.json();
}

export async function fetchProject(id: number): Promise<(Project & { store: Store }) | null> {
  const res = await fetch(`/api/projects?id=${id}`);
  const p: Project | null = await res.json();
  if (!p) return null;
  const store = getStore(p.store_id);
  if (!store) return null;
  return { ...p, store };
}

export async function createProject(data: {
  store_id: number;
  year: number;
  month: number;
  week_number: number;
  week_role: string;
  theme: string;
}): Promise<Project[]> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createProjectsBulk(items: Array<{
  store_id: number;
  year: number;
  month: number;
  week_number: number;
  week_role: string;
  theme: string;
}>): Promise<Project[]> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  });
  return res.json();
}

export async function updateProject(id: number, updates: Partial<Project>): Promise<void> {
  await fetch('/api/projects', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function toggleChecklist(projectId: number, checkId: number): Promise<void> {
  await fetch('/api/projects/checklist', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, checkId }),
  });
}

export async function deleteProject(id: number): Promise<void> {
  await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
}

// --- Music (API) ---
export async function fetchMusicStocks(storeId?: number): Promise<MusicStock[]> {
  const params = storeId ? `?store_id=${storeId}` : '';
  const res = await fetch(`/api/music${params}`);
  return res.json();
}

export async function addMusicStock(data: {
  store_id: number;
  title: string;
  mood: string;
  bpm: number | null;
  suitable_scene: string;
  drive_url: string;
  notes: string;
}): Promise<MusicStock> {
  const res = await fetch('/api/music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMusicStock(id: number): Promise<void> {
  await fetch(`/api/music?id=${id}`, { method: 'DELETE' });
}
