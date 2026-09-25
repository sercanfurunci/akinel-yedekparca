'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Car, Search, Phone, ShoppingCart, Shield } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full">

      {/* Utility bar — desktop only */}
      <div className="hidden md:block bg-[#111827] border-b border-white/5">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-8 text-xs text-white/60">
          <a
            href="tel:+905331405649"
            className="flex items-center gap-1.5 hover:text-brand transition-colors"
          >
            <Phone size={11} />
            +90 533 140 56 49
          </a>
          <div className="flex items-center gap-4">
            <Link href="/search" className="hover:text-white transition-colors">Sipariş Takip</Link>
            <span className="text-white/20">|</span>
            <Link href="/contact" className="hover:text-white transition-colors">Yardım</Link>
            <span className="text-white/20">|</span>
            <Link href="/contact" className="hover:text-white transition-colors">İletişim</Link>
            <span className="text-white/20">|</span>
            <span>TR</span>
          </div>
        </div>
      </div>

      {/* Main header — dark bar */}
      <div className="bg-[#111827]">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center gap-4">
            {/* Mobile nav trigger */}
            <MobileNav />

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img src="/logo.png" alt="AKINEL OTO YEDEK PARÇA" className="h-11 w-auto" />
            </Link>

            {/* Search bar — flex-1 center, white container */}
            <div className="flex-1 max-w-2xl hidden md:block mx-auto">
              <div className="bg-white rounded-lg shadow-sm">
                <GlobalSearch />
              </div>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 ml-auto md:ml-0">
              {/* Mobile search icon */}
              <Link
                href="/search"
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label="Ara"
              >
                <Search size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label="Sepet"
              >
                <ShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold leading-none ring-2 ring-[#111827]">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Garage */}
              <Link
                href="/garage"
                className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                aria-label="Garajım"
              >
                <Car size={20} />
              </Link>

              {/* Account */}
              {isAuthenticated ? (
                <Link
                  href="/account"
                  className="hidden md:inline-flex h-10 items-center gap-2 px-3 rounded-lg text-white hover:bg-white/10 transition-colors text-sm"
                >
                  <User size={16} />
                  {user?.firstName}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
                  aria-label="Giriş Yap"
                >
                  <User size={20} />
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden md:inline-flex h-8 items-center gap-1.5 px-3 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-colors"
                >
                  <Shield size={13} />
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop nav bar — secondary dark */}
      <div className="hidden md:block bg-[#1F2937] border-b border-black/20">
        <div className="container mx-auto px-4 max-w-7xl">
          <nav className="flex items-center justify-center gap-0 h-11">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'relative px-4 h-full inline-flex items-center text-sm font-medium transition-colors',
                    isActive
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  )}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-t-sm" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Vehicle context chip row */}
      {selectedVehicle && (
        <div className="border-b border-border bg-brand-muted">
          <div className="container mx-auto px-4 max-w-7xl py-1.5">
            <VehicleContextChip />
          </div>
        </div>
      )}
    </header>
    </>
  );
}
