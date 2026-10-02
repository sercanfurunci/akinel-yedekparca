'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Package } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
}


export function CategoryStrip({ categories }: Props) {
  const roots = categories.filter(c => !c.parentCategoryId);
  if (roots.length === 0) return null;

  return (
    <section className="border-b bg-[#F3F4F6]">
      <div className="container mx-auto px-4 max-w-7xl py-8 md:py-12">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {roots.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className={`flex flex-col items-center gap-3 rounded-xl border border-border bg-white hover:border-brand hover:-translate-y-0.5 hover:shadow-md transition-all text-center group overflow-hidden${i >= 4 ? ' hidden sm:flex' : ''}`}
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-square overflow-hidden bg-muted">
                {cat.imageUrl ? (
                  <Image
                    src={getImageUrl(cat.imageUrl) ?? ''}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
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
        {roots.length > 4 && (
          <div className="mt-4 sm:hidden">
            <Link
              href="/products"
              className="flex items-center justify-center w-full gap-2 rounded-xl border-2 border-brand text-brand font-semibold text-sm py-3 hover:bg-brand hover:text-white transition-colors"
            >
              Tüm Kategorileri Gör <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
