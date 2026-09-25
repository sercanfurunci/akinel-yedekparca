'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, Shield, User } from 'lucide-react';
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
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 active:scale-95 transition-all md:hidden cursor-pointer"
        aria-label="Menüyü aç"
        title="Menü"
      >
        <Menu size={22} />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-[#111827] text-white border-0">
        <SheetHeader className="border-b border-white/10 px-5 py-5">
          <SheetTitle className="text-left">
            <img src="/logo.png" alt="AKINEL OTO YEDEK PARÇA" className="h-10 w-auto" />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col p-4 gap-1" aria-label="Mobil menü">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-brand text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                {label}
              </Link>
            );
          })}
          <div className="border-t border-white/10 my-3" />
          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label={`Hesabım — ${user?.firstName ?? ''}`}
              >
                <User size={15} />
                Hesabım — {user?.firstName}
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <Shield size={15} className="text-brand" />
                  Admin Paneli
                </Link>
              )}
              <button
                type="button"
                onClick={() => { clearAuth(); setOpen(false); }}
                className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm text-brand hover:bg-brand/10 transition-colors w-full text-left cursor-pointer"
                aria-label="Çıkış Yap"
              >
                <LogOut size={15} />
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex items-center px-4 py-3 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-lg text-sm bg-brand text-white hover:bg-brand/90 transition-colors font-semibold cursor-pointer"
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
