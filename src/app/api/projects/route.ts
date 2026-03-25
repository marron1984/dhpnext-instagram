import { NextRequest, NextResponse } from 'next/server';
import { readProjects, writeProjects } from '@/lib/db';

interface ChecklistItem {
  id: number;
  item_text: string;
  checked: boolean;
}

interface Project {
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

function deriveStatus(p: Project): string {
  if (p.final_status === 'completed') return 'completed';
  if (p.checkback_status === 'in_progress' || p.checkback_status === 'completed') return 'review';
  if (p.monday_done || p.tuesday_done || p.wednesday_done || p.thursday_done ||
      p.draft_status === 'in_progress' || p.draft_status === 'completed') return 'in_progress';
  return 'planning';
}

// GET /api/projects?year=2026&month=4&store_id=1
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const store_id = searchParams.get('store_id');
  const id = searchParams.get('id');

  const all = readProjects() as Project[];

  if (id) {
    const p = all.find(p => p.id === Number(id));
    return NextResponse.json(p || null);
  }

  const filtered = all.filter(p => {
    if (year && p.year !== Number(year)) return false;
    if (month && p.month !== Number(month)) return false;
    if (store_id && p.store_id !== Number(store_id)) return false;
    return true;
  });
  return NextResponse.json(filtered);
}

// POST /api/projects - create or bulk create
export async function POST(req: NextRequest) {
  const body = await req.json();
  const all = readProjects() as Project[];
  const nextId = all.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  let nextCheckId = all.reduce((max, p) => Math.max(max, p.checklist?.reduce((cm, c) => Math.max(cm, c.id), 0) || 0), 0) + 1;

  // Support array for bulk create
  const items: Array<{ store_id: number; year: number; month: number; week_number: number; week_role: string; theme: string }> = Array.isArray(body) ? body : [body];
  const created: Project[] = [];

  items.forEach((data, i) => {
    const checklist: ChecklistItem[] = CHECKLIST_DEFAULTS.map((text, ci) => ({
      id: nextCheckId + ci,
      item_text: text,
      checked: false,
    }));
    nextCheckId += CHECKLIST_DEFAULTS.length;

    const project: Project = {
      id: nextId + i,
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
      checklist,
      created_at: new Date().toISOString(),
    };
    all.push(project);
    created.push(project);
  });

  writeProjects(all);
  return NextResponse.json(created, { status: 201 });
}

// PUT /api/projects - update
export async function PUT(req: NextRequest) {
  const { id, ...updates } = await req.json();
  const all = readProjects() as Project[];
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const merged = { ...all[idx], ...updates } as Project;
  if (!updates.status) {
    merged.status = deriveStatus(merged);
  }
  all[idx] = merged;
  writeProjects(all);
  return NextResponse.json(merged);
}

// DELETE /api/projects?id=1
export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  const all = (readProjects() as Project[]).filter(p => p.id !== id);
  writeProjects(all);
  return NextResponse.json({ ok: true });
}
