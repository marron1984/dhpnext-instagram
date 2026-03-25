import { NextRequest, NextResponse } from 'next/server';
import { readProjects, writeProjects } from '@/lib/db';

interface ChecklistItem { id: number; item_text: string; checked: boolean; }
interface Project { id: number; checklist: ChecklistItem[]; [key: string]: unknown; }

// PUT /api/projects/checklist - toggle checklist item
export async function PUT(req: NextRequest) {
  const { projectId, checkId } = await req.json();
  const all = readProjects() as Project[];
  const proj = all.find(p => p.id === projectId);
  if (!proj) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const item = proj.checklist.find(c => c.id === checkId);
  if (item) item.checked = !item.checked;
  writeProjects(all);
  return NextResponse.json({ ok: true });
}
