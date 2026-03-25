import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'Instagram プロモーション管理',
  description: '4店舗のInstagram毎週プロモーション動画制作管理システム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 ml-56 p-8 max-w-[1200px]">{children}</main>
      </body>
    </html>
  );
}
