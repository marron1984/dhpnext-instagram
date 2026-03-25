import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: NextRequest) {
  const { projectId: _pid, checkId } = await req.json();

  const { data: item } = await supabase.from('checklist_items').select('checked').eq('id', checkId).single();
  if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });

  await supabase.from('checklist_items').update({ checked: !item.checked }).eq('id', checkId);
  return NextResponse.json({ ok: true });
}
