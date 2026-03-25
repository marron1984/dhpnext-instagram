import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

interface ProjectRow {
  id: number;
  monday_done: boolean;
  tuesday_done: boolean;
  wednesday_done: boolean;
  thursday_done: boolean;
  draft_status: string;
  checkback_status: string;
  final_status: string;
  status: string;
  [key: string]: unknown;
}

function deriveStatus(p: ProjectRow): string {
  if (p.final_status === 'completed') return 'completed';
  if (p.checkback_status === 'in_progress' || p.checkback_status === 'completed') return 'review';
  if (p.monday_done || p.tuesday_done || p.wednesday_done || p.thursday_done ||
      p.draft_status === 'in_progress' || p.draft_status === 'completed') return 'in_progress';
  return 'planning';
}

// GET /api/projects
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const store_id = searchParams.get('store_id');
  const id = searchParams.get('id');

  if (id) {
    const { data: project } = await supabase.from('projects').select('*').eq('id', Number(id)).single();
    if (!project) return NextResponse.json(null);
    const { data: checklist } = await supabase.from('checklist_items').select('*').eq('project_id', project.id).order('id');
    return NextResponse.json({ ...project, checklist: checklist || [] });
  }

  let query = supabase.from('projects').select('*');
  if (year) query = query.eq('year', Number(year));
  if (month) query = query.eq('month', Number(month));
  if (store_id) query = query.eq('store_id', Number(store_id));
  query = query.order('id');

  const { data: projects } = await query;
  if (!projects || projects.length === 0) return NextResponse.json([]);

  const ids = projects.map(p => p.id);
  const { data: allChecklist } = await supabase.from('checklist_items').select('*').in('project_id', ids).order('id');

  const result = projects.map(p => ({
    ...p,
    checklist: (allChecklist || []).filter(c => c.project_id === p.id),
  }));

  return NextResponse.json(result);
}

// POST /api/projects
export async function POST(req: NextRequest) {
  const body = await req.json();
  const items: Array<{ store_id: number; year: number; month: number; week_number: number; week_role: string; theme: string }> = Array.isArray(body) ? body : [body];

  const created = [];
  for (const data of items) {
    const { data: project, error } = await supabase.from('projects').insert({
      store_id: data.store_id,
      year: data.year,
      month: data.month,
      week_number: data.week_number,
      week_role: data.week_role,
      theme: data.theme,
    }).select().single();

    if (error || !project) continue;

    const checklistRows = CHECKLIST_DEFAULTS.map(text => ({
      project_id: project.id,
      item_text: text,
      checked: false,
    }));
    await supabase.from('checklist_items').insert(checklistRows);

    const { data: checklist } = await supabase.from('checklist_items').select('*').eq('project_id', project.id).order('id');
    created.push({ ...project, checklist: checklist || [] });
  }

  return NextResponse.json(created, { status: 201 });
}

// PUT /api/projects
export async function PUT(req: NextRequest) {
  const { id, checklist: _cl, ...updates } = await req.json();

  // Derive status if not explicitly set
  if (!updates.status) {
    const { data: current } = await supabase.from('projects').select('*').eq('id', id).single();
    if (current) {
      const merged = { ...current, ...updates } as ProjectRow;
      updates.status = deriveStatus(merged);
    }
  }

  const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

// DELETE /api/projects
export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  await supabase.from('projects').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
