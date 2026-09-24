'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { api } from '@/lib/api';
import type { Brand } from '@/lib/types';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.brands.list()
      .then((data) => setBrands(data as Brand[]))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Markalar' }]} />

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Markalar</h1>
        {!loading && (
          <p className="text-sm text-muted-foreground mt-1">{brands.length} marka bulundu</p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl border bg-muted animate-pulse" />
          ))}
        </div>
      ) : brands.length === 0 ? (
        <EmptyState
          icon={<Tag size={48} />}
          title="Marka bulunamadı"
          description="Henüz aktif marka bulunmuyor."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/products?brandId=${brand.id}`}
              className="flex items-center justify-center px-4 py-5 rounded-xl border bg-card hover:border-brand hover:bg-brand-muted/20 hover:text-brand transition-all text-sm font-semibold text-center"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
