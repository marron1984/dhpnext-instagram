import { NextRequest, NextResponse } from 'next/server';
import { register, login, logout, getSessionUser, SESSION_COOKIE, SESSION_DURATION_MS } from '@/lib/auth';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const { action, username, password, display_name } = await req.json();

  if (action === 'register') {
    const result = await register(username, password, display_name || username);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

    const loginResult = await login(username, password);
    if (!loginResult.ok) return NextResponse.json({ error: loginResult.error }, { status: 400 });

    const res = NextResponse.json({ user: loginResult.user });
    res.cookies.set(SESSION_COOKIE, loginResult.token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    });
    return res;
  }

  if (action === 'login') {
    const result = await login(username, password);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });

    const res = NextResponse.json({ user: result.user });
    res.cookies.set(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    });
    return res;
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) await logout(token);

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
