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
    <aside className="shrink-0 w-12 md:w-60 min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="p-3 md:p-4 border-b border-slate-700 flex items-center justify-center md:justify-start">
        <Link href="/" className="font-bold text-lg hidden md:block">Akinel Admin</Link>
        <Link href="/" className="font-bold text-base md:hidden" title="Akinel Admin">A</Link>
      </div>
      <nav className="flex-1 p-1 md:p-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            title={label}
            className={cn(
              'flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2 rounded-lg mb-1 text-sm transition-colors',
              (href === '/admin' ? pathname === href : pathname.startsWith(href)) ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            )}>
            <Icon size={16} className="shrink-0" />
            <span className="hidden md:block">{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
