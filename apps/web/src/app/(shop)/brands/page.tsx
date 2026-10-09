'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { Brand } from '@/lib/types';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';
import { Tag } from 'lucide-react';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.brands.list()
      .then((data) => setBrands(data as Brand[]))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter(b => b.name.toLowerCase().includes(q));
  }, [brands, search]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Markalar' }]} />

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Yedek Parça Markaları</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground mt-1">{brands.length} marka</p>
          )}
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Marka ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Tag size={48} />}
          title="Marka bulunamadı"
          description={search ? `"${search}" ile eşleşen marka yok.` : 'Henüz aktif marka bulunmuyor.'}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((brand) => {
            const logoUrl = getImageUrl(brand.logoUrl);
            return (
              <Link
                key={brand.id}
                href={`/marka/${brand.slug}`}
                className="group flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border border-border bg-white hover:border-brand hover:shadow-md transition-all"
              >
                <div className="h-12 w-full flex items-center justify-center">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={brand.name}
                      className="max-h-12 max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide text-center leading-tight">
                      {brand.name}
                    </span>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-[#111827] group-hover:text-brand transition-colors truncate max-w-full">
                    {brand.name}
                  </p>
                  {brand.productCount != null && brand.productCount > 0 && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {brand.productCount} ürün
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
