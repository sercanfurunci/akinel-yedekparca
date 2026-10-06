'use client';

import { useState, useEffect, use, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Package, SlidersHorizontal, X, ChevronDown, ChevronRight, Tag } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { ProductListItem, PaginatedResult, Category, Brand } from '@/lib/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';

const sortOptions = [
  { value: '', label: 'Varsayılan' },
  { value: 'newest', label: 'En Yeni' },
  { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
  { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
  { value: 'name-asc', label: 'İsim: A-Z' },
  { value: 'name-desc', label: 'İsim: Z-A' },
];

const selectClass =
  'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors';

function sortToParams(sort: string): Record<string, string> {
  switch (sort) {
    case 'price-asc': return { sortBy: 'price', sortDescending: 'false' };
    case 'price-desc': return { sortBy: 'price', sortDescending: 'true' };
    case 'name-asc': return { sortBy: 'name', sortDescending: 'false' };
    case 'name-desc': return { sortBy: 'name', sortDescending: 'true' };
    default: return {};
  }
}

function CategoryContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [groupedSubcategories, setGroupedSubcategories] = useState<{ group: Category; items: Category[] }[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const page = parseInt(searchParams.get('page') ?? '1');
  const [filterBrandId, setFilterBrandId] = useState(searchParams.get('brandId') ?? '');
  const [filterInStock, setFilterInStock] = useState(searchParams.get('inStock') !== 'false');
  const [filterSort, setFilterSort] = useState(searchParams.get('sort') ?? '');
  const [filterMinPrice, setFilterMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [filterMaxPrice, setFilterMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  const [drawerBrandId, setDrawerBrandId] = useState(filterBrandId);
  const [drawerInStock, setDrawerInStock] = useState(filterInStock);
  const [drawerSort, setDrawerSort] = useState(filterSort);
  const [drawerMinPrice, setDrawerMinPrice] = useState(filterMinPrice);
  const [drawerMaxPrice, setDrawerMaxPrice] = useState(filterMaxPrice);

  useEffect(() => {
    api.brands.list().then((data) => setBrands(data as Brand[])).catch(() => {});
  }, []);

  useEffect(() => {
    api.categories.list()
      .then((cats) => {
        const all = cats as Category[];
        const found = all.find((c) => c.slug === slug) ?? null;
        setCategory(found);
        if (found) {
          const direct = all.filter((c) => c.parentCategoryId === found.id);
          setSubcategories(direct);
          // Check if any direct child has its own children → grouped layout
          const groups = direct
            .map((child) => ({ group: child, items: all.filter((c) => c.parentCategoryId === child.id) }))
            .filter((g) => g.items.length > 0);
          setGroupedSubcategories(groups);
        }
      })
      .catch(() => {});
  }, [slug]);

  const buildParams = useCallback((catId?: string): Record<string, string> => {
    const p: Record<string, string> = {
      page: String(page),
      pageSize: '20',
      inStockOnly: filterInStock ? 'true' : 'false',
    };
    if (catId) p.categoryId = catId;
    Object.assign(p, sortToParams(filterSort));
    const urlBrandId = searchParams.get('brandId') || filterBrandId;
    if (urlBrandId) p.brandId = urlBrandId;
    if (filterMinPrice) p.minPrice = filterMinPrice;
    if (filterMaxPrice) p.maxPrice = filterMaxPrice;
    return p;
  }, [page, filterInStock, filterSort, filterBrandId, filterMinPrice, filterMaxPrice, searchParams]);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    api.products.list(buildParams(category.id))
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setProducts(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(result.totalPages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, buildParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filterBrandId) params.set('brandId', filterBrandId);
    if (filterInStock) params.set('inStock', 'true');
    if (filterSort) params.set('sort', filterSort);
    if (filterMinPrice) params.set('minPrice', filterMinPrice);
    if (filterMaxPrice) params.set('maxPrice', filterMaxPrice);
    params.set('page', '1');
    router.push(`/yedek-parcalar/${slug}?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilterBrandId('');
    setFilterInStock(false);
    setFilterSort('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    router.push(`/yedek-parcalar/${slug}`);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set('page', '1');
    router.push(`/yedek-parcalar/${slug}?${params.toString()}`);
    if (key === 'brandId') setFilterBrandId('');
    if (key === 'inStock') setFilterInStock(false);
    if (key === 'sort') setFilterSort('');
    if (key === 'minPrice') setFilterMinPrice('');
    if (key === 'maxPrice') setFilterMaxPrice('');
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/yedek-parcalar/${slug}?${params.toString()}`);
  };

  const openDrawer = () => {
    setDrawerBrandId(filterBrandId);
    setDrawerInStock(filterInStock);
    setDrawerSort(filterSort);
    setDrawerMinPrice(filterMinPrice);
    setDrawerMaxPrice(filterMaxPrice);
    setDrawerOpen(true);
  };

  const applyDrawerFilters = () => {
    setFilterBrandId(drawerBrandId);
    setFilterInStock(drawerInStock);
    setFilterSort(drawerSort);
    setFilterMinPrice(drawerMinPrice);
    setFilterMaxPrice(drawerMaxPrice);
    const params = new URLSearchParams();
    if (drawerBrandId) params.set('brandId', drawerBrandId);
    if (drawerInStock) params.set('inStock', 'true');
    if (drawerSort) params.set('sort', drawerSort);
    if (drawerMinPrice) params.set('minPrice', drawerMinPrice);
    if (drawerMaxPrice) params.set('maxPrice', drawerMaxPrice);
    params.set('page', '1');
    router.push(`/yedek-parcalar/${slug}?${params.toString()}`);
    setDrawerOpen(false);
  };

  const activeBrandName = brands.find((b) => b.id === (searchParams.get('brandId') || filterBrandId))?.name;
  const activeSortLabel = sortOptions.find((o) => o.value === (searchParams.get('sort') || filterSort))?.label;
  const hasActiveFilters = !!(searchParams.get('brandId') || searchParams.get('inStock') || searchParams.get('sort') || searchParams.get('minPrice') || searchParams.get('maxPrice'));

  const activeChips: Array<{ label: string; removeKey: string }> = [];
  if (activeBrandName) activeChips.push({ label: `Marka: ${activeBrandName}`, removeKey: 'brandId' });
  if (searchParams.get('inStock') === 'true') activeChips.push({ label: 'Stokta Var', removeKey: 'inStock' });
  if (activeSortLabel && searchParams.get('sort')) activeChips.push({ label: `Sıralama: ${activeSortLabel}`, removeKey: 'sort' });
  if (searchParams.get('minPrice')) activeChips.push({ label: `Min: ₺${searchParams.get('minPrice')}`, removeKey: 'minPrice' });
  if (searchParams.get('maxPrice')) activeChips.push({ label: `Maks: ₺${searchParams.get('maxPrice')}`, removeKey: 'maxPrice' });

  const categoryName = category?.name ?? slug;

  const FilterPanelContent = () => (
    <div className="space-y-5">
      {/* Brand */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Marka</p>
        <select value={filterBrandId} onChange={(e) => setFilterBrandId(e.target.value)} className={selectClass}>
          <option value="">Tüm Markalar</option>
          {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={filterInStock} onChange={(e) => setFilterInStock(e.target.checked)} className="rounded border-input" />
          Sadece stokta olanlar
        </label>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Fiyat Aralığı (₺)</p>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)} className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
          <input type="number" placeholder="Maks" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)} className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Sıralama</p>
        <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)} className={selectClass}>
          {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sticky toolbar */}
      <div className="lg:hidden sticky top-[var(--header-height,64px)] z-30 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center gap-2 py-2">
            <span className="text-sm text-muted-foreground shrink-0">
              {loading ? '...' : `${totalCount} sonuç`}
            </span>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={openDrawer} className="flex items-center gap-1.5 h-8">
                <SlidersHorizontal size={14} />
                Filtrele
                {activeChips.length > 0 && (
                  <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-brand-foreground text-[10px] font-bold">
                    {activeChips.length}
                  </span>
                )}
              </Button>
              <select
                value={filterSort}
                onChange={(e) => {
                  setFilterSort(e.target.value);
                  const params = new URLSearchParams(searchParams.toString());
                  if (e.target.value) params.set('sort', e.target.value); else params.delete('sort');
                  params.set('page', '1');
                  router.push(`/yedek-parcalar/${slug}?${params.toString()}`);
                }}
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-xs overflow-y-auto">
          <SheetHeader><SheetTitle>Filtreler</SheetTitle></SheetHeader>
          <div className="px-4 py-2 flex-1 overflow-y-auto">
            <div className="space-y-5">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Marka</p>
                <select value={drawerBrandId} onChange={(e) => setDrawerBrandId(e.target.value)} className={selectClass}>
                  <option value="">Tüm Markalar</option>
                  {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={drawerInStock} onChange={(e) => setDrawerInStock(e.target.checked)} className="rounded border-input" />
                  Sadece stokta olanlar
                </label>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Fiyat Aralığı (₺)</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" value={drawerMinPrice} onChange={(e) => setDrawerMinPrice(e.target.value)} className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none" />
                  <input type="number" placeholder="Maks" value={drawerMaxPrice} onChange={(e) => setDrawerMaxPrice(e.target.value)} className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Sıralama</p>
                <select value={drawerSort} onChange={(e) => setDrawerSort(e.target.value)} className={selectClass}>
                  {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <SheetFooter className="flex flex-col gap-2 px-4 pb-4">
            <Button onClick={applyDrawerFilters} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">Filtrele Uygula</Button>
            <button onClick={() => { setDrawerBrandId(''); setDrawerInStock(false); setDrawerSort(''); setDrawerMinPrice(''); setDrawerMaxPrice(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground py-1">Temizle</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Yedek Parçalar', href: '/yedek-parcalar' },
            { label: categoryName },
          ]}
        />

        {/* Grouped layout: category has sub-groups (e.g. Fren ve Debriyaj → Fren + Debriyaj) */}
        {groupedSubcategories.length > 0 ? (
          <>
            <h1 className="text-2xl font-bold text-[#111827] mb-6">{categoryName}</h1>
            <div className="space-y-8">
              {groupedSubcategories.map(({ group, items }) => (
                <div key={group.id}>
                  <h2 className="text-lg font-bold text-brand mb-3">{group.name}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/yedek-parcalar/${item.slug}`}
                        className="group relative flex flex-col rounded-xl border border-border bg-white hover:border-brand/50 hover:shadow-sm transition-all p-3 min-h-[88px]"
                      >
                        <div className="flex items-center gap-2.5 flex-1">
                          <div className="shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-[#F9FAFB] border border-border/40 flex items-center justify-center">
                            {item.imageUrl ? (
                              <Image src={getImageUrl(item.imageUrl)!} alt={item.name} width={48} height={48} className="object-cover w-full h-full" />
                            ) : (
                              <Tag size={18} className="text-gray-300 group-hover:text-brand/40 transition-colors" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-[#1F2937] group-hover:text-brand transition-colors leading-snug line-clamp-2 flex-1">
                            {item.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : subcategories.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#111827]">{categoryName}</h1>
                <p className="text-sm text-muted-foreground mt-1">{subcategories.length} alt kategori</p>
              </div>
              <Link
                href={`/products?categoryId=${category?.id}`}
                className="text-sm text-brand font-semibold flex items-center gap-1 hover:text-brand/80 transition-colors"
              >
                Tüm Ürünleri Gör <ChevronRight size={14} />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
                {subcategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/yedek-parcalar/${sub.slug}`}
                    className="group relative flex items-center gap-3 rounded-xl border border-border bg-[#FAFAFA] hover:border-brand/50 hover:bg-white hover:shadow-sm transition-all p-3"
                  >
                    <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white border border-border/50 flex items-center justify-center">
                      {sub.imageUrl ? (
                        <Image src={getImageUrl(sub.imageUrl)!} alt={sub.name} width={56} height={56} className="object-cover w-full h-full" />
                      ) : (
                        <Tag size={20} className="text-gray-300 group-hover:text-brand/40 transition-colors" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-[#1F2937] group-hover:text-brand transition-colors leading-snug line-clamp-2 flex-1">
                      {sub.name}
                    </span>
                    <ChevronRight size={14} className="shrink-0 text-gray-300 group-hover:text-brand transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{categoryName}</h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">{totalCount} ürün bulundu</p>
            )}
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <X size={14} /> Tümünü Temizle
            </button>
          )}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeChips.map((chip) => (
              <button
                key={chip.removeKey}
                onClick={() => removeFilter(chip.removeKey)}
                className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand-muted/40 px-3 py-1 text-xs font-medium text-brand hover:bg-brand/10 transition-colors"
              >
                {chip.label}
                <X size={11} />
              </button>
            ))}
            {activeChips.length > 1 && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/30 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                Tümünü Temizle
              </button>
            )}
          </div>
        )}


        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="bg-card border rounded-xl p-5 space-y-5 sticky top-24">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <SlidersHorizontal size={16} />
                Filtreler
              </div>
              <FilterPanelContent />
              <Button onClick={applyFilters} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">Filtrele</Button>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1">
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop sort */}
            <div className="hidden lg:flex items-center justify-end mb-4 gap-2">
              <ChevronDown size={14} className="text-muted-foreground" />
              <select
                value={filterSort}
                onChange={(e) => {
                  setFilterSort(e.target.value);
                  const params = new URLSearchParams(searchParams.toString());
                  if (e.target.value) params.set('sort', e.target.value); else params.delete('sort');
                  params.set('page', '1');
                  router.push(`/yedek-parcalar/${slug}?${params.toString()}`);
                }}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {!loading && products.length === 0 ? (
              <EmptyState
                icon={<Package size={48} />}
                title="Bu kategoride ürün bulunamadı"
                description="Farklı bir kategori deneyebilirsiniz."
              />
            ) : (
              <>
                <ProductGrid products={products} loading={loading} />

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Önceki</Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - page) <= 2) return true;
                        return false;
                      })
                      .reduce<Array<number | '...'>>((acc, p, idx, arr) => {
                        if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">…</span>
                        ) : (
                          <Button key={item} variant={page === item ? 'default' : 'outline'} size="sm" onClick={() => goToPage(item as number)} className={page === item ? 'bg-brand text-brand-foreground hover:bg-brand/90' : ''}>
                            {item}
                          </Button>
                        )
                      )}
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>Sonraki</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
          </>
        )}

        {/* Description section — shown when category has description or banner */}
        {(category?.description || category?.bannerImageUrl) && (
          <div className="mt-10 bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex flex-col md:flex-row gap-0">
              {category.bannerImageUrl && (
                <div className="md:w-64 shrink-0">
                  <div className="relative h-48 md:h-full min-h-[192px]">
                    <Image
                      src={getImageUrl(category.bannerImageUrl)!}
                      alt={categoryName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 256px"
                    />
                  </div>
                </div>
              )}
              {category.description && (
                <div className="flex-1 p-6 md:p-8">
                  <h2 className="text-lg font-bold text-[#111827] mb-3">
                    {categoryName} | Orijinal &amp; Uygun Fiyatlı Yedek Parçalar
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: category.description }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Yükleniyor...</div>}>
      <CategoryContent slug={slug} />
    </Suspense>
  );
}
