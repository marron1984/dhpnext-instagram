'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'ダッシュボード', icon: '📊' },
  { href: '/calendar', label: '月間カレンダー', icon: '📅' },
  { href: '/workflow', label: '週次ワークフロー', icon: '🔄' },
  { href: '/production', label: '制作管理', icon: '🎬' },
  { href: '/templates', label: 'Claude指示テンプレート', icon: '🤖' },
  { href: '/music', label: '音楽ストック', icon: '🎵' },
  { href: '/checklist', label: '最終チェック', icon: '✅' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-lg font-bold">Instagram</h1>
        <p className="text-sm text-gray-400 mt-1">プロモーション管理</p>
      </div>
      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-gray-700 text-white border-r-2 border-blue-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500">
        毎週木曜 21:00 投稿
      </div>
    </aside>
  );
}
