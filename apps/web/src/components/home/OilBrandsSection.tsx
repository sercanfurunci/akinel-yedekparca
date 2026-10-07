'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Brand, HomepageBanner } from '@/lib/types';
import { api } from '@/lib/api';

const TABS = [
  { id: 'motor-yagi',  label: 'Motor Yağı' },
  { id: 'ampul',       label: 'Ampul' },
  { id: 'oto-bakim',   label: 'Oto Bakım' },
  { id: 'aksesuar',    label: 'Aksesuar' },
  { id: 'aku',         label: 'Akü' },
] as const;

type TabId = (typeof TABS)[number]['id'];

// Brand slugs per tab — matched against live brands from DB
const TAB_BRANDS: Record<TabId, string[]> = {
  'motor-yagi': ['castrol', 'opet', 'motul', 'elf', 'total', 'mobil'],
  'ampul':      ['osram', 'philips', 'bosch', 'narva', 'ring', 'hella'],
  'oto-bakim':  ['turtle-wax', 'sonax', 'wurth', '3m', 'liqui-moly', 'meguiar-s'],
  'aksesuar':   ['heyner', 'carlife', 'ring', 'carpoint', 'streetwize', 'sumex'],
  'aku':        ['varta', 'banner', 'bosch', 'exide', 'tudor', 'mutlu'],
};

const TAB_BANNER: Record<TabId, { bg: string; headline: string; sub: string }> = {
  'motor-yagi': {
    bg: 'from-orange-600 to-amber-500',
    headline: 'Motor Yağları',
    sub: 'Motorunuzu koruyun, performansı artırın',
  },
  'ampul': {
    bg: 'from-yellow-500 to-yellow-300',
    headline: 'Otomotiv Ampulleri',
    sub: 'LED, Xenon ve halojen seçenekleri',
  },
  'oto-bakim': {
    bg: 'from-blue-600 to-cyan-500',
    headline: 'Oto Bakım Ürünleri',
    sub: 'Temizlik, cila ve koruma ürünleri',
  },
  'aksesuar': {
    bg: 'from-gray-700 to-gray-500',
    headline: 'Aksesuar',
    sub: 'Araç içi ve dışı aksesuarlar',
  },
  'aku': {
    bg: 'from-green-700 to-emerald-500',
    headline: 'Akü',
    sub: 'Güvenilir markaların akü çeşitleri',
  },
};

interface Props {
  brands: Brand[];
}

export function OilBrandsSection({ brands }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('motor-yagi');
  const [bannerImages, setBannerImages] = useState<Record<string, string>>({});

  useEffect(() => {
    api.home.banners()
      .then((data) => {
        const map: Record<string, string> = {};
        (data as HomepageBanner[]).forEach((b) => {
          if (b.imageUrl) map[b.sectionKey] = b.imageUrl;
        });
        setBannerImages(map);
      })
      .catch(() => {});
  }, []);

  const bySlug = Object.fromEntries(brands.map((b) => [b.slug, b]));
  const slugsForTab = TAB_BRANDS[activeTab];
  // Brands that exist in DB; fill remaining slots with name-only fallbacks
  const cards = slugsForTab.map((slug) => {
    const b = bySlug[slug];
    return b
      ? { name: b.name, slug: b.slug, logoUrl: b.logoUrl ?? null }
      : { name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), slug, logoUrl: null };
  });

  const banner = TAB_BANNER[activeTab];

  return (
    <section className="border-b border-border bg-white">
      <div className="container mx-auto px-4 max-w-7xl py-10">
        {/* Section header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="w-10 h-1 bg-brand rounded-full mb-3" />
            <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Kategoriye Göre Alışveriş</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 border-b border-border overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand text-brand'
                  : 'border-transparent text-muted-foreground hover:text-[#111827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content: banner left + brand grid right */}
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
          {/* Left banner */}
          <div className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${banner.bg} p-6 flex flex-col justify-end min-h-[200px] md:min-h-0`}>
            {bannerImages[activeTab] && (
              <>
                <Image
                  src={bannerImages[activeTab]}
                  alt={banner.headline}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
                <div className="absolute inset-0 bg-black/40" />
              </>
            )}
            <div className="relative z-10">
              <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-1">Öne Çıkanlar</p>
              <h3 className="text-white font-bold text-lg leading-tight">{banner.headline}</h3>
              <p className="text-white/80 text-xs mt-1 leading-snug">{banner.sub}</p>
              <Link
                href={`/yedek-parcalar?q=${encodeURIComponent(banner.headline)}`}
                className="mt-4 inline-block text-xs font-bold text-white underline underline-offset-2 hover:text-white/80 transition-colors"
              >
                Tümünü Gör →
              </Link>
            </div>
          </div>

          {/* Right brand grid: 3 cols */}
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card, i) => {
              const borderColor = i % 3 === 1 ? 'border-blue-400' : 'border-orange-400';
              return (
                <Link
                  key={card.slug}
                  href={`/marka/${card.slug}`}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 ${borderColor} bg-white hover:shadow-md transition-shadow p-4 min-h-[110px] group`}
                >
                  {card.logoUrl ? (
                    <div className="relative w-full h-14">
                      <Image
                        src={card.logoUrl}
                        alt={card.name}
                        fill
                        className="object-contain"
                        sizes="120px"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-14 flex items-center justify-center">
                      <span className="text-lg font-black text-[#111827] group-hover:text-brand transition-colors text-center leading-tight">
                        {card.name}
                      </span>
                    </div>
                  )}
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-brand transition-colors">
                    {card.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
