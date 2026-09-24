'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Car, Search, Phone, ShoppingCart } from 'lucide-react';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { VehicleContextChip } from '@/components/vehicle/VehicleContextChip';
import { MobileNav } from '@/components/layout/MobileNav';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useAuthStore } from '@/store/authStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

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

export function Header() {
  const pathname = usePathname();
  const { accessToken, user } = useAuthStore();
  const isAuthenticated = !!accessToken;
  const isAdmin = user?.role === 'Admin';
  const { selectedVehicle } = useVehicleStore();
  const { totalItems, openCart, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <>
    <CartDrawer />
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

      {/* Utility bar — desktop only */}
      <div className="hidden md:block border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-8 text-xs text-muted-foreground">
          <a
            href="tel:+905331405649"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Phone size={11} />
            +90 533 140 56 49
          </a>
          <div className="flex items-center gap-4">
            <Link href="/search" className="hover:text-foreground transition-colors">Sipariş Takip</Link>
            <span className="text-border">|</span>
            <Link href="/contact" className="hover:text-foreground transition-colors">Yardım</Link>
            <span className="text-border">|</span>
            <Link href="/contact" className="hover:text-foreground transition-colors">İletişim</Link>
            <span className="text-border">|</span>
            <span>TR</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center gap-4">
          {/* Mobile nav trigger */}
          <MobileNav />

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img src="/logo.png" alt="AKİNEL OTO YEDEK PARÇA" className="h-10 w-auto rounded-md" />
          </Link>

          {/* Search bar — flex-1 center */}
          <div className="flex-1 max-w-2xl hidden md:block mx-auto">
            <GlobalSearch />
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Mobile search icon */}
            <Link
              href="/search"
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Ara"
            >
              <Search size={20} />
            </Link>

            {/* Cart */}
            <button
              onClick={openCart}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Sepet"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-brand-foreground text-[10px] font-bold leading-none">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Garage */}
            <Link
              href="/garage"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
              aria-label="Garajım"
            >
              <Car size={20} />
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <Link
                href="/account"
                className="hidden md:inline-flex h-9 items-center gap-2 px-3 rounded-lg hover:bg-muted transition-colors text-sm"
              >
                <User size={16} />
                {user?.firstName}
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors"
                aria-label="Giriş Yap"
              >
                <User size={20} />
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:inline-flex h-9 items-center px-3 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors"
              >
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Desktop nav bar — centered */}
      <div className="hidden md:block border-t border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className="flex items-center justify-center gap-0.5 h-10">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-4 py-1.5 rounded-md text-sm transition-colors',
                  pathname === href
                    ? 'bg-brand text-brand-foreground font-medium'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Vehicle context chip row */}
      {selectedVehicle && (
        <div className="border-t border-border/50 bg-brand-muted/50">
          <div className="container mx-auto px-4 max-w-7xl py-1.5">
            <VehicleContextChip />
          </div>
        </div>
      )}
    </header>
    </>
  );
}
