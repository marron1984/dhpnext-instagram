import { NextRequest, NextResponse } from 'next/server';
import { readMusic, writeMusic } from '@/lib/db';

interface MusicStock {
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

// GET /api/music?store_id=1
export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get('store_id');
  const all = readMusic() as MusicStock[];
  const filtered = storeId ? all.filter(m => m.store_id === Number(storeId)) : all;
  return NextResponse.json(filtered);
}

// POST /api/music
export async function POST(req: NextRequest) {
  const body = await req.json();
  const all = readMusic() as MusicStock[];
  const nextId = all.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  const stock: MusicStock = {
    id: nextId,
    ...body,
    used_in: '',
    created_at: new Date().toISOString(),
  };
  all.push(stock);
  writeMusic(all);
  return NextResponse.json(stock, { status: 201 });
}

// DELETE /api/music?id=1
export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  const all = (readMusic() as MusicStock[]).filter(m => m.id !== id);
  writeMusic(all);
  return NextResponse.json({ ok: true });
}
