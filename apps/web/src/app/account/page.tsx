'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Car, Package, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AccountPage() {
  const { accessToken, user, clearAuth } = useAuthStore();
  const isAuthenticated = !!accessToken;
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Hesabım' }]} />

      <h1 className="text-2xl font-bold mb-2">
        Merhaba, {user.firstName}!
      </h1>
      <p className="text-muted-foreground mb-8">Hesap bilgilerinizi ve işlemlerinizi buradan yönetebilirsiniz.</p>

      <div className="grid grid-cols-1 gap-4">
        {/* Profile card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User size={18} />
              Profil Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ad</p>
                <p className="font-medium">{user.firstName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Soyad</p>
                <p className="font-medium">{user.lastName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">E-posta</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.role === 'Admin' && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rol</p>
                <span className="inline-block bg-brand-muted text-brand text-xs font-medium px-2 py-0.5 rounded-full">
                  Yönetici
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Garage card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car size={18} />
              Garajım
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Kayıtlı araçlarınızı görüntüleyin ve yönetin.
            </p>
            <Link href="/garage" className={cn(buttonVariants({ variant: 'outline' }), 'text-sm')}>
              Garaja Git
            </Link>
          </CardContent>
        </Card>

        {/* Orders card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package size={18} />
              Siparişlerim
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Henüz sipariş bulunmamaktadır.</p>
          </CardContent>
        </Card>

        {/* Settings card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings size={18} />
              Hesap Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Hesap ayarları yakında kullanıma açılacaktır.</p>
          </CardContent>
        </Card>

        {/* Logout */}
        <div className="pt-2">
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut size={16} className="mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </div>
    </div>
  );
}
