import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  const db = getDb();
  const body = await request.json();

  db.prepare('UPDATE checklist_items SET checked = ? WHERE id = ?')
    .run(body.checked ? 1 : 0, body.id);

  return NextResponse.json({ success: true });
}
