'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
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

export default function OrdersPage() {
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken) {
      router.push('/login?redirect=/account/orders');
      return;
    }
    api.orders.list(accessToken)
      .then((data) => setOrders(data as OrderSummary[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accessToken, _hasHydrated, router]);

  if (!_hasHydrated || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
          <p className="font-medium mb-1">Henüz siparişiniz yok</p>
          <p className="text-sm text-muted-foreground mb-6">Alışveriş yaparak başlayın.</p>
          <Link href="/products" className="inline-flex h-9 items-center justify-center rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 px-4 text-sm font-medium transition-colors">
            Ürünleri Gör
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono font-semibold text-sm">{order.orderNumber}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {order.itemCount} ürün · {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-brand">{formatPrice(order.totalAmount, 'TRY')}</span>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
