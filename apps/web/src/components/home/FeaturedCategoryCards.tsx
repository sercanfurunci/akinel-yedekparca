'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
}

export function FeaturedCategoryCards({ categories }: Props) {
  const featured = categories
    .filter((c) => c.isHomepageFeatured && !c.parentCategoryId)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  if (featured.length === 0) return null;

  return (
    <section className="bg-white border-b border-border">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="mb-6">
          <div className="w-10 h-1 bg-brand rounded-full mb-3" />
          <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Kategoriler</h2>
          <p className="text-sm text-muted-foreground mt-1">İhtiyacınıza göre kategori seçin</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {featured.map((cat) => (
            <Link
              key={cat.id}
              href={`/yedek-parcalar/${cat.slug}`}
              className="group flex flex-col items-center rounded-xl border border-border bg-[#F9FAFB] hover:border-brand/40 hover:bg-white hover:shadow-md transition-all overflow-hidden"
            >
              {/* Image area */}
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                {cat.imageUrl ? (
                  <Image
                    src={getImageUrl(cat.imageUrl)!}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand/10 to-brand/5">
                    <Tag size={32} className="text-brand/40" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="w-full px-3 py-3 text-center">
                <span className="text-sm font-semibold text-[#111827] group-hover:text-brand transition-colors leading-tight block">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
