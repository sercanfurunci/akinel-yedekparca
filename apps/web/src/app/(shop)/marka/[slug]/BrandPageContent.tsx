'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Package, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import type { ProductListItem, PaginatedResult, Category } from '@/lib/types';
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

interface Props {
  brandId: string;
  brandName: string;
  slug: string;
}

function BrandContent({ brandId, brandName, slug }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const page = parseInt(searchParams.get('page') ?? '1');
  const [filterCategoryId, setFilterCategoryId] = useState(searchParams.get('categoryId') ?? '');
  const [filterInStock, setFilterInStock] = useState(searchParams.get('inStock') !== 'false');
  const [filterSort, setFilterSort] = useState(searchParams.get('sort') ?? '');
  const [filterMinPrice, setFilterMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [filterMaxPrice, setFilterMaxPrice] = useState(searchParams.get('maxPrice') ?? '');

  const [drawerCategoryId, setDrawerCategoryId] = useState(filterCategoryId);
  const [drawerInStock, setDrawerInStock] = useState(filterInStock);
  const [drawerSort, setDrawerSort] = useState(filterSort);
  const [drawerMinPrice, setDrawerMinPrice] = useState(filterMinPrice);
  const [drawerMaxPrice, setDrawerMaxPrice] = useState(filterMaxPrice);

  useEffect(() => {
    api.categories.list().then((data) => setCategories(data as Category[])).catch(() => {});
  }, []);

  const buildParams = useCallback((): Record<string, string> => {
    const p: Record<string, string> = {
      page: String(page),
      pageSize: '20',
      brandId,
      inStockOnly: filterInStock ? 'true' : 'false',
    };
    Object.assign(p, sortToParams(filterSort));
    const urlCategoryId = searchParams.get('categoryId') || filterCategoryId;
    if (urlCategoryId) p.categoryId = urlCategoryId;
    if (filterMinPrice) p.minPrice = filterMinPrice;
    if (filterMaxPrice) p.maxPrice = filterMaxPrice;
    return p;
  }, [page, brandId, filterInStock, filterSort, filterCategoryId, filterMinPrice, filterMaxPrice, searchParams]);

  useEffect(() => {
    setLoading(true);
    api.products.list(buildParams())
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setProducts(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(result.totalPages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [buildParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filterCategoryId) params.set('categoryId', filterCategoryId);
    if (filterInStock) params.set('inStock', 'true');
    if (filterSort) params.set('sort', filterSort);
    if (filterMinPrice) params.set('minPrice', filterMinPrice);
    if (filterMaxPrice) params.set('maxPrice', filterMaxPrice);
    params.set('page', '1');
    router.push(`/marka/${slug}?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilterCategoryId('');
    setFilterInStock(false);
    setFilterSort('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    router.push(`/marka/${slug}`);
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set('page', '1');
    router.push(`/marka/${slug}?${params.toString()}`);
    if (key === 'categoryId') setFilterCategoryId('');
    if (key === 'inStock') setFilterInStock(false);
    if (key === 'sort') setFilterSort('');
    if (key === 'minPrice') setFilterMinPrice('');
    if (key === 'maxPrice') setFilterMaxPrice('');
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/marka/${slug}?${params.toString()}`);
  };

  const openDrawer = () => {
    setDrawerCategoryId(filterCategoryId);
    setDrawerInStock(filterInStock);
    setDrawerSort(filterSort);
    setDrawerMinPrice(filterMinPrice);
    setDrawerMaxPrice(filterMaxPrice);
    setDrawerOpen(true);
  };

  const applyDrawerFilters = () => {
    setFilterCategoryId(drawerCategoryId);
    setFilterInStock(drawerInStock);
    setFilterSort(drawerSort);
    setFilterMinPrice(drawerMinPrice);
    setFilterMaxPrice(drawerMaxPrice);
    const params = new URLSearchParams();
    if (drawerCategoryId) params.set('categoryId', drawerCategoryId);
    if (drawerInStock) params.set('inStock', 'true');
    if (drawerSort) params.set('sort', drawerSort);
    if (drawerMinPrice) params.set('minPrice', drawerMinPrice);
    if (drawerMaxPrice) params.set('maxPrice', drawerMaxPrice);
    params.set('page', '1');
    router.push(`/marka/${slug}?${params.toString()}`);
    setDrawerOpen(false);
  };

  const activeCategoryName = categories.find((c) => c.id === (searchParams.get('categoryId') || filterCategoryId))?.name;
  const activeSortLabel = sortOptions.find((o) => o.value === (searchParams.get('sort') || filterSort))?.label;
  const hasActiveFilters = !!(searchParams.get('categoryId') || searchParams.get('inStock') || searchParams.get('sort') || searchParams.get('minPrice') || searchParams.get('maxPrice'));

  const activeChips: Array<{ label: string; removeKey: string }> = [];
  if (activeCategoryName) activeChips.push({ label: `Kategori: ${activeCategoryName}`, removeKey: 'categoryId' });
  if (searchParams.get('inStock') === 'true') activeChips.push({ label: 'Stokta Var', removeKey: 'inStock' });
  if (activeSortLabel && searchParams.get('sort')) activeChips.push({ label: `Sıralama: ${activeSortLabel}`, removeKey: 'sort' });
  if (searchParams.get('minPrice')) activeChips.push({ label: `Min: ₺${searchParams.get('minPrice')}`, removeKey: 'minPrice' });
  if (searchParams.get('maxPrice')) activeChips.push({ label: `Maks: ₺${searchParams.get('maxPrice')}`, removeKey: 'maxPrice' });

  const FilterPanelContent = () => (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Kategori</p>
        <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)} className={selectClass}>
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                  router.push(`/marka/${slug}?${params.toString()}`);
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
                <p className="text-xs font-medium text-muted-foreground mb-2">Kategori</p>
                <select value={drawerCategoryId} onChange={(e) => setDrawerCategoryId(e.target.value)} className={selectClass}>
                  <option value="">Tüm Kategoriler</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
            <button onClick={() => { setDrawerCategoryId(''); setDrawerInStock(false); setDrawerSort(''); setDrawerMinPrice(''); setDrawerMaxPrice(''); }} className="w-full text-sm text-muted-foreground hover:text-foreground py-1">Temizle</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs
          items={[
            { label: 'Ana Sayfa', href: '/' },
            { label: 'Markalar', href: '/brands' },
            { label: brandName },
          ]}
        />

        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{brandName}</h1>
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
            <div className="hidden lg:flex items-center justify-end mb-4 gap-2">
              <ChevronDown size={14} className="text-muted-foreground" />
              <select
                value={filterSort}
                onChange={(e) => {
                  setFilterSort(e.target.value);
                  const params = new URLSearchParams(searchParams.toString());
                  if (e.target.value) params.set('sort', e.target.value); else params.delete('sort');
                  params.set('page', '1');
                  router.push(`/marka/${slug}?${params.toString()}`);
                }}
                className="h-8 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {sortOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {!loading && products.length === 0 ? (
              <EmptyState
                icon={<Package size={48} />}
                title="Bu markada ürün bulunamadı"
                description="Farklı bir marka deneyebilirsiniz."
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
      </div>
    </>
  );
}

export default function BrandPageContent(props: Props) {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Yükleniyor...</div>}>
      <BrandContent {...props} />
    </Suspense>
  );
}
