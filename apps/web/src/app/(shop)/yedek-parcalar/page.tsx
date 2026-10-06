'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Tag, LayoutGrid } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { Category } from '@/lib/types';

interface CategoryWithChildren extends Category {
  children: Category[];
}

export default function YedekParcalarPage() {
  const [groups, setGroups] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories.list()
      .then((raw) => {
        const all = raw as Category[];
        const parents = all
          .filter((c) => !c.parentCategoryId && c.isActive !== false)
          .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99));
        const grouped = parents.map((p) => {
          const directChildren = all.filter((c) => c.parentCategoryId === p.id);
          // If direct children are group-headers (have their own children), flatten grandchildren
          const grandchildren = directChildren.flatMap((child) =>
            all.filter((c) => c.parentCategoryId === child.id)
          );
          const displayChildren = grandchildren.length > 0 ? grandchildren : directChildren;
          return { ...p, children: displayChildren };
        });
        setGroups(grouped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Page header */}
      <div className="bg-white border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <nav className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Link href="/" className="hover:text-brand transition-colors">Ana Sayfa</Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium">Yedek Parçalar</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#111827]">Yedek Parçalar</h1>
              <p className="text-sm text-muted-foreground mt-0.5">İhtiyacınıza göre kategori seçin</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand/90 transition-colors"
            >
              <LayoutGrid size={15} />
              Tümünü Gör
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-5 animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <div key={j} className="bg-gray-100 rounded-xl h-20" />
                  ))}
                </div>
                <div className="h-4 w-48 bg-gray-100 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {groups.map((group) => (
              <div key={group.id} className="bg-white rounded-2xl border border-border overflow-hidden flex flex-col">
                {/* Card header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <div className="flex items-center gap-2.5">
                    {group.imageUrl ? (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={getImageUrl(group.imageUrl)!}
                          alt={group.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <Tag size={14} className="text-brand" />
                      </div>
                    )}
                    <h2 className="text-[15px] font-bold text-brand">{group.name}</h2>
                  </div>
                </div>

                {/* Subcategory grid — 3 columns, max 2 rows = 6 items shown */}
                <div className="px-5 pb-4 flex-1">
                  {group.children.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2.5">
                      {group.children.slice(0, 6).map((child) => (
                        <Link
                          key={child.id}
                          href={`/yedek-parcalar/${child.slug}`}
                          className="group flex flex-col items-center gap-1.5 rounded-xl border border-border bg-[#FAFAFA] hover:border-brand/40 hover:bg-brand/5 hover:shadow-sm transition-all p-2.5 text-center"
                        >
                          {child.imageUrl ? (
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-border/40">
                              <Image
                                src={getImageUrl(child.imageUrl)!}
                                alt={child.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-white border border-border/40 flex items-center justify-center">
                              <Tag size={18} className="text-gray-300 group-hover:text-brand/40 transition-colors" />
                            </div>
                          )}
                          <span className="text-[11px] font-medium text-[#374151] group-hover:text-brand transition-colors leading-tight line-clamp-2">
                            {child.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Footer link */}
                <div className="border-t border-border px-5 py-3">
                  <Link
                    href={`/yedek-parcalar/${group.slug}`}
                    className="text-xs text-muted-foreground hover:text-brand transition-colors flex items-center gap-1"
                  >
                    Tüm <span className="font-semibold text-brand mx-0.5">{group.name}</span> Ürünlerini İncele
                    <ChevronRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
