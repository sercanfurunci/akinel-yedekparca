'use client';
import Link from 'next/link';
import type { Category } from '@/lib/types';

interface Props {
  categories: Category[];
}

export function CategoryStrip({ categories }: Props) {
  const withImages = categories.filter(c => !c.parentCategoryId);
  if (withImages.length === 0) return null;

  return (
    <section className="border-b bg-background">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide snap-x snap-mandatory">
          {withImages.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?categoryId=${cat.id}`}
              className="flex flex-col items-center gap-2 shrink-0 snap-start group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-muted border border-border group-hover:border-brand transition-colors">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center text-2xl">
                    🔧
                  </div>
                )}
              </div>
              <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-brand transition-colors max-w-[80px] leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
