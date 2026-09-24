'use client';

import { useState, useEffect, use } from 'react';
import { Package, Car, Minus, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import type { Product, VehicleCompatibilityEntry } from '@/lib/types';
import { formatPrice, stockStatusLabel, stockStatusColor, getImageUrl } from '@/lib/utils';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { useVehicleStore } from '@/store/vehicleStore';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

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

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [compatData, setCompatData] = useState<VehicleCompatibilityEntry[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { selectedVehicle } = useVehicleStore();

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
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [slug]);

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
        {/* Image */}
        <div className="aspect-square bg-muted rounded-xl overflow-hidden flex items-center justify-center">
          {getImageUrl(product.primaryImageUrl) ? (
            <img
              src={getImageUrl(product.primaryImageUrl)!}
              alt={product.name}
              className="w-full h-full object-contain p-8"
            />
          ) : (
            <Package size={80} strokeWidth={1} className="text-muted-foreground/30" />
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
            <div className="flex flex-wrap gap-2">
              {product.oemNumbers.map((oem, i) => (
                <span
                  key={i}
                  className="font-mono text-xs bg-muted border border-border rounded px-2 py-1"
                >
                  {oem}
                </span>
              ))}
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
              <span className="bg-red-500 text-white text-sm font-bold px-2 py-0.5 rounded">
                %{Math.round(product.discountPercentage)} indirim
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
              <div className="flex items-center rounded-lg border">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="flex h-10 w-10 items-center justify-center hover:bg-muted transition-colors rounded-l-lg"
                  aria-label="Azalt"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-medium text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.availableQuantity || 99, q + 1))}
                  className="flex h-10 w-10 items-center justify-center hover:bg-muted transition-colors rounded-r-lg"
                  aria-label="Artır"
                  disabled={quantity >= (product.availableQuantity || 99)}
                >
                  <Plus size={14} />
                </button>
              </div>
              <div className="flex-1">
                <AddToCartButton productId={product.id} quantity={quantity} size="lg" />
              </div>
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
        <div className="border-b mb-6 overflow-x-auto">
          <div className="flex gap-0 min-w-max sm:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px shrink-0 ${
                  activeTab === tab.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
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
                <ul className="space-y-2">
                  {product.oemNumbers.map((oem, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-muted border border-border rounded px-3 py-1.5 break-all">
                        {oem}
                      </span>
                    </li>
                  ))}
                </ul>
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
    </div>
  );
}
