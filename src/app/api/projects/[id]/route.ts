import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const project = db.prepare(`
    SELECT p.*, s.name as store_name, s.slug as store_slug,
           s.main_tone as store_tone, s.strong_values, s.avoid, s.music_tone
    FROM projects p
    JOIN stores s ON p.store_id = s.id
    WHERE p.id = ?
  `).get(Number(params.id));

  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const checklist = db.prepare(
    'SELECT * FROM checklist_items WHERE project_id = ?'
  ).all(Number(params.id));

  return NextResponse.json({ ...project, checklist });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const body = await request.json();
  const id = Number(params.id);

  const fields = Object.keys(body);
  const sets = fields.map(f => `${f} = ?`).join(', ');
  const values = fields.map(f => body[f]);

  if (fields.length > 0) {
    db.prepare(`UPDATE projects SET ${sets}, updated_at = datetime('now') WHERE id = ?`)
      .run(...values, id);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  const id = Number(params.id);
  db.prepare('DELETE FROM checklist_items WHERE project_id = ?').run(id);
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
