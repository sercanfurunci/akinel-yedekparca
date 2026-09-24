'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Ana Sayfa' },
  { href: '/products', label: 'Ürünler' },
  { href: '/brands', label: 'Markalar' },
  { href: '/vehicle', label: 'Aracımı Seç' },
  { href: '/search', label: 'OEM Ara' },
  { href: '/garage', label: 'Garajım' },
  { href: '/about', label: 'Hakkımızda' },
  { href: '/contact', label: 'İletişim' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { accessToken, user, clearAuth } = useAuthStore();
  const isAuthenticated = !!accessToken;
  const isAdmin = user?.role === 'Admin';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors md:hidden"
        aria-label="Menüyü aç"
      >
        <Menu size={22} />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b px-4 py-4">
          <SheetTitle className="text-left">
            <span className="text-brand font-bold text-xl">Akinel</span>
            <span className="text-muted-foreground font-normal text-base ml-1.5">Yedek Parça</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col p-4 gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors',
                pathname === href
                  ? 'bg-brand text-brand-foreground font-medium'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              {label}
            </Link>
          ))}
          <div className="border-t my-3" />
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Hesabım — {user?.firstName}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
                >
                  Admin Paneli
                </Link>
              )}
              <button
                onClick={() => { clearAuth(); setOpen(false); }}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
              >
                Kayıt Ol
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
