'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const isAuthenticated = !!accessToken;
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || !isAdmin)) router.push('/login');
  }, [_hasHydrated, isAuthenticated, isAdmin, router]);

  if (!_hasHydrated) return null;
  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 md:p-6 bg-muted/30 overflow-x-auto">{children}</main>
    </div>
  );
}
