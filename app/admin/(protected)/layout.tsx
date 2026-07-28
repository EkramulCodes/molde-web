import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  if (!session) {
    redirect('/admin/login?callbackUrl=/admin');
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg-deep overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-bg-primary/30">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

