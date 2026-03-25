import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const storeId = req.nextUrl.searchParams.get('store_id');
  let query = supabase.from('music_stocks').select('*').order('id');
  if (storeId) query = query.eq('store_id', Number(storeId));
  const { data } = await query;
  return NextResponse.json(data || []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from('music_stocks').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  await supabase.from('music_stocks').delete().eq('id', id);
  return NextResponse.json({ ok: true });
}
