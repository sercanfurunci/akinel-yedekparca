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
      <section className="bg-brand text-brand-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-brand-foreground/60 text-xs font-semibold uppercase tracking-widest mb-3">
              Akinel Otomotiv Yedek Parça
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              Aracınız için doğru parçayı bulun
            </h1>
            <p className="text-brand-foreground/75 mb-7 text-base md:text-lg">
              OEM numarası, parça adı veya aracınızı seçerek hızlıca arayın.
            </p>
            <div className="bg-white/10 backdrop-blur rounded-xl p-2 mb-5">
              <GlobalSearch size="lg" className="[&_input]:bg-white [&_input]:text-foreground [&_input]:placeholder:text-muted-foreground" />
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              <Link
                href="/vehicle"
                className={cn(buttonVariants({ variant: 'secondary' }), 'bg-white/20 text-white hover:bg-white/30 border-white/30')}
              >
                <Car size={15} className="mr-2" /> Aracımı Seç
              </Link>
              <Link
                href="/search"
                className={cn(buttonVariants({ variant: 'secondary' }), 'bg-white/20 text-white hover:bg-white/30 border-white/30')}
              >
                <Search size={15} className="mr-2" /> OEM ile Ara
              </Link>
              <span
                className={cn(buttonVariants({ variant: 'secondary' }), 'bg-white/10 text-white/40 border-white/15 cursor-not-allowed opacity-50')}
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
      <section className="border-b bg-muted/20">
        <div className="container mx-auto px-4 max-w-7xl py-10">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Akinel Otomotiv Yedek Parça</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xl">
                Otomobil ve ticari araçlar için geniş yedek parça seçenekleri.
                OEM numarasıyla arama, araç bazlı uyumlu parça bulma ve anlık stok bilgisi.
                AKN MOTORS Car Service güvencesiyle.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 shrink-0">
              {trustItems.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check size={14} className="text-brand shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. POPULAR BRANDS ───────────────────────── */}
      {brands.length > 0 && (
        <section className="border-b">
          <div className="container mx-auto px-4 max-w-7xl py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Popüler Markalar</h2>
              <Link
                href="/products"
                className="text-sm text-brand hover:text-brand/80 flex items-center gap-1 transition-colors"
              >
                Tümü <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/products?brandId=${brand.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border bg-card hover:border-brand hover:bg-brand-muted/30 hover:text-brand transition-all text-sm font-semibold text-foreground"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. VEHICLE FINDER ───────────────────────── */}
      <section className="container mx-auto px-4 max-w-7xl py-10">
        <div className="bg-card border rounded-xl p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold">Aracınıza Göre Parça Bulun</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Aracınızı seçin, uyumlu parçaları görüntüleyin.
            </p>
          </div>
          {selectedVehicle ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-brand-muted px-4 py-3">
                <Car size={18} className="text-brand shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Seçili Araç</p>
                  <p className="font-semibold text-sm">{selectedVehicle.displayLabel}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/products?vehicleEngineId=${selectedVehicle.engineId}`}
                  className={cn(buttonVariants({ variant: 'default' }), 'bg-brand text-brand-foreground hover:bg-brand/90')}
                >
                  Parçaları Gör
                </Link>
                <Link href="/vehicle" className={buttonVariants({ variant: 'outline' })}>
                  Aracı Değiştir
                </Link>
              </div>
            </div>
          ) : (
            <VehicleFinder showSaveButton />
          )}
        </div>
      </section>

      {/* ── 6. CATEGORIES ───────────────────────────── */}
      {categories.length > 0 && (
        <section className="border-t bg-muted/20">
          <div className="container mx-auto px-4 max-w-7xl py-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Yedek Parça Kategorileri</h2>
              <Link
                href="/products"
                className="text-sm text-brand hover:text-brand/80 flex items-center gap-1 transition-colors"
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
                    className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-xl border bg-card hover:border-brand hover:bg-brand-muted/20 transition-all text-center group"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-semibold leading-snug">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. FEATURED PRODUCTS ────────────────────── */}
      <section className="container mx-auto px-4 max-w-7xl py-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-lg font-bold">Öne Çıkan Ürünler</h2>
          <Link href="/products" className={cn(buttonVariants({ variant: 'outline' }), 'text-sm h-8 px-3')}>
            Tümünü Gör
          </Link>
        </div>
        <ProductGrid products={products} loading={loadingProducts} skeletonCount={6} />
      </section>
    </div>
  );
}
