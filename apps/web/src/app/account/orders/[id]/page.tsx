'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Order } from '@/lib/types';
import { formatPrice, getImageUrl } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  Pending: { label: 'Bekliyor', className: 'bg-yellow-100 text-yellow-800' },
  Confirmed: { label: 'Onaylandı', className: 'bg-blue-100 text-blue-800' },
  Preparing: { label: 'Hazırlanıyor', className: 'bg-orange-100 text-orange-800' },
  Shipped: { label: 'Kargoya Verildi', className: 'bg-purple-100 text-purple-800' },
  Delivered: { label: 'Teslim Edildi', className: 'bg-green-100 text-green-800' },
  Cancelled: { label: 'İptal', className: 'bg-red-100 text-red-800' },
};

const paymentLabels: Record<string, string> = {
  CreditCard: 'Kredi Kartı',
  BankTransfer: 'Banka Havalesi',
  CashOnDelivery: 'Kapıda Ödeme',
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { accessToken, _hasHydrated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken) {
      router.push('/login?redirect=/account/orders');
      return;
    }
    api.orders.get(id, accessToken)
      .then((data) => setOrder(data as Order))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, accessToken, _hasHydrated, router]);

  if (!_hasHydrated || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl text-center">
        <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" strokeWidth={1} />
        <p className="font-medium mb-4">Sipariş bulunamadı.</p>
        <Link href="/account/orders" className="text-brand hover:underline text-sm">Siparişlere Dön</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/account/orders" className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold leading-tight font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="space-y-6">
        {/* Items */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold">Ürünler</h2>
          {order.items.map((item) => {
            const imgUrl = getImageUrl(item.productImageUrl);
            return (
              <div key={item.id} className="flex gap-3 py-2 border-t first:border-t-0">
                <div className="w-14 h-14 rounded-lg border bg-muted shrink-0 flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img src={imgUrl} alt={item.productName} className="w-full h-full object-contain p-1" />
                  ) : (
                    <Package size={20} className="text-muted-foreground/30" strokeWidth={1} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{item.productName}</p>
                  {item.productBrand && <p className="text-xs text-muted-foreground">{item.productBrand}</p>}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.quantity} adet × {formatPrice(item.unitPrice, 'TRY')}
                  </p>
                </div>
                <span className="text-sm font-semibold shrink-0">{formatPrice(item.lineTotal, 'TRY')}</span>
              </div>
            );
          })}

          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Ara Toplam</span>
              <span>{formatPrice(order.subTotal, 'TRY')}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Kargo</span>
              <span>{order.shippingCost === 0 ? 'Ücretsiz' : formatPrice(order.shippingCost, 'TRY')}</span>
            </div>
            <div className="flex justify-between font-bold text-base">
              <span>Toplam</span>
              <span className="text-brand">{formatPrice(order.totalAmount, 'TRY')}</span>
            </div>
          </div>
        </section>

        {/* Shipping & Payment info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-xl border p-4 space-y-2">
            <h2 className="font-semibold text-sm">Teslimat Adresi</h2>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{order.customerName}</p>
              <p>{order.shippingAddress}</p>
              <p>{order.shippingDistrict}, {order.shippingCity}{order.shippingPostalCode ? ` ${order.shippingPostalCode}` : ''}</p>
              {order.shippingNotes && <p className="italic">{order.shippingNotes}</p>}
            </div>
          </section>

          <section className="rounded-xl border p-4 space-y-2">
            <h2 className="font-semibold text-sm">Ödeme Bilgileri</h2>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</p>
              <p>{order.isPaid ? '✓ Ödendi' : 'Henüz ödenmedi'}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
