'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: mode,
        username,
        password,
        display_name: displayName,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'エラーが発生しました');
      return;
    }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-lg font-semibold">Instagram</h1>
          <p className="text-[13px] text-[var(--muted)]">Promotion Manager</p>
        </div>

        <div className="bg-white border border-[var(--border)] rounded-lg p-6">
          <div className="flex mb-6 border-b border-[var(--border)]">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 pb-3 text-[13px] font-medium border-b-2 transition-colors ${mode === 'login' ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted)]'}`}
            >
              ログイン
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 pb-3 text-[13px] font-medium border-b-2 transition-colors ${mode === 'register' ? 'border-[var(--foreground)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted)]'}`}
            >
              アカウント作成
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">ユーザー名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--muted)]"
                required
                autoFocus
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-[11px] text-[var(--muted)] block mb-1">表示名</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--muted)]"
                  placeholder="省略可"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] text-[var(--muted)] block mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-[var(--border)] rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[var(--muted)]"
                required
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-[var(--foreground)] text-white rounded-md text-[13px] font-medium hover:opacity-80 disabled:opacity-50"
            >
              {loading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
