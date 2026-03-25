import crypto from 'crypto';
import { cookies } from 'next/headers';
import { supabase } from './supabase';

const SESSION_COOKIE = 'session_token';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === testHash;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

interface SafeUser {
  id: number;
  username: string;
  display_name: string;
  created_at: string;
}

export async function register(username: string, password: string, displayName: string): Promise<{ ok: true; user: SafeUser } | { ok: false; error: string }> {
  if (!username || username.length < 2) return { ok: false, error: 'ユーザー名は2文字以上で入力してください' };
  if (!password || password.length < 4) return { ok: false, error: 'パスワードは4文字以上で入力してください' };

  const { data: existing } = await supabase.from('users').select('id').eq('username', username).single();
  if (existing) return { ok: false, error: 'このユーザー名は既に使われています' };

  const { data: user, error } = await supabase.from('users').insert({
    username,
    password_hash: hashPassword(password),
    display_name: displayName || username,
  }).select('id, username, display_name, created_at').single();

  if (error || !user) return { ok: false, error: 'アカウント作成に失敗しました' };
  return { ok: true, user };
}

export async function login(username: string, password: string): Promise<{ ok: true; token: string; user: SafeUser } | { ok: false; error: string }> {
  const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { ok: false, error: 'ユーザー名またはパスワードが正しくありません' };
  }

  const token = generateToken();
  await supabase.from('sessions').insert({
    token,
    user_id: user.id,
    expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  });

  return {
    ok: true,
    token,
    user: { id: user.id, username: user.username, display_name: user.display_name, created_at: user.created_at },
  };
}

export async function logout(token: string): Promise<void> {
  await supabase.from('sessions').delete().eq('token', token);
}

export async function getSessionUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) return null;

  const { data: user } = await supabase
    .from('users')
    .select('id, username, display_name, created_at')
    .eq('id', session.user_id)
    .single();

  return user || null;
}

export { SESSION_COOKIE, SESSION_DURATION_MS };
