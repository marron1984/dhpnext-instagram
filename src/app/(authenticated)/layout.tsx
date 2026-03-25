import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

export const dynamic = 'force-dynamic';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={user.display_name} />
      <main className="flex-1 ml-56 p-8 max-w-[1200px]">{children}</main>
    </div>
  );
}
