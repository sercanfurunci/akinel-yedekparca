'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ProductListItem, PaginatedResult } from '@/lib/types';
import { stockStatusColor, stockStatusLabel } from '@/lib/utils';

interface Stats {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

function fetchProducts(params: Record<string, string>, token: string) {
  return api.admin.products.list(
    { includeInactive: 'false', ...params },
    token,
  ) as Promise<PaginatedResult<ProductListItem>>;
}

export default function AdminDashboard() {
  const { accessToken } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [lowStockItems, setLowStockItems] = useState<ProductListItem[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<ProductListItem[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;

    Promise.all([
      fetchProducts({ pageSize: '1', page: '1' }, accessToken),
      fetchProducts({ pageSize: '1', page: '1', stockStatusFilter: 'InStock' }, accessToken),
      fetchProducts({ pageSize: '20', page: '1', stockStatusFilter: 'LowStock' }, accessToken),
      fetchProducts({ pageSize: '20', page: '1', stockStatusFilter: 'OutOfStock' }, accessToken),
      fetchProducts({ pageSize: '10', page: '1' }, accessToken),
    ])
      .then(([all, inStock, lowStock, outOfStock, recent]) => {
        setStats({
          total: all.totalCount ?? 0,
          inStock: inStock.totalCount ?? 0,
          lowStock: lowStock.totalCount ?? 0,
          outOfStock: outOfStock.totalCount ?? 0,
        });
        setLowStockItems(lowStock.items ?? []);
        setOutOfStockItems(outOfStock.items ?? []);
        setRecentProducts(recent.items ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken]);

  const statCards = [
    { label: 'Toplam Ürün',  value: stats?.total ?? '—',     icon: Package,       color: 'bg-brand-muted text-brand' },
    { label: 'Stokta',       value: stats?.inStock ?? '—',   icon: CheckCircle,   color: 'bg-green-100 text-green-700' },
    { label: 'Az Stok',      value: stats?.lowStock ?? '—',  icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Tükendi',      value: stats?.outOfStock ?? '—',icon: XCircle,       color: 'bg-red-100 text-red-700' },
  ];

  const alertItems = [
    ...outOfStockItems.map(p => ({ ...p, _alert: 'out' as const })),
    ...lowStockItems.map(p => ({ ...p, _alert: 'low' as const })),
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gösterge Paneli</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-5 border">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-2xl font-bold">{loading ? '...' : value.toLocaleString('tr-TR')}</p>
          </div>
        ))}
      </div>

      {/* Stok Uyarıları */}
      {(loading || alertItems.length > 0) && (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              Stok Uyarıları
              {!loading && (
                <span className="text-xs font-normal text-muted-foreground">
                  ({(stats?.outOfStock ?? 0) + (stats?.lowStock ?? 0)} ürün)
                </span>
              )}
            </h2>
            <Link
              href="/admin/products?stockStatusFilter=OutOfStock"
              className="text-xs text-brand hover:underline"
            >
              Tümünü Gör
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}
            </div>
          ) : alertItems.length === 0 ? (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <CheckCircle size={14} /> Tüm ürünler stokta — uyarı yok.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs">
                    <th className="text-left py-2 font-medium">Ürün</th>
                    <th className="text-left py-2 font-medium hidden md:table-cell">Marka</th>
                    <th className="text-left py-2 font-medium hidden lg:table-cell">Kategori</th>
                    <th className="text-right py-2 font-medium">Stok</th>
                    <th className="text-right py-2 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {alertItems.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-2.5">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="hover:text-brand transition-colors line-clamp-1 font-medium"
                        >
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-2.5 text-muted-foreground hidden md:table-cell">{p.brandName}</td>
                      <td className="py-2.5 text-muted-foreground hidden lg:table-cell">{p.categoryName}</td>
                      <td className="py-2.5 text-right tabular-nums font-medium">
                        {p.stockQuantity}
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
              {((stats?.outOfStock ?? 0) + (stats?.lowStock ?? 0)) > 40 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Yalnızca ilk 20 gösteriliyor.{' '}
                  <Link href="/admin/products" className="text-brand hover:underline">
                    Tüm ürünleri gör →
                  </Link>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Son Ürünler */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Son Eklenen Ürünler</h2>
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
                {recentProducts.map(p => (
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
