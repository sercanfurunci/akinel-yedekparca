'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Hash, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { ProductListItem, PaginatedResult } from '@/lib/types';
import { ProductGrid } from '@/components/products/ProductGrid';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';

export default function OemNumberPage() {
  const params = useParams();
  const rawNumber = decodeURIComponent(params.number as string);
  const displayNumber = rawNumber.toUpperCase();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.products
      .search({ query: rawNumber, queryType: '1', pageSize: '40' })
      .then((data) => {
        const result = data as PaginatedResult<ProductListItem>;
        setProducts(result.items ?? []);
        setTotalCount(result.totalCount ?? 0);
      })
      .catch(() => { setProducts([]); setTotalCount(0); })
      .finally(() => setLoading(false));
  }, [rawNumber]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumbs
        items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: 'OEM Ara', href: '/oem' },
          { label: displayNumber },
        ]}
      />

      <div className="mt-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Hash size={18} className="text-brand shrink-0" />
          <h1 className="text-xl font-bold font-mono tracking-wide">{displayNumber}</h1>
        </div>
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {totalCount > 0
              ? <>{totalCount} ürün bulundu — OEM numarasıyla tam veya kısmi eşleşme</>
              : 'Bu OEM numarası için ürün bulunamadı'}
          </p>
        )}
      </div>

      {!loading && totalCount === 0 ? (
        <EmptyState
          icon={<Package size={48} />}
          title={`"${displayNumber}" için sonuç bulunamadı`}
          description="OEM numarasını kontrol edin veya ürün adıyla arama yapın."
          action={
            <Link
              href={`/search?q=${encodeURIComponent(rawNumber)}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 h-10 px-5 text-sm font-semibold transition-all"
            >
              Genel aramaya geç
            </Link>
          }
        />
      ) : (
        <ProductGrid products={products} loading={loading} skeletonCount={8} />
      )}

      {!loading && (
        <div className="mt-8">
          <Link
            href="/oem"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Başka OEM numarası ara
          </Link>
        </div>
      )}
    </div>
  );
}
