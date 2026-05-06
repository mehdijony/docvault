// apps/web/src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { QueryProvider } from '@/providers/query-provider';
import { Toaster } from 'sonner';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.error === 'RefreshAccessTokenError') {
    redirect('/login');
  }

  return (
    <QueryProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header session={session} />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
      <Toaster position="bottom-right" richColors />
    </QueryProvider>
  );
}