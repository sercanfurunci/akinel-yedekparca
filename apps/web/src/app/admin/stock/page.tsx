'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, AlertTriangle, PackageX, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { ProductListItem, PaginatedResult } from '@/lib/types';
import { stockStatusLabel, stockStatusColor } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TableSkeleton } from '@/components/shared/Skeletons';

interface StockItem {
  id: string;
  name: string;
  brandName: string;
  categoryName: string;
  stockStatus: string;
  stockQuantity: number;
  price: number;
  currency: string;
}

export default function AdminStockPage() {
  const { accessToken } = useAuthStore();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQty, setNewQty] = useState('');
  const [newMinLevel, setNewMinLevel] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'all' | 'critical'>('all');

  useEffect(() => {
    if (!accessToken) return;
    api.admin.products.list({ pageSize: '500', page: '1', includeInactive: 'true' }, accessToken)
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setItems((result.items ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          brandName: p.brandName,
          categoryName: p.categoryName,
          stockStatus: p.stockStatus,
          stockQuantity: p.stockQuantity ?? 0,
          price: p.price,
          currency: p.currency,
        })));
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleUpdateStock = async (id: string) => {
    if (!accessToken || !newQty) return;
    setSaving(true);
    try {
      const result = await api.admin.stock.update(
        id,
        parseInt(newQty),
        newMinLevel ? parseInt(newMinLevel) : null,
        accessToken
      ) as { status: string; quantity: number };
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, stockStatus: result.status, stockQuantity: result.quantity } : item
      ));
      setEditingId(null);
      setNewQty('');
      setNewMinLevel('');
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const statusOrder: Record<string, number> = { OutOfStock: 0, LowStock: 1, InStock: 2 };
  const sortedItems = [...items].sort((a, b) => (statusOrder[a.stockStatus] ?? 0) - (statusOrder[b.stockStatus] ?? 0));

  const outOfStock = items.filter(i => i.stockStatus === 'OutOfStock');
  const lowStock = items.filter(i => i.stockStatus === 'LowStock');
  const displayed = filter === 'critical'
    ? sortedItems.filter(i => i.stockStatus === 'OutOfStock' || i.stockStatus === 'LowStock')
    : sortedItems;

  const editingItem = items.find(i => i.id === editingId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Stok Yönetimi</h1>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border bg-red-50 border-red-200 p-4 flex items-center gap-3">
            <PackageX size={22} className="text-red-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-red-600">{outOfStock.length}</p>
              <p className="text-sm text-red-700">Tükendi</p>
            </div>
          </div>
          <div className="rounded-xl border bg-amber-50 border-amber-200 p-4 flex items-center gap-3">
            <AlertTriangle size={22} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-amber-600">{lowStock.length}</p>
              <p className="text-sm text-amber-700">Kritik Stok (Az)</p>
            </div>
          </div>
          <div className="rounded-xl border bg-green-50 border-green-200 p-4 flex items-center gap-3">
            <Package size={22} className="text-green-500 shrink-0" />
            <div>
              <p className="text-2xl font-bold text-green-600">{items.length - outOfStock.length - lowStock.length}</p>
              <p className="text-sm text-green-700">Stokta</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      {!loading && (outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === 'all' ? 'bg-brand text-white' : 'border hover:bg-muted/40'}`}
          >
            Tümü ({items.length})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${filter === 'critical' ? 'bg-red-500 text-white' : 'border border-red-200 text-red-600 hover:bg-red-50'}`}
          >
            <AlertTriangle size={13} />
            Kritik ({outOfStock.length + lowStock.length})
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ürün</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Marka</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Kategori</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Miktar</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Durum</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      Ürün bulunamadı
                    </td>
                  </tr>
                ) : (
                  displayed.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b last:border-0 transition-colors ${
                        item.stockStatus === 'OutOfStock'
                          ? 'bg-red-50/50 hover:bg-red-50'
                          : item.stockStatus === 'LowStock'
                          ? 'bg-amber-50/50 hover:bg-amber-50'
                          : 'hover:bg-muted/20'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <Link href={`/admin/products/${item.id}`} className="font-medium line-clamp-1 hover:text-brand transition-colors">
                          {item.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{item.brandName}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{item.categoryName}</td>
                      <td className="py-3 px-4 text-center font-mono font-medium">
                        {item.stockQuantity}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatusColor(item.stockStatus)}`}>
                          {stockStatusLabel(item.stockStatus)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingId(item.id); setNewQty(String(item.stockQuantity)); setNewMinLevel(''); }}
                        >
                          Güncelle
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock update modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-semibold">Stok Güncelle</h2>
              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground" aria-label="Kapat">
                <X size={18} />
              </button>
            </div>
            {editingItem && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{editingItem.name}</p>
            )}
            <div className="space-y-4 mb-4">
              <div className="space-y-1">
                <Label htmlFor="qty">Mevcut Miktar</Label>
                <Input
                  id="qty"
                  type="number"
                  min="0"
                  value={newQty}
                  onChange={(e) => setNewQty(e.target.value)}
                  placeholder="0"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">Depodaki toplam stok adedi.</p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="minLevel">Kritik Stok Seviyesi <span className="text-muted-foreground font-normal">(isteğe bağlı)</span></Label>
                <Input
                  id="minLevel"
                  type="number"
                  min="0"
                  value={newMinLevel}
                  onChange={(e) => setNewMinLevel(e.target.value)}
                  placeholder="5"
                />
                <p className="text-xs text-muted-foreground">Bu seviyenin altına düştüğünde "Az Stok" uyarısı gösterilir. Varsayılan: 5.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
                disabled={!newQty || saving}
                onClick={() => handleUpdateStock(editingId)}
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setEditingId(null)}>
                İptal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
