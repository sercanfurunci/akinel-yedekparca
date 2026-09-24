'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Package, Tag, FolderOpen, Car, Archive, Users, ShoppingBag, Building2 } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Gösterge Paneli', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Ürünler', icon: Package },
  { href: '/admin/categories', label: 'Kategoriler', icon: FolderOpen },
  { href: '/admin/brands', label: 'Markalar', icon: Tag },
  { href: '/admin/vehicles', label: 'Araçlar', icon: Car },
  { href: '/admin/stock', label: 'Stok', icon: Archive },
  { href: '/admin/customers', label: 'Müşteriler', icon: Users },
  { href: '/admin/orders', label: 'Siparişler', icon: ShoppingBag },
  { href: '/admin/business', label: 'İşletme', icon: Building2 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="shrink-0 w-14 md:w-60 min-h-screen bg-[#111827] text-white flex flex-col border-r border-black/40">
      <div className="p-3 md:p-5 border-b border-white/10 flex items-center justify-center md:justify-start gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center shrink-0">
          <span className="font-bold text-white text-sm">A</span>
        </div>
        <Link href="/" className="font-bold text-base hidden md:block text-white">
          AKINEL <span className="text-white/50 font-normal text-sm">Admin</span>
        </Link>
      </div>
      <nav className="flex-1 p-2 md:p-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              title={label}
              className={cn(
                'relative flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              )}>
              <Icon size={17} className="shrink-0" />
              <span className="hidden md:block">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 md:p-4 border-t border-white/10 hidden md:block">
        <Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">
          ← Siteye Dön
        </Link>
      </div>
    </aside>
  );
}
