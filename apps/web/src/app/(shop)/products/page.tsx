'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Package, X, ChevronDown, Car } from 'lucide-react';
import { api } from '@/lib/api';
import type { ProductListItem, PaginatedResult, Brand, Category } from '@/lib/types';
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
import { useVehicleStore } from '@/store/vehicleStore';
import Link from 'next/link';

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
    case 'newest': return {};
    default: return {};
  }
}

/** Shared filter panel — used in both sidebar and mobile drawer */
function FilterPanel({
  brands,
  categories,
  filterBrandId,
  setFilterBrandId,
  filterCategoryId,
  setFilterCategoryId,
  filterInStock,
  setFilterInStock,
  filterMinPrice,
  setFilterMinPrice,
  filterMaxPrice,
  setFilterMaxPrice,
  filterSort,
  setFilterSort,
}: {
  brands: Brand[];
  categories: Category[];
  filterBrandId: string;
  setFilterBrandId: (v: string) => void;
  filterCategoryId: string;
  setFilterCategoryId: (v: string) => void;
  filterInStock: boolean;
  setFilterInStock: (v: boolean) => void;
  filterMinPrice: string;
  setFilterMinPrice: (v: string) => void;
  filterMaxPrice: string;
  setFilterMaxPrice: (v: string) => void;
  filterSort: string;
  setFilterSort: (v: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Brand */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Marka</p>
        <select
          value={filterBrandId}
          onChange={(e) => setFilterBrandId(e.target.value)}
          className={selectClass}
        >
          <option value="">Tüm Markalar</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Kategori</p>
        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className={selectClass}
        >
          <option value="">Tüm Kategoriler</option>
          {categories
            .filter((c) => !c.parentCategoryId)
            .map((parent) => {
              const children = categories.filter((c) => c.parentCategoryId === parent.id);
              if (children.length === 0) {
                return <option key={parent.id} value={parent.id}>{parent.name}</option>;
              }
              return (
                <optgroup key={parent.id} label={parent.name}>
                  <option value={parent.id}>{parent.name} (Tümü)</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>&nbsp;&nbsp;{child.name}</option>
                  ))}
                </optgroup>
              );
            })}
        </select>
      </div>

      {/* In stock */}
      <div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={filterInStock}
            onChange={(e) => setFilterInStock(e.target.checked)}
            className="rounded border-input"
          />
          Sadece stokta olanlar
        </label>
      </div>

      {/* Price range */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Fiyat Aralığı (₺)</p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filterMinPrice}
            onChange={(e) => setFilterMinPrice(e.target.value)}
            className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <input
            type="number"
            placeholder="Maks"
            value={filterMaxPrice}
            onChange={(e) => setFilterMaxPrice(e.target.value)}
            className="flex h-8 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Sıralama</p>
        <select
          value={filterSort}
          onChange={(e) => setFilterSort(e.target.value)}
          className={selectClass}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedVehicle } = useVehicleStore();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const page = parseInt(searchParams.get('page') ?? '1');
  const vehicleEngineId = searchParams.get('vehicleEngineId') ?? '';
  const searchQuery = searchParams.get('search') ?? '';

  // Initialize filter state from URL
  const [filterInStock, setFilterInStock] = useState(searchParams.get('inStock') === 'true');
  const [filterSort, setFilterSort] = useState(searchParams.get('sort') ?? '');
  const [filterMinPrice, setFilterMinPrice] = useState(searchParams.get('minPrice') ?? '');
  const [filterMaxPrice, setFilterMaxPrice] = useState(searchParams.get('maxPrice') ?? '');
  const [filterBrandId, setFilterBrandId] = useState(searchParams.get('brandId') ?? '');
  const [filterCategoryId, setFilterCategoryId] = useState(searchParams.get('categoryId') ?? '');

  // Drawer-local state (applied only when "Filtrele" pressed)
  const [drawerBrandId, setDrawerBrandId] = useState(filterBrandId);
  const [drawerCategoryId, setDrawerCategoryId] = useState(filterCategoryId);
  const [drawerInStock, setDrawerInStock] = useState(filterInStock);
  const [drawerMinPrice, setDrawerMinPrice] = useState(filterMinPrice);
  const [drawerMaxPrice, setDrawerMaxPrice] = useState(filterMaxPrice);
  const [drawerSort, setDrawerSort] = useState(filterSort);

  const openDrawer = () => {
    // Sync drawer state from current filters
    setDrawerBrandId(filterBrandId);
    setDrawerCategoryId(filterCategoryId);
    setDrawerInStock(filterInStock);
    setDrawerMinPrice(filterMinPrice);
    setDrawerMaxPrice(filterMaxPrice);
    setDrawerSort(filterSort);
    setDrawerOpen(true);
  };

  const applyDrawerFilters = () => {
    setFilterBrandId(drawerBrandId);
    setFilterCategoryId(drawerCategoryId);
    setFilterInStock(drawerInStock);
    setFilterMinPrice(drawerMinPrice);
    setFilterMaxPrice(drawerMaxPrice);
    setFilterSort(drawerSort);

    const params = new URLSearchParams();
    if (drawerInStock) params.set('inStock', 'true');
    if (drawerSort) params.set('sort', drawerSort);
    if (drawerMinPrice) params.set('minPrice', drawerMinPrice);
    if (drawerMaxPrice) params.set('maxPrice', drawerMaxPrice);
    if (vehicleEngineId) params.set('vehicleEngineId', vehicleEngineId);
    if (drawerBrandId) params.set('brandId', drawerBrandId);
    if (drawerCategoryId) params.set('categoryId', drawerCategoryId);
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
    setDrawerOpen(false);
  };

  // Load brands and categories
  useEffect(() => {
    api.brands.list().then((data) => setBrands(data as Brand[])).catch(() => {});
    api.categories.list().then((data) => setCategories(data as Category[])).catch(() => {});
  }, []);

  const buildApiParams = useCallback((): Record<string, string> => {
    const p: Record<string, string> = {
      page: String(page),
      pageSize: '20',
      inStockOnly: filterInStock ? 'true' : 'false',
    };
    Object.assign(p, sortToParams(filterSort));
    if (filterMinPrice) p.minPrice = filterMinPrice;
    if (filterMaxPrice) p.maxPrice = filterMaxPrice;
    if (vehicleEngineId) p.vehicleEngineId = vehicleEngineId;
    if (searchQuery) p.query = searchQuery;
    const urlBrandId = searchParams.get('brandId') ?? '';
    const urlCategoryId = searchParams.get('categoryId') ?? '';
    if (urlBrandId) p.brandId = urlBrandId;
    if (urlCategoryId) p.categoryId = urlCategoryId;
    return p;
  }, [page, filterInStock, filterSort, filterMinPrice, filterMaxPrice, vehicleEngineId, searchQuery, searchParams]);

  useEffect(() => {
    setLoading(true);
    api.products.list(buildApiParams())
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setProducts(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
        setTotalPages(result.totalPages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [buildApiParams]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filterInStock) params.set('inStock', 'true');
    if (filterSort) params.set('sort', filterSort);
    if (filterMinPrice) params.set('minPrice', filterMinPrice);
    if (filterMaxPrice) params.set('maxPrice', filterMaxPrice);
    if (vehicleEngineId) params.set('vehicleEngineId', vehicleEngineId);
    if (filterBrandId) params.set('brandId', filterBrandId);
    if (filterCategoryId) params.set('categoryId', filterCategoryId);
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilterInStock(false);
    setFilterSort('');
    setFilterMinPrice('');
    setFilterMaxPrice('');
    setFilterBrandId('');
    setFilterCategoryId('');
    if (vehicleEngineId) {
      router.push(`/products?vehicleEngineId=${vehicleEngineId}`);
    } else {
      router.push('/products');
    }
  };

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
    // also update local state
    if (key === 'brandId') setFilterBrandId('');
    if (key === 'categoryId') setFilterCategoryId('');
    if (key === 'inStock') setFilterInStock(false);
    if (key === 'sort') setFilterSort('');
    if (key === 'minPrice') setFilterMinPrice('');
    if (key === 'maxPrice') setFilterMaxPrice('');
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/products?${params.toString()}`);
  };

  const activeBrandName = brands.find((b) => b.id === (searchParams.get('brandId') || filterBrandId))?.name;
  const activeCategoryName = categories.find((c) => c.id === (searchParams.get('categoryId') || filterCategoryId))?.name;
  const activeSortLabel = sortOptions.find((o) => o.value === (searchParams.get('sort') || filterSort))?.label;

  const hasActiveFilters = !!(
    searchParams.get('brandId') || searchParams.get('categoryId') ||
    searchParams.get('inStock') || searchParams.get('sort') ||
    searchParams.get('minPrice') || searchParams.get('maxPrice') ||
    vehicleEngineId || searchQuery
  );

  // Active chips data
  const activeChips: Array<{ label: string; removeKey: string }> = [];
  if (activeBrandName) activeChips.push({ label: `Marka: ${activeBrandName}`, removeKey: 'brandId' });
  if (activeCategoryName) activeChips.push({ label: `Kategori: ${activeCategoryName}`, removeKey: 'categoryId' });
  if (searchParams.get('inStock') === 'true') activeChips.push({ label: 'Stokta Var', removeKey: 'inStock' });
  if (activeSortLabel && searchParams.get('sort')) activeChips.push({ label: `Sıralama: ${activeSortLabel}`, removeKey: 'sort' });
  if (searchParams.get('minPrice')) activeChips.push({ label: `Min: ₺${searchParams.get('minPrice')}`, removeKey: 'minPrice' });
  if (searchParams.get('maxPrice')) activeChips.push({ label: `Maks: ₺${searchParams.get('maxPrice')}`, removeKey: 'maxPrice' });
  if (searchQuery) activeChips.push({ label: `Arama: "${searchQuery}"`, removeKey: 'search' });

  const pageTitle = activeCategoryName ?? activeBrandName ?? (searchQuery ? `"${searchQuery}" Sonuçları` : 'Tüm Ürünler');

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
              <Button
                variant="outline"
                size="sm"
                onClick={openDrawer}
                className="flex items-center gap-1.5 h-8"
              >
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
                  if (e.target.value) params.set('sort', e.target.value);
                  else params.delete('sort');
                  params.set('page', '1');
                  router.push(`/products?${params.toString()}`);
                }}
                className="h-8 rounded-lg border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-xs overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtreler</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-2 flex-1 overflow-y-auto">
            <FilterPanel
              brands={brands}
              categories={categories}
              filterBrandId={drawerBrandId}
              setFilterBrandId={setDrawerBrandId}
              filterCategoryId={drawerCategoryId}
              setFilterCategoryId={setDrawerCategoryId}
              filterInStock={drawerInStock}
              setFilterInStock={setDrawerInStock}
              filterMinPrice={drawerMinPrice}
              setFilterMinPrice={setDrawerMinPrice}
              filterMaxPrice={drawerMaxPrice}
              setFilterMaxPrice={setDrawerMaxPrice}
              filterSort={drawerSort}
              setFilterSort={setDrawerSort}
            />
          </div>
          <SheetFooter className="flex flex-col gap-2 px-4 pb-4">
            <Button
              onClick={applyDrawerFilters}
              className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
            >
              Filtrele Uygula
            </Button>
            <button
              onClick={() => {
                setDrawerBrandId('');
                setDrawerCategoryId('');
                setDrawerInStock(false);
                setDrawerMinPrice('');
                setDrawerMaxPrice('');
                setDrawerSort('');
              }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              Temizle
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Ürünler' }]} />

        {/* Vehicle context banner */}
        {(vehicleEngineId && selectedVehicle) && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-brand/30 bg-brand-muted/50 px-4 py-2.5">
            <Car size={16} className="text-brand shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Seçili Araç</p>
              <p className="text-sm font-semibold truncate">{selectedVehicle.displayLabel}</p>
            </div>
            <Link
              href="/vehicle"
              className="text-xs text-brand hover:underline underline-offset-2 shrink-0"
            >
              Değiştir
            </Link>
          </div>
        )}

        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{pageTitle}</h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">{totalCount} ürün bulundu</p>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="hidden lg:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
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
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/30 bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Tümünü Temizle
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop sidebar filters */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="bg-card border rounded-xl p-5 space-y-5 sticky top-24">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <SlidersHorizontal size={16} />
                Filtreler
              </div>

              <FilterPanel
                brands={brands}
                categories={categories}
                filterBrandId={filterBrandId}
                setFilterBrandId={setFilterBrandId}
                filterCategoryId={filterCategoryId}
                setFilterCategoryId={setFilterCategoryId}
                filterInStock={filterInStock}
                setFilterInStock={setFilterInStock}
                filterMinPrice={filterMinPrice}
                setFilterMinPrice={setFilterMinPrice}
                filterMaxPrice={filterMaxPrice}
                setFilterMaxPrice={setFilterMaxPrice}
                filterSort={filterSort}
                setFilterSort={setFilterSort}
              />

              <Button
                onClick={applyFilters}
                className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Filtrele
              </Button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  Filtreleri Temizle
                </button>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop result count + sort bar */}
            <div className="hidden lg:flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {loading ? 'Yükleniyor...' : `${totalCount} ürün`}
              </p>
              <div className="flex items-center gap-2">
                <ChevronDown size={14} className="text-muted-foreground" />
                <select
                  value={filterSort}
                  onChange={(e) => {
                    setFilterSort(e.target.value);
                    const params = new URLSearchParams(searchParams.toString());
                    if (e.target.value) params.set('sort', e.target.value);
                    else params.delete('sort');
                    params.set('page', '1');
                    router.push(`/products?${params.toString()}`);
                  }}
                  className="h-8 rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {!loading && products.length === 0 ? (
              <EmptyState
                icon={<Package size={48} />}
                title="Ürün bulunamadı"
                description="Seçili filtrelere uygun ürün mevcut değil. Filtreleri değiştirmeyi deneyin."
              />
            ) : (
              <>
                <ProductGrid products={products} loading={loading} skeletonCount={20} />

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-8 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => goToPage(page - 1)}
                    >
                      Önceki
                    </Button>

                    {/* Page number buttons — show at most 7 */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - page) <= 2) return true;
                        return false;
                      })
                      .reduce<Array<number | '...'>>((acc, p, idx, arr) => {
                        if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                          acc.push('...');
                        }
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((item, idx) =>
                        item === '...' ? (
                          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">…</span>
                        ) : (
                          <Button
                            key={item}
                            variant={page === item ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => goToPage(item as number)}
                            className={page === item ? 'bg-brand text-brand-foreground hover:bg-brand/90' : ''}
                          >
                            {item}
                          </Button>
                        )
                      )}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => goToPage(page + 1)}
                    >
                      Sonraki
                    </Button>
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Yükleniyor...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
