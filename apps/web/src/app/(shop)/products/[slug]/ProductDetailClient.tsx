'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { Package, Car, Minus, Plus, Bell } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, VehicleCompatibilityEntry, ProductListItem } from '@/lib/types';
import { formatPrice, stockStatusLabel, stockStatusColor, getImageUrl } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { useVehicleStore } from '@/store/vehicleStore';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { ProductGrid } from '@/components/products/ProductGrid';

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: 'info', label: 'Ürün Bilgileri' },
  { id: 'oem', label: 'OEM Numaraları' },
  { id: 'compat', label: 'Uyumlu Araçlar' },
  { id: 'stock', label: 'Stok Bilgisi' },
];

export default function ProductDetailClient({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [compatData, setCompatData] = useState<VehicleCompatibilityEntry[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { selectedVehicle } = useVehicleStore();
  const [relatedProducts, setRelatedProducts] = useState<ProductListItem[]>([]);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [notifyError, setNotifyError] = useState('');

  useEffect(() => {
    let cancelled = false;

    api.products.get(slug)
      .then((data) => {
        if (cancelled) return;
        const p = data as Product;
        setProduct(p);

        // Load compat data separately — don't let its failure hide the product
        const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';
        fetch(`${base}/api/products/${p.id}/compatibility`)
          .then(res => res.ok ? res.json() : [])
          .then((d: VehicleCompatibilityEntry[]) => { if (!cancelled) setCompatData(d); })
          .catch(() => {});

        // Load related products
        const engineId = useVehicleStore.getState().selectedVehicle?.engineId;
        api.products.related(p.slug, engineId)
          .then((data) => { if (!cancelled) setRelatedProducts(data as ProductListItem[]); })
          .catch(() => {});
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

  const handleNotifyStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(notifyEmail)) {
      setNotifyError('Geçerli bir e-posta adresi girin.');
      return;
    }
    setNotifyStatus('sending');
    setNotifyError('');
    try {
      await api.products.notifyStock(product.id, notifyEmail);
      setNotifyStatus('success');
    } catch (err) {
      setNotifyStatus('error');
      setNotifyError(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  };

  if (loading) return <LoadingPage />;

  if (notFound || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Package size={48} className="mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Ürün bulunamadı</h1>
        <p className="text-muted-foreground">Bu ürün mevcut değil veya kaldırılmış olabilir.</p>
      </div>
    );
  }

  const stockLabel = stockStatusLabel(product.stockStatus);
  const stockColor = stockStatusColor(product.stockStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'Ürünler', href: '/products' },
          { label: product.name },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
            {getImageUrl(activeImage ?? product.primaryImageUrl) ? (
              <Image
                src={getImageUrl(activeImage ?? product.primaryImageUrl)!}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-8"
              />
            ) : (
              <Package size={80} strokeWidth={1} className="text-muted-foreground/30" />
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img) => {
                const url = getImageUrl(img.url);
                const isActive = (activeImage ?? product.primaryImageUrl) === img.url;
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImage(img.url)}
                    className={`relative shrink-0 w-16 h-16 rounded-lg border-2 overflow-hidden transition-all ${isActive ? 'border-brand' : 'border-border hover:border-brand/50'}`}
                  >
                    {url ? (
                      <Image src={url} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Package size={20} className="text-muted-foreground/40" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4">
          {/* Brand */}
          <span className="inline-block bg-brand-muted text-brand text-xs font-medium px-2.5 py-1 rounded-full">
            {product.brandName}
          </span>

          {/* Name */}
          <h1 className="text-2xl font-bold leading-snug">{product.name}</h1>

          {/* Category */}
          <p className="text-sm text-muted-foreground">{product.categoryName}</p>

          {/* OEM numbers */}
          {product.oemNumbers && product.oemNumbers.length > 0 && (
            <div className="overflow-x-auto -mx-1 px-1">
              <div className="flex flex-nowrap gap-2">
                {product.oemNumbers.map((oem, i) => (
                  <span
                    key={i}
                    className="font-mono text-xs bg-muted border border-border rounded px-2 py-1 whitespace-nowrap shrink-0"
                  >
                    {oem}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Part number */}
          {product.partNumber && (
            <p className="text-xs text-muted-foreground">
              Parça No: <span className="font-mono">{product.partNumber}</span>
            </p>
          )}

          {/* Price */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-brand">
              {formatPrice(product.salePrice ?? product.price, product.currency)}
            </span>
            {product.salePrice != null && (
              <span className="text-lg text-muted-foreground line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            )}
            {product.discountPercentage != null && product.discountPercentage > 0 && (
              <span className="bg-brand text-white text-sm font-bold px-2.5 py-1 rounded-md">
                %{Math.round(product.discountPercentage)} İNDİRİM
              </span>
            )}
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${stockColor}`}>
              {stockLabel}
            </span>
          </div>

          {/* Stock quantity */}
          {product.availableQuantity > 0 && (
            <p className="text-sm text-muted-foreground">
              {product.availableQuantity} adet mevcut
            </p>
          )}

          {/* Quantity + Add to Cart */}
          {(product.stockStatus === 'InStock' || product.stockStatus === 'LowStock' || (product.stockStatus as unknown as number) === 2 || (product.stockStatus as unknown as number) === 1) && (
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-lg border" role="group" aria-label="Adet seçici">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="flex h-10 w-10 items-center justify-center hover:bg-muted active:scale-95 transition-all rounded-l-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Adedi azalt"
                  title="Azalt"
                >
                  <Minus size={14} aria-hidden="true" />
                </button>
                <span
                  className="w-10 text-center font-medium text-sm"
                  aria-label={`Adet: ${quantity}`}
                  aria-live="polite"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.min(product.availableQuantity || 99, q + 1))}
                  className="flex h-10 w-10 items-center justify-center hover:bg-muted active:scale-95 transition-all rounded-r-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Adedi artır"
                  title="Artır"
                  disabled={quantity >= (product.availableQuantity || 99)}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1">
                <AddToCartButton productId={product.id} quantity={quantity} size="lg" />
              </div>
            </div>
          )}

          {/* Stock notification — only when out of stock */}
          {(product.stockStatus === 'OutOfStock' || (product.stockStatus as unknown as number) === 0) && (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bell size={16} className="text-muted-foreground shrink-0" />
                <p className="text-sm font-medium">Stok Gelince Haber Ver</p>
              </div>
              {notifyStatus === 'success' ? (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  Harika! Ürün stoğa girdiğinde e-posta ile bildirileceksiniz.
                </p>
              ) : (
                <form onSubmit={handleNotifyStock} className="flex gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    aria-label="E-posta adresiniz"
                    required
                    className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={notifyStatus === 'sending'}
                    className="shrink-0 h-9 px-4 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    {notifyStatus === 'sending' ? '...' : 'Bildir'}
                  </button>
                </form>
              )}
              {notifyStatus === 'error' && notifyError && (
                <p className="text-xs text-red-600 mt-2">{notifyError}</p>
              )}
              {notifyStatus !== 'error' && notifyError && (
                <p className="text-xs text-red-600 mt-2">{notifyError}</p>
              )}
            </div>
          )}

          {/* Vehicle context */}
          {selectedVehicle && (
            <div className="rounded-lg border bg-brand-muted/40 p-4 flex items-start gap-3">
              <Car size={18} className="text-brand mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Seçili Aracınız</p>
                <p className="text-sm font-semibold">{selectedVehicle.displayLabel}</p>
                {compatData.length > 0 && (
                  compatData.some(c => c.engineId === selectedVehicle.engineId)
                    ? <p className="text-xs text-green-600 font-medium mt-1">Bu ürün aracınızla uyumludur.</p>
                    : <p className="text-xs text-muted-foreground mt-1">Bu ürünün aracınızla uyumlu olup olmadığı doğrulanamadı.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        {/* Tab nav — horizontal scroll on mobile, no text shrink */}
        <div className="border-b mb-6 overflow-x-auto -mx-4 px-4">
          <div className="flex gap-0 min-w-max" role="tablist" aria-label="Ürün detayları sekmeleri">
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
                    active
                      ? 'border-brand text-brand'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content — min-h prevents footer jump when switching tabs */}
        <div className="min-h-[220px]">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground leading-relaxed">
                {product.description ? (
                  <p className="whitespace-pre-line">{product.description}</p>
                ) : (
                  <p>Bu ürün için açıklama bulunmamaktadır.</p>
                )}
              </div>
              {(() => {
                const specs = [
                  product.barcode ? { label: 'Barkod / EAN', value: product.barcode } : null,
                  product.weightKg ? { label: 'Ağırlık', value: `${product.weightKg} kg` } : null,
                  (product.widthCm || product.lengthCm || product.heightCm) ? {
                    label: 'Boyutlar',
                    value: [product.widthCm, product.lengthCm, product.heightCm]
                      .filter(Boolean).join(' × ') + ' cm'
                  } : null,
                  product.warrantyInfo ? { label: 'Garanti', value: product.warrantyInfo } : null,
                ].filter((s): s is { label: string; value: string } => s !== null);

                if (specs.length === 0) return null;

                return (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Teknik Özellikler</h3>
                    <table className="text-sm w-full">
                      <tbody>
                        {specs.map(spec => (
                          <tr key={spec.label} className="border-b last:border-0">
                            <td className="py-2 pr-4 font-medium text-gray-600 w-1/3 whitespace-nowrap">{spec.label}</td>
                            <td className="py-2">{spec.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'oem' && (
            <div>
              {product.oemNumbers && product.oemNumbers.length > 0 ? (
                <div className="overflow-x-auto pb-2 -mx-1 px-1">
                  <div className="flex flex-nowrap gap-2">
                    {product.oemNumbers.map((oem, i) => (
                      <span
                        key={i}
                        className="font-mono text-sm bg-muted border border-border rounded px-3 py-1.5 whitespace-nowrap shrink-0"
                      >
                        {oem}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">OEM numarası bilgisi mevcut değil.</p>
              )}
            </div>
          )}

          {activeTab === 'compat' && (
            compatData.length === 0 ? (
              <p className="text-muted-foreground text-sm">Bu ürün için araç uyumluluğu bilgisi mevcut değil.</p>
            ) : (
              <div className="overflow-x-auto">
                <ul className="space-y-2 min-w-0">
                  {compatData.map(c => (
                    <li key={c.engineId} className="flex items-start gap-2 text-sm">
                      <Car size={14} className="text-brand shrink-0 mt-0.5" />
                      <span className="break-words">{c.displayLabel}</span>
                      {c.notes && <span className="text-xs text-muted-foreground ml-1 shrink-0">({c.notes})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {activeTab === 'stock' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${stockColor}`}>
                  {stockLabel}
                </span>
                {product.availableQuantity > 0 && (
                  <span className="text-sm text-muted-foreground">{product.availableQuantity} adet stokta</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Benzer Ürünler</h2>
          <ProductGrid products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
