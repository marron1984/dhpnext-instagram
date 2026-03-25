import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb();
  db.prepare('DELETE FROM music_stocks WHERE id = ?').run(Number(params.id));
  return NextResponse.json({ success: true });
}
