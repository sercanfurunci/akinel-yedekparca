'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Package, Car, X } from 'lucide-react';
import { api } from '@/lib/api';
import type { ProductListItem, PaginatedResult, VehicleSearchResult } from '@/lib/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';
import { useVehicleStore } from '@/store/vehicleStore';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') ?? '';
  const { selectedVehicle } = useVehicleStore();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [vehicleSuggestions, setVehicleSuggestions] = useState<VehicleSearchResult | null>(null);
  const [useVehicleFilter, setUseVehicleFilter] = useState(false);

  // OEM numbers always contain at least one digit (e.g. 1J0698151B, 34116778138)
  // Pure-letter words like "Toyota" or "Golf" are NOT OEM queries
  const isOemQuery = query.length >= 5 &&
    /^[A-Za-z0-9\-]+$/.test(query) &&
    !/\s/.test(query) &&
    /\d/.test(query);

  // Search for vehicle suggestions when query looks like a vehicle name
  const searchVehicles = useCallback(async (q: string) => {
    if (!q || q.length < 2 || isOemQuery) { setVehicleSuggestions(null); return; }
    try {
      const result = await api.vehicles.search(q) as VehicleSearchResult;
      const hasResults = result.makes.length > 0 || result.models.length > 0 || result.engines.length > 0;
      setVehicleSuggestions(hasResults ? result : null);
    } catch { setVehicleSuggestions(null); }
  }, [isOemQuery]);

  useEffect(() => {
    const t = setTimeout(() => searchVehicles(query), 300);
    return () => clearTimeout(t);
  }, [query, searchVehicles]);

  useEffect(() => {
    if (!query) { setProducts([]); setTotalCount(0); return; }
    setLoading(true);
    const params: Record<string, string> = { query, pageSize: '40' };
    if (isOemQuery) params.queryType = '1';
    if (useVehicleFilter && selectedVehicle) params.vehicleEngineId = selectedVehicle.engineId;
    api.products.search(params)
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setProducts(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
      })
      .catch(() => { setProducts([]); setTotalCount(0); })
      .finally(() => setLoading(false));
  }, [query, isOemQuery, useVehicleFilter, selectedVehicle]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Arama' }]} />

      <div className="max-w-xl mb-6">
        <GlobalSearch defaultValue={query} size="lg" autoFocus />
      </div>

      {/* Vehicle filter chip */}
      {selectedVehicle && query && !isOemQuery && (
        <div className="mb-5">
          <button
            onClick={() => setUseVehicleFilter(v => !v)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              useVehicleFilter
                ? 'bg-brand text-brand-foreground border-brand'
                : 'bg-muted text-muted-foreground border-border hover:border-brand hover:text-brand'
            }`}
          >
            <Car size={14} />
            {selectedVehicle.displayLabel}
            {useVehicleFilter && <X size={12} />}
          </button>
          {!useVehicleFilter && (
            <p className="text-xs text-muted-foreground mt-1.5 ml-1">
              Sonuçları bu araç için filtrele
            </p>
          )}
        </div>
      )}

      {/* Vehicle suggestions */}
      {vehicleSuggestions && !isOemQuery && query && (
        <div className="mb-6 rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Car size={14} /> Araç Sonuçları — uyumlu ürünleri görmek için bir araç seçin
          </p>
          <div className="flex flex-wrap gap-2">
            {vehicleSuggestions.makes.map(m => (
              <button
                key={m.id}
                onClick={() => router.push(`/vehicle?makeId=${m.id}`)}
                className="text-sm px-3 py-1.5 rounded-full bg-background border hover:border-brand hover:text-brand transition-colors"
              >
                🏷️ {m.name}
              </button>
            ))}
            {vehicleSuggestions.models.map(m => (
              <button
                key={m.id}
                onClick={() => router.push(`/vehicle?makeId=${m.makeId}&modelId=${m.id}`)}
                className="text-sm px-3 py-1.5 rounded-full bg-background border hover:border-brand hover:text-brand transition-colors"
              >
                🚗 {m.makeName} {m.name}
              </button>
            ))}
            {vehicleSuggestions.engines.map(e => (
              <button
                key={e.id}
                onClick={() => router.push(`/products?vehicleEngineId=${e.id}`)}
                className="text-sm px-3 py-1.5 rounded-full bg-background border hover:border-brand hover:text-brand transition-colors"
              >
                🔧 {e.path}
              </button>
            ))}
          </div>
        </div>
      )}

      {query ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {isOemQuery ? 'OEM Numarası Araması' : 'Arama Sonuçları'}
            </h1>
            {!loading && (
              <p className="text-sm text-muted-foreground mt-1">
                &quot;{query}&quot; için {totalCount} ürün bulundu
                {useVehicleFilter && selectedVehicle && ` (${selectedVehicle.displayLabel} için)`}
              </p>
            )}
          </div>

          {!loading && products.length === 0 ? (
            <EmptyState
              icon={<Package size={48} />}
              title={`"${query}" için sonuç bulunamadı`}
              description={isOemQuery
                ? 'Bu OEM numarasına sahip ürün bulunamadı.'
                : 'Farklı bir arama terimi veya OEM numarası deneyin.'}
            />
          ) : (
            <ProductGrid products={products} loading={loading} />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ürün adı, OEM numarası veya araç modeli girin.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Yükleniyor...</div>}>
      <SearchResults />
    </Suspense>
  );
}
