import crypto from 'crypto';
import { cookies } from 'next/headers';
import { readUsers, writeUsers, readSessions, writeSessions, type User } from './db';

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

export async function register(username: string, password: string, displayName: string): Promise<{ ok: true; user: Omit<User, 'password_hash'> } | { ok: false; error: string }> {
  if (!username || username.length < 2) return { ok: false, error: 'ユーザー名は2文字以上で入力してください' };
  if (!password || password.length < 4) return { ok: false, error: 'パスワードは4文字以上で入力してください' };

  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return { ok: false, error: 'このユーザー名は既に使われています' };
  }

  const nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
  const user: User = {
    id: nextId,
    username,
    password_hash: hashPassword(password),
    display_name: displayName || username,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);

  const { password_hash: _, ...safe } = user;
  return { ok: true, user: safe };
}

export async function login(username: string, password: string): Promise<{ ok: true; token: string; user: Omit<User, 'password_hash'> } | { ok: false; error: string }> {
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { ok: false, error: 'ユーザー名またはパスワードが正しくありません' };
  }

  const token = generateToken();
  const sessions = readSessions();
  sessions.push({
    token,
    user_id: user.id,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + SESSION_DURATION_MS).toISOString(),
  });
  writeSessions(sessions);

  const { password_hash: _, ...safe } = user;
  return { ok: true, token, user: safe };
}

export async function logout(token: string): Promise<void> {
  const sessions = readSessions().filter(s => s.token !== token);
  writeSessions(sessions);
}

export async function getSessionUser(): Promise<Omit<User, 'password_hash'> | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const sessions = readSessions();
  const session = sessions.find(s => s.token === token && new Date(s.expires_at) > new Date());
  if (!session) return null;

  const users = readUsers();
  const user = users.find(u => u.id === session.user_id);
  if (!user) return null;

  const { password_hash: _, ...safe } = user;
  return safe;
}

export { SESSION_COOKIE, SESSION_DURATION_MS };
