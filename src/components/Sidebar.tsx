'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'ダッシュボード' },
  { href: '/calendar', label: 'カレンダー' },
  { href: '/workflow', label: 'ワークフロー' },
  { href: '/production', label: '制作管理' },
  { href: '/templates', label: '指示テンプレート' },
  { href: '/music', label: '音楽ストック' },
  { href: '/checklist', label: '最終チェック' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-56 bg-white border-r border-[var(--border)] flex flex-col">
      <div className="px-5 py-6">
        <h1 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">Instagram</h1>
        <p className="text-[11px] text-[var(--muted)] mt-0.5">Promotion Manager</p>
      </div>
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 text-[13px] rounded-md mb-0.5 transition-colors ${
                isActive
                  ? 'bg-[var(--accent)] text-white font-medium'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--accent-light)]'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 text-[11px] text-[var(--muted)] border-t border-[var(--border)]">
        毎週木曜 21:00 投稿
      </div>
    </aside>
  );
}
