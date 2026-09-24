'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  Disc, Cog, Filter, Zap, GitMerge,
  Lightbulb, Thermometer, AirVent, Layers, Gauge, Package,
  Search, Car, Check, ChevronRight,
} from 'lucide-react';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { VehicleFinder } from '@/components/search/VehicleFinder';
import { ProductGrid } from '@/components/products/ProductGrid';
import { BusinessStrip } from '@/components/home/BusinessStrip';
import { useVehicleStore } from '@/store/vehicleStore';
import { api } from '@/lib/api';
import type { ProductListItem, PaginatedResult, Brand, Category } from '@/lib/types';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Icon mapping for categories — UI concern, not stored in DB.
// Covers both Turkish slugs (admin-created) and English slugs (seeded defaults).
const categoryIconMap: Record<string, LucideIcon> = {
  'brakes': Disc, 'fren-sistemi': Disc,
  'clutch': GitMerge, 'debriyaj': GitMerge,
  'filters': Filter, 'filtreler': Filter,
  'suspension': Layers, 'suspansiyon': Layers,
  'electrical': Zap, 'elektrik': Zap,
  'cooling': Thermometer, 'sogutma': Thermometer,
  'motor': Cog, 'engine': Cog,
  'steering': Gauge, 'direksiyon': Gauge,
  'air-conditioning': AirVent, 'klima': AirVent,
  'lighting': Lightbulb, 'aydinlatma': Lightbulb,
};

const trustItems = [
  'OEM uyumlu ürünler',
  'Geniş marka ve model desteği',
  'Araç bazlı parça bulma',
  'Gerçek zamanlı stok takibi',
];

export default function HomePage() {
  const { selectedVehicle } = useVehicleStore();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    api.products
      .list({ inStockOnly: 'true', page: '1', pageSize: '8' })
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setProducts(result.items ?? []);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));

    api.brands.list()
      .then((data) => setBrands(data as Brand[]))
      .catch(() => {});

    api.categories.list()
      .then((data) => setCategories(data as Category[]))
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* ── 1. HERO ─────────────────────────────────── */}
      <section className="relative bg-[#111827] text-white py-16 md:py-24 overflow-hidden">
        {/* Subtle red gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="container mx-auto px-4 max-w-7xl relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-0.5 w-8 bg-brand rounded-full" />
              <p className="text-brand text-xs font-bold uppercase tracking-widest">
                AKINEL OTO YEDEK PARÇA
              </p>
              <span className="h-0.5 w-8 bg-brand rounded-full" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight tracking-tight">
              Aracınız için{' '}
              <span className="text-brand">doğru parçayı</span>{' '}
              bulun
            </h1>
            <p className="text-white/70 mb-8 text-base md:text-lg max-w-2xl mx-auto">
              OEM numarası, parça adı veya aracınızı seçerek hızlıca arayın.
              AKN MOTORS Car Service güvencesi.
            </p>
            <div className="bg-white rounded-xl p-2 mb-6 shadow-2xl shadow-brand/10 ring-1 ring-white/10">
              <GlobalSearch size="lg" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/vehicle"
                className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'h-11 px-5')}
              >
                <Car size={16} className="mr-2" /> Aracımı Seç
              </Link>
              <Link
                href="/search"
                className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'h-11 px-5')}
              >
                <Search size={16} className="mr-2" /> OEM ile Ara
              </Link>
              <span
                className="inline-flex items-center h-11 px-5 rounded-lg bg-white/5 text-white/40 border border-white/10 text-sm font-medium cursor-not-allowed"
                title="Yakında"
              >
                VIN ile Ara (Yakında)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. BUSINESS STRIP ───────────────────────── */}
      <BusinessStrip />

      {/* ── 3. AKINEL INTRODUCTION ──────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl py-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-12 h-1 bg-brand rounded-full mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#111827]">
                AKINEL OTO YEDEK PARÇA
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Otomobil ve ticari araçlar için geniş yedek parça seçenekleri.
                OEM numarasıyla arama, araç bazlı uyumlu parça bulma ve anlık stok bilgisi.
                <span className="font-semibold text-[#111827]"> AKN MOTORS Car Service</span> güvencesiyle.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trustItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-[#F3F4F6]/40 px-4 py-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand">
                    <Check size={14} className="text-white" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-medium text-[#111827]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. POPULAR BRANDS ───────────────────────── */}
      {brands.length > 0 && (
        <section className="border-b bg-[#F3F4F6]">
          <div className="container mx-auto px-4 max-w-7xl py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="w-10 h-1 bg-brand rounded-full mb-3" />
                <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Popüler Markalar</h2>
              </div>
              <Link
                href="/products"
                className="text-sm text-brand hover:text-brand/80 font-semibold flex items-center gap-1 transition-colors"
              >
                Tümü <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brandId=${brand.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-white hover:border-brand hover:text-brand hover:shadow-sm transition-all text-sm font-semibold text-[#111827]"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. VEHICLE FINDER ───────────────────────── */}
      <section className="bg-white">
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <div className="w-10 h-1 bg-brand rounded-full mb-3" />
              <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Aracınıza Göre Parça Bulun</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Aracınızı seçin, uyumlu parçaları anında görüntüleyin.
              </p>
            </div>
            {selectedVehicle ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-brand-muted border border-brand/20 px-4 py-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                    <Car size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-brand font-semibold uppercase tracking-wide">Seçili Araç</p>
                    <p className="font-bold text-sm text-[#111827]">{selectedVehicle.displayLabel}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/products?vehicleEngineId=${selectedVehicle.engineId}`}
                    className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'h-11 px-5')}
                  >
                    Parçaları Gör
                  </Link>
                  <Link href="/vehicle" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-5')}>
                    Aracı Değiştir
                  </Link>
                </div>
              </div>
            ) : (
              <VehicleFinder showSaveButton />
            )}
          </div>
        </div>
      </section>

      {/* ── 6. CATEGORIES ───────────────────────────── */}
      {categories.length > 0 && (
        <section className="border-t bg-[#F3F4F6]">
          <div className="container mx-auto px-4 max-w-7xl py-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="w-10 h-1 bg-brand rounded-full mb-3" />
                <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Yedek Parça Kategorileri</h2>
              </div>
              <Link
                href="/products"
                className="text-sm text-brand hover:text-brand/80 font-semibold flex items-center gap-1 transition-colors"
              >
                Tümü <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {categories.filter((c) => !c.parentCategoryId).map((cat) => {
                const Icon = categoryIconMap[cat.slug] ?? Package;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="flex flex-col items-center gap-3 py-6 px-3 rounded-xl border border-border bg-white hover:border-brand hover:-translate-y-0.5 hover:shadow-md transition-all text-center group"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F4F6] text-[#111827] group-hover:bg-brand group-hover:text-white transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-semibold leading-snug text-[#111827]">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. FEATURED PRODUCTS ────────────────────── */}
      <section className="bg-white border-t border-border">
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="w-10 h-1 bg-brand rounded-full mb-3" />
              <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Öne Çıkan Ürünler</h2>
            </div>
            <Link href="/products" className={cn(buttonVariants({ variant: 'outline' }), 'text-sm h-9 px-4')}>
              Tümünü Gör
            </Link>
          </div>
          <ProductGrid products={products} loading={loadingProducts} skeletonCount={6} />
        </div>
      </section>
    </div>
  );
}
