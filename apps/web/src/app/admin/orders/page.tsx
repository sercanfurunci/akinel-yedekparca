'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { OrderSummary } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  Pending: { label: 'Bekliyor', className: 'bg-yellow-100 text-yellow-800' },
  Confirmed: { label: 'Onaylandı', className: 'bg-blue-100 text-blue-800' },
  Preparing: { label: 'Hazırlanıyor', className: 'bg-orange-100 text-orange-800' },
  Shipped: { label: 'Kargoya Verildi', className: 'bg-purple-100 text-purple-800' },
  Delivered: { label: 'Teslim Edildi', className: 'bg-green-100 text-green-800' },
  Cancelled: { label: 'İptal', className: 'bg-red-100 text-red-800' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

interface AdminOrdersResponse {
  items: OrderSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export default function AdminOrdersPage() {
  const { accessToken } = useAuthStore();
  const [data, setData] = useState<AdminOrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    (api.admin.orders.list(page, pageSize, accessToken) as Promise<AdminOrdersResponse>)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken, page]);

  const orders = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Siparişler</h1>

      {loading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-muted rounded-lg" />)}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">Henüz sipariş yok.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Sipariş No</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Müşteri</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap hidden sm:table-cell">Tarih</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Tutar</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Durum</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs">{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium leading-tight">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-brand whitespace-nowrap">{formatPrice(order.totalAmount, 'TRY')}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-xs text-brand hover:underline whitespace-nowrap"
                      >
                        Detay <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground">Toplam {totalCount} sipariş</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="px-3 py-1">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
