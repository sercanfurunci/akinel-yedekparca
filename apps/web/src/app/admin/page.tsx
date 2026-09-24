'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ProductListItem, PaginatedResult } from '@/lib/types';
import { stockStatusLabel, stockStatusColor } from '@/lib/utils';

interface Stats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export default function AdminDashboard() {
  const { accessToken } = useAuthStore();
  const [recentProducts, setRecentProducts] = useState<ProductListItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    api.admin.products.list({ pageSize: '200', page: '1' }, accessToken)
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        const items = result.items ?? [];
        const inStock = items.filter((p) => p.stockStatus === 'InStock' || (p.stockStatus as unknown as number) === 2).length;
        const lowStock = items.filter((p) => p.stockStatus === 'LowStock' || (p.stockStatus as unknown as number) === 1).length;
        const outOfStock = items.filter((p) => p.stockStatus === 'OutOfStock' || (p.stockStatus as unknown as number) === 0).length;
        setStats({ total: result.totalCount ?? items.length, inStock, lowStock, outOfStock });
        setRecentProducts(items.slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const statCards = [
    { label: 'Toplam Ürün', value: stats?.total ?? '—', icon: Package, color: 'bg-brand-muted text-brand' },
    { label: 'Stokta', value: stats?.inStock ?? '—', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    { label: 'Az Stok', value: stats?.lowStock ?? '—', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Tükendi', value: stats?.outOfStock ?? '—', icon: XCircle, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Gösterge Paneli</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 border">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{loading ? '...' : value}</p>
          </div>
        ))}
      </div>

      {/* Recent products */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Son Ürünler</h2>
          <Link href="/admin/products" className="text-xs text-brand hover:underline">
            Tümünü Gör
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        ) : recentProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz ürün bulunmamaktadır.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground text-xs">
                  <th className="text-left py-2 font-medium">Ürün Adı</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Marka</th>
                  <th className="text-left py-2 font-medium hidden lg:table-cell">Kategori</th>
                  <th className="text-right py-2 font-medium">Fiyat</th>
                  <th className="text-right py-2 font-medium">Stok</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5">
                      <Link href={`/admin/products/${p.id}`} className="hover:text-brand transition-colors line-clamp-1">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-2.5 text-muted-foreground hidden md:table-cell">{p.brandName}</td>
                    <td className="py-2.5 text-muted-foreground hidden lg:table-cell">{p.categoryName}</td>
                    <td className="py-2.5 text-right font-medium">
                      {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: p.currency ?? 'TRY' }).format(p.price)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatusColor(p.stockStatus)}`}>
                        {stockStatusLabel(p.stockStatus)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
