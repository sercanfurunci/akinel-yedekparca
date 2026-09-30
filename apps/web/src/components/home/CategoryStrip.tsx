'use client';
import Link from 'next/link';
import { ChevronRight, Package } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
}

function idealCols(n: number): number {
  const max = Math.min(n, 6);
  for (let c = max; c >= 2; c--) {
    if (n % c === 0) return c;
  }
  return max;
}

const colClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
};

export function CategoryStrip({ categories }: Props) {
  const roots = categories.filter(c => !c.parentCategoryId);
  if (roots.length === 0) return null;

  const cols = idealCols(roots.length);
  const gridClass = colClass[cols] ?? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';

  return (
    <section className="border-b bg-[#F3F4F6]">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="w-10 h-1 bg-brand rounded-full mb-3" />
            <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Yedek Parça Kategorileri</h2>
          </div>
          <Link
            href="/products"
            className="text-sm text-brand hover:text-brand/80 font-semibold flex items-center gap-1 transition-colors py-3 px-1 min-h-[44px]"
          >
            Tümü <ChevronRight size={14} />
          </Link>
        </div>
        <div className={`grid ${gridClass} gap-4`}>
          {roots.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-white hover:border-brand hover:-translate-y-0.5 hover:shadow-md transition-all text-center group overflow-hidden"
            >
              <div className="w-full aspect-square overflow-hidden bg-muted">
                {cat.imageUrl ? (
                  <img
                    src={getImageUrl(cat.imageUrl) ?? ''}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F3F4F6] to-muted">
                    <Package size={36} className="text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <span className="text-xs font-semibold leading-snug text-[#111827] px-2 pb-3">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
