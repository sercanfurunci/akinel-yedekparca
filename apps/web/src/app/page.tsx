'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Car, Check, ChevronRight,
} from 'lucide-react';
import { VehicleFinder } from '@/components/search/VehicleFinder';
import { ProductGrid } from '@/components/products/ProductGrid';
import { BusinessStrip } from '@/components/home/BusinessStrip';
import { HeroCarousel, StaticHero } from '@/components/home/HeroCarousel';
import { PopularVehicleMakes } from '@/components/home/PopularVehicleMakes';
import { OilBrandsSection } from '@/components/home/OilBrandsSection';
import { FeaturedCategoryCards } from '@/components/home/FeaturedCategoryCards';
import { BrandLogoStrip } from '@/components/layout/BrandLogoStrip';
import { useVehicleStore } from '@/store/vehicleStore';
import { api } from '@/lib/api';
import type { ProductListItem, PaginatedResult, Brand, Category, HeroSlide } from '@/lib/types';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';


const trustItems = [
  'OEM uyumlu ürünler',
  'Geniş marka ve model desteği',
  'Araç bazlı parça bulma',
  'Gerçek zamanlı stok takibi',
];

export default function HomePage() {
  const { selectedVehicle } = useVehicleStore();
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[] | null>(null);

  useEffect(() => {
    setMounted(true);
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

    api.hero.slides()
      .then((data) => setHeroSlides(data as HeroSlide[]))
      .catch(() => setHeroSlides([]));
  }, []);

  return (
    <div>
      {/* ── 1. HERO ─────────────────────────────────── */}
      {heroSlides === null ? (
        <div className="relative bg-[#111827] text-white overflow-hidden" style={{ minHeight: 'clamp(480px, 60vw, 640px)' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent" />
        </div>
      ) : heroSlides.length > 0 ? (
        <HeroCarousel slides={heroSlides} />
      ) : (
        <StaticHero />
      )}

      {/* ── 2. BRAND LOGO STRIP (araç markaları) ────── */}
      <BrandLogoStrip />

      {/* ── 3. VEHICLE FINDER ───────────────────────── */}
      <section className="bg-[#F3F4F6] border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl py-10">
          <div className="bg-white border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="mb-6">
              <div className="w-10 h-1 bg-brand rounded-full mb-3" />
              <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Aracınıza Göre Parça Bulun</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Aracınızı seçin, uyumlu parçaları anında görüntüleyin.
              </p>
            </div>
            {mounted && selectedVehicle ? (
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
              <>
                <VehicleFinder showSaveButton />
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-5')}
                  >
                    Tüm Ürünlere Gözat
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. BUSINESS STRIP ───────────────────────── */}
      <BusinessStrip />

      {/* ── 5. FEATURED CATEGORIES ──────────────────── */}
      <FeaturedCategoryCards categories={categories} />

      {/* ── 6. POPULAR VEHICLE MAKES ─────────────────── */}
      <PopularVehicleMakes />

      {/* ── 7. PART BRANDS ──────────────────────────── */}
      <OilBrandsSection brands={brands} />

      {/* ── 8. FEATURED PRODUCTS ────────────────────── */}
      <section className="bg-white border-t border-border">
        <div className="container mx-auto px-4 max-w-7xl py-12">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="w-10 h-1 bg-brand rounded-full mb-3" />
              <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Öne Çıkan Ürünler</h2>
            </div>
            <Link href="/products" className={cn(buttonVariants({ variant: 'outline' }), 'text-sm h-11 px-4')}>
              Tümünü Gör
            </Link>
          </div>
          <ProductGrid products={products} loading={loadingProducts} skeletonCount={6} />
        </div>
      </section>

      {/* ── 9. ABOUT / TRUST ────────────────────────── */}
      <section className="bg-[#F3F4F6] border-t border-border">
        <div className="container mx-auto px-4 max-w-7xl py-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="w-12 h-1 bg-brand rounded-full mb-4" />
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#111827]">
                Aracınız için doğru yedek parçayı bulun
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Otomobil ve ticari araçlar için geniş yedek parça seçenekleri.
                OEM numarasıyla arama, araç bazlı uyumlu parça bulma ve anlık stok bilgisi.
                <span className="font-semibold text-[#111827]"> AKINEL OTO YEDEK PARÇA</span> güvencesiyle.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trustItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
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
    </div>
  );
}
