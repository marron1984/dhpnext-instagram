import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-screen bg-[var(--background)]">{children}</body>
    </html>
  );
}
