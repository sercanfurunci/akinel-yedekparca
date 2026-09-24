'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
  partNumber?: string;
  price: number;
  currency: string;
}

export default function AdminStockPage() {
  const { accessToken } = useAuthStore();
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQty, setNewQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    api.admin.products.list({ pageSize: '200', page: '1' }, accessToken)
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setItems((result.items ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          brandName: p.brandName,
          categoryName: p.categoryName,
          stockStatus: p.stockStatus,
          partNumber: undefined,
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
      const result = await api.admin.stock.update(id, parseInt(newQty), accessToken) as { status: string };
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, stockStatus: result.status } : item
      ));
      setEditingId(null);
      setNewQty('');
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const statusOrder: Record<string, number> = { OutOfStock: 0, LowStock: 1, InStock: 2 };

  const sortedItems = [...items].sort((a, b) => {
    const aOrder = statusOrder[a.stockStatus] ?? 0;
    const bOrder = statusOrder[b.stockStatus] ?? 0;
    return aOrder - bOrder;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Stok Yönetimi</h1>

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
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">Stok Durumu</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      Ürün bulunamadı
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium line-clamp-1">{item.name}</p>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{item.brandName}</td>
                      <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">{item.categoryName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatusColor(item.stockStatus)}`}>
                          {stockStatusLabel(item.stockStatus)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingId(item.id); setNewQty(''); }}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Stok Güncelle</h2>
              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-1 mb-4">
              <Label htmlFor="qty">Yeni Miktar</Label>
              <Input
                id="qty"
                type="number"
                min="0"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                placeholder="0"
                autoFocus
              />
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
