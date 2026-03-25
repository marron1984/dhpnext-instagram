import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('store_id');

  let query = 'SELECT m.*, s.name as store_name FROM music_stocks m JOIN stores s ON m.store_id = s.id';
  const params: number[] = [];

  if (storeId) {
    query += ' WHERE m.store_id = ?';
    params.push(Number(storeId));
  }

  query += ' ORDER BY m.created_at DESC';
  const music = db.prepare(query).all(...params);
  return NextResponse.json(music);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  const result = db.prepare(`
    INSERT INTO music_stocks (store_id, title, mood, bpm, suitable_scene, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(body.store_id, body.title, body.mood, body.bpm || null, body.suitable_scene || '', body.notes || '');

  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 });
}
