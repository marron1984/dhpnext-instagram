import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { CHECKLIST_ITEMS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const storeId = searchParams.get('store_id');

  let query = `
    SELECT p.*, s.name as store_name, s.slug as store_slug
    FROM projects p
    JOIN stores s ON p.store_id = s.id
    WHERE 1=1
  `;
  const params: (string | number)[] = [];

  if (year) { query += ' AND p.year = ?'; params.push(Number(year)); }
  if (month) { query += ' AND p.month = ?'; params.push(Number(month)); }
  if (storeId) { query += ' AND p.store_id = ?'; params.push(Number(storeId)); }

  query += ' ORDER BY p.year, p.month, p.week_number, p.store_id';
  const projects = db.prepare(query).all(...params);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const stmt = db.prepare(`
    INSERT INTO projects (store_id, year, month, week_number, week_role, theme, target, appeal_axis, video_duration, tone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'planning')
  `);

  const result = stmt.run(
    body.store_id, body.year, body.month, body.week_number,
    body.week_role, body.theme, body.target || '', body.appeal_axis || '',
    body.video_duration || '15-30秒', body.tone || ''
  );

  // Create checklist items for this project
  const checkStmt = db.prepare('INSERT INTO checklist_items (project_id, item_text) VALUES (?, ?)');
  for (const item of CHECKLIST_ITEMS) {
    checkStmt.run(result.lastInsertRowid, item);
  }

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
