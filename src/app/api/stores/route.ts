import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  const db = getDb();
  const stores = db.prepare('SELECT * FROM stores').all();
  return NextResponse.json(stores);
}
