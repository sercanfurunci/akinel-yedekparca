'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';

// ── Type definitions ──────────────────────────────────────────────────────────

interface OrderStatusCount {
  status: string;
  count: number;
}

interface TopProduct {
  productId: string;
  productName: string;
  brandName: string | null;
  totalQuantity: number;
  orderCount: number;
}

interface RecentOrder {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface DbMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  ordersInPeriod: number;
  revenueInPeriod: number;
  averageOrderValue: number;
  ordersByStatus: OrderStatusCount[];
  topProducts: TopProduct[];
  recentOrders: RecentOrder[];
}

interface FunnelStep {
  name: string;
  event: string;
  count: number;
}

interface SearchType {
  type: string;
  count: number;
}

interface PostHogMetrics {
  available: boolean;
  uniqueVisitors: number | null;
  productViews: number | null;
  addToCart: number | null;
  checkoutStarted: number | null;
  purchases: number | null;
  funnel: FunnelStep[] | null;
  searchTypeBreakdown: SearchType[] | null;
  vinSearchSuccess: number | null;
  vinSearchFailed: number | null;
}

interface AnalyticsResponse {
  period: string;
  db: DbMetrics;
  postHog: PostHogMetrics;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; className: string }> = {
  Pending: { label: 'Bekliyor', className: 'bg-yellow-100 text-yellow-800' },
  Confirmed: { label: 'Onaylandı', className: 'bg-blue-100 text-blue-800' },
  Preparing: { label: 'Hazırlanıyor', className: 'bg-orange-100 text-orange-800' },
  Shipped: { label: 'Kargoya Verildi', className: 'bg-purple-100 text-purple-800' },
  Delivered: { label: 'Teslim Edildi', className: 'bg-green-100 text-green-800' },
  Cancelled: { label: 'İptal', className: 'bg-red-100 text-red-800' },
};

const searchTypeLabels: Record<string, string> = {
  text: 'Metin',
  oem: 'OEM No',
  vehicle: 'Araç',
};

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('tr-TR').format(n);
}

