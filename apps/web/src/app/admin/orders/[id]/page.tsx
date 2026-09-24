'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { Order } from '@/lib/types';
import { formatPrice, getImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const statusOptions = [
  { value: 0, label: 'Bekliyor' },
  { value: 1, label: 'Onaylandı' },
  { value: 2, label: 'Hazırlanıyor' },
  { value: 3, label: 'Kargoya Verildi' },
  { value: 4, label: 'Teslim Edildi' },
  { value: 5, label: 'İptal' },
];

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

const statusToInt: Record<string, number> = {
  Pending: 0,
  Confirmed: 1,
  Preparing: 2,
  Shipped: 3,
  Delivered: 4,
  Cancelled: 5,
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

const selectClass = 'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { accessToken } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    (api.admin.orders.get(id, accessToken) as Promise<Order>)
      .then((data) => {
        setOrder(data);
        setSelectedStatus(statusToInt[data.status] ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, accessToken]);

  const updateStatus = async () => {
    if (!accessToken || !order) return;
    setUpdating(true);
    setUpdateSuccess(false);
    setUpdateError('');
    try {
      const updated = await api.admin.orders.updateStatus(id, selectedStatus, accessToken) as Order;
      setOrder(updated);
      setSelectedStatus(statusToInt[updated.status] ?? selectedStatus);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Durum güncellenemedi.');
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p>Sipariş bulunamadı.</p>
        <Link href="/admin/orders" className="text-brand hover:underline mt-2 inline-block">Siparişlere Dön</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="inline-flex h-8 w-8 items-center justify-center rounded hover:bg-muted transition-colors">
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

      <div className="space-y-6 max-w-3xl">
        {/* Status update */}
        <section className="rounded-xl border p-4">
          <h2 className="font-semibold mb-3">Durum Güncelle</h2>
          <div className="flex items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(parseInt(e.target.value, 10))}
              className={selectClass + ' max-w-56'}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <Button
              onClick={updateStatus}
              disabled={updating}
              className="bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {updating ? 'Güncelleniyor...' : 'Güncelle'}
            </Button>
            {updateSuccess && <span className="text-sm text-green-600">Güncellendi.</span>}
            {updateError && <span className="text-sm text-destructive">{updateError}</span>}
          </div>
        </section>

        {/* Items */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold">Ürünler ({order.items.length})</h2>
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
                  <p className="text-sm font-medium">{item.productName}</p>
                  {item.productBrand && <p className="text-xs text-muted-foreground">{item.productBrand}</p>}
                  <p className="text-xs text-muted-foreground">{item.quantity} × {formatPrice(item.unitPrice, 'TRY')}</p>
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

        {/* Customer & Shipping */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <section className="rounded-xl border p-4 space-y-2">
            <h2 className="font-semibold text-sm">Müşteri Bilgileri</h2>
            <div className="text-sm space-y-0.5">
              <p className="font-medium">{order.customerName}</p>
              <p className="text-muted-foreground">{order.customerEmail}</p>
            </div>
          </section>

          <section className="rounded-xl border p-4 space-y-2">
            <h2 className="font-semibold text-sm">Teslimat Adresi</h2>
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>{order.shippingAddress}</p>
              <p>{order.shippingDistrict}, {order.shippingCity}{order.shippingPostalCode ? ` ${order.shippingPostalCode}` : ''}</p>
              {order.shippingNotes && <p className="italic">{order.shippingNotes}</p>}
            </div>
          </section>

          <section className="rounded-xl border p-4 space-y-2">
            <h2 className="font-semibold text-sm">Ödeme</h2>
            <div className="text-sm text-muted-foreground">
              <p>{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</p>
              <p>{order.isPaid ? '✓ Ödendi' : 'Henüz ödenmedi'}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