function pct(n: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((n / total) * 100);
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  loading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 flex flex-col gap-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
      ) : (
        <p className="text-2xl font-bold tracking-tight">{value}</p>
      )}
      {sub && !loading && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function FunnelChart({ steps }: { steps: FunnelStep[] }) {
  const max = Math.max(...steps.map((s) => s.count), 1);
  return (
    <div className="space-y-2">
      {steps.map((step) => {
        const width = pct(step.count, max);
        return (
          <div key={step.event} className="flex items-center gap-3 text-sm">
            <span className="w-36 shrink-0 text-xs text-muted-foreground truncate">{step.name}</span>
            <div className="flex-1 bg-muted rounded-full h-5 relative overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-500"
                style={{ width: `${width}%` }}
              />
            </div>
            <span className="w-16 text-right font-medium tabular-nums text-xs">{fmt(step.count)}</span>
          </div>
        );
      })}
    </div>
  );
}

function BarChart({ items, label }: { items: Array<{ label: string; count: number }>; label: string }) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">{label}</p>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 text-xs text-muted-foreground truncate">{item.label}</span>
          <div className="flex-1 bg-muted rounded-full h-4 relative overflow-hidden">
            <div
              className="h-full bg-brand/70 rounded-full transition-all duration-500"
              style={{ width: `${pct(item.count, max)}%` }}
            />
          </div>
          <span className="w-12 text-right font-medium tabular-nums text-xs">{fmt(item.count)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Period selector ───────────────────────────────────────────────────────────

const PERIODS = [
  { value: 'today', label: 'Bugün' },
  { value: '7d', label: 'Son 7 Gün' },
  { value: '30d', label: 'Son 30 Gün' },
] as const;

type Period = (typeof PERIODS)[number]['value'];

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { accessToken } = useAuthStore();
  const [period, setPeriod] = useState<Period>('7d');
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    (api.admin.analytics.get(period, accessToken) as Promise<AnalyticsResponse>)
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Bir hata oluştu.'))
      .finally(() => setLoading(false));
  }, [accessToken, period]);

  const db = data?.db;
  const ph = data?.postHog;

  const funnelConversionRate =
    ph?.funnel && ph.funnel.length >= 2
      ? pct(ph.funnel[ph.funnel.length - 1]?.count ?? 0, ph.funnel[0]?.count ?? 1)
      : null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Analitik</h1>
        <div className="flex gap-1 bg-muted/60 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                period === p.value
                  ? 'bg-white shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Row 1 — DB KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <KpiCard
          label="Dönem Siparişi"
          value={fmt(db?.ordersInPeriod)}
          sub={`Toplam: ${fmt(db?.totalOrders)}`}
          loading={loading}
        />
        <KpiCard
          label="Dönem Cirosu"
          value={db ? formatPrice(db.revenueInPeriod, 'TRY') : '—'}
          sub={db ? `Ort. ${formatPrice(db.averageOrderValue, 'TRY')}` : undefined}
          loading={loading}
        />
        <KpiCard
          label="Yeni Kullanıcı"
          value={fmt(db?.newUsers)}
          sub={`Toplam: ${fmt(db?.totalUsers)}`}
          loading={loading}
        />
        <KpiCard
          label="Aktif Ürün"
          value={fmt(db?.activeProducts)}
          sub={`Toplam: ${fmt(db?.totalProducts)}`}
          loading={loading}
        />
      </div>

      {/* Row 2 — PostHog KPIs */}
      {ph?.available === false ? (
        <div className="mb-4 rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground">
          PostHog entegrasyonu aktif değil. <code className="font-mono text-xs">PostHog__PersonalApiKey</code> ortam değişkenini ayarlayın.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Ziyaretçi"
            value={fmt(ph?.uniqueVisitors)}
            loading={loading}
          />
          <KpiCard
            label="Ürün Görüntülenmesi"
            value={fmt(ph?.productViews)}
            loading={loading}
          />
          <KpiCard
            label="Sepete Ekleme"
            value={fmt(ph?.addToCart)}
            loading={loading}
          />
          <KpiCard
            label="Satın Alma"
            value={fmt(ph?.purchases)}
            sub={funnelConversionRate !== null ? `Dönüşüm: %${funnelConversionRate}` : undefined}
            loading={loading}
          />
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Kullanıcı Akışı</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-5 bg-muted animate-pulse rounded-full" />
              ))}
            </div>
          ) : ph?.funnel ? (
            <FunnelChart steps={ph.funnel} />
          ) : (
            <p className="text-sm text-muted-foreground">PostHog verisi mevcut değil.</p>
          )}
        </div>

        {/* VIN + Search type column */}
        <div className="flex flex-col gap-4">
          {/* VIN results */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">VIN Sonuçları</h2>
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-4 bg-muted animate-pulse rounded" />
              </div>
            ) : ph?.available ? (
              <div className="space-y-2">
                {[
                  { label: 'Bulundu', count: ph.vinSearchSuccess, color: 'bg-green-400' },
                  { label: 'Bulunamadı', count: ph.vinSearchFailed, color: 'bg-red-400' },
                ].map(({ label, count, color }) => {
                  const total = (ph.vinSearchSuccess ?? 0) + (ph.vinSearchFailed ?? 0);
                  const w = total > 0 ? pct(count ?? 0, total) : 0;
                  return (
                    <div key={label} className="flex items-center gap-3 text-sm">
                      <span className="w-24 shrink-0 text-xs text-muted-foreground">{label}</span>
                      <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${w}%` }} />
                      </div>
                      <span className="w-12 text-right text-xs font-medium tabular-nums">{fmt(count)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">PostHog verisi yok.</p>
            )}
          </div>

          {/* Search types */}
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold mb-4">Arama Türleri</h2>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-muted animate-pulse rounded" />)}
              </div>
            ) : ph?.searchTypeBreakdown && ph.searchTypeBreakdown.length > 0 ? (
              <BarChart
                label=""
                items={ph.searchTypeBreakdown.map((s) => ({
                  label: searchTypeLabels[s.type] ?? s.type,
                  count: s.count,
                }))}
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                {ph?.available ? 'Veri yok.' : 'PostHog verisi yok.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top products */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">En Çok Satan Ürünler</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}
            </div>
          ) : db?.topProducts.length ? (
            <div className="space-y-2">
              {db.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground text-xs w-4 shrink-0 mt-0.5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-xs leading-tight">{p.productName}</p>
                    {p.brandName && <p className="text-xs text-muted-foreground">{p.brandName}</p>}
                  </div>
                  <span className="text-xs font-semibold text-brand shrink-0">{p.totalQuantity} adet</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sipariş verisi yok.</p>
          )}
        </div>

        {/* Order statuses */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Sipariş Durumları</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}
            </div>
          ) : db?.ordersByStatus.length ? (
            <div className="space-y-2">
              {db.ordersByStatus.map(({ status, count }) => {
                const cfg = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
                const total = db.ordersByStatus.reduce((a, b) => a + b.count, 0);
                return (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.className}`}>
                      {cfg.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-brand/60 rounded-full"
                          style={{ width: `${pct(count, total)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium tabular-nums w-6 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sipariş verisi yok.</p>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold mb-4">Son Siparişler</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-8 bg-muted animate-pulse rounded" />)}
            </div>
          ) : db?.recentOrders.length ? (
            <div className="space-y-3">
              {db.recentOrders.map((o) => {
                const cfg = statusConfig[o.status] ?? { label: o.status, className: 'bg-gray-100 text-gray-600' };
                return (
                  <div key={o.orderNumber} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-medium truncate">{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{o.customerName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-brand">{formatPrice(o.totalAmount, 'TRY')}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sipariş verisi yok.</p>
          )}
        </div>
      </div>
    </div>
  );
}
