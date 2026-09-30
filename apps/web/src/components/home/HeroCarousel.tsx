'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { Car, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/utils';
import type { HeroSlide } from '@/lib/types';

interface HeroCarouselProps {
  slides: HeroSlide[];
}

const INTERVAL_MS = 5500;

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = slides.length;

  const goTo = useCallback((i: number) => {
    setCurrent(((i % total) + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timerRef.current = setTimeout(next, INTERVAL_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, isPaused, next, total]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [prev, next]);

  return (
    <section
      className="relative overflow-hidden bg-[#111827]"
      style={{ minHeight: 'clamp(520px, 80vh, 820px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Ana sayfa hero bölümü"
    >
      {/* ── BACKGROUND IMAGES (crossfade) ──────────────────────────────── */}
      {slides.map((s, i) => {
        const url = getImageUrl(s.imageUrl);
        return (
          <div
            key={s.id}
            aria-hidden={i !== current}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000',
              i === current ? 'opacity-100' : 'opacity-0'
            )}
          >
            {url
              ? <img src={url} alt="" role="presentation" className="absolute inset-0 w-full h-full object-cover" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'low'} />
              : <div className="absolute inset-0 bg-[#1F2937]" />
            }
          </div>
        );
      })}

      {/* ── GRADIENT OVERLAY ──────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/95 via-[#111827]/60 to-[#111827]/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#111827]/40 via-transparent to-[#111827]/20 pointer-events-none" />

      {/* ── CONTENT (overlay, anchored to bottom) ──────────────────────── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="container mx-auto px-4 max-w-5xl pb-14 md:pb-20">
          <div className="max-w-2xl mx-auto text-center text-white">

            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-10 bg-brand" />
              <p className="text-brand text-[11px] font-bold uppercase tracking-[0.2em]">AKINEL OTO YEDEK PARÇA</p>
              <span className="h-px w-10 bg-brand" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-[1.1] tracking-tight drop-shadow-lg">
              Aracınız için{' '}
              <span className="text-brand">doğru parçayı</span>{' '}
              bulun
            </h1>

            <p className="text-white/75 mb-8 text-sm md:text-base leading-relaxed drop-shadow">
              OEM numarası, parça adı veya aracınızı seçerek hızlıca arayın.
              <span className="hidden md:inline"> Kaliteli ürün, hızlı teslimat.</span>
            </p>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-1.5 mb-6 shadow-2xl">
              <GlobalSearch size="lg" />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/vehicle" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'h-11 px-6 shadow-lg')}>
                <Car size={16} className="mr-2" /> Aracımı Seç
              </Link>
              <Link href="/search" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-6 bg-white/15 hover:bg-white/25 text-white border border-white/30 backdrop-blur-sm shadow-lg')}>
                <Search size={16} className="mr-2" /> OEM ile Ara
              </Link>
            </div>
          </div>
        </div>

        {/* Prev / Next + Dots */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Önceki slayt"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/55 hover:text-white transition-all backdrop-blur-sm border border-white/10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Sonraki slayt"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/55 hover:text-white transition-all backdrop-blur-sm border border-white/10"
            >
              <ChevronRight size={20} />
            </button>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5" role="tablist">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Slayt ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    'rounded-full transition-all duration-400',
                    i === current ? 'w-7 h-2 bg-brand' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

/** Static hero — fallback when no active slides */
export function StaticHero() {
  return (
    <section className="relative overflow-hidden bg-[#111827]" style={{ minHeight: 'clamp(520px, 80vh, 820px)' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand/15 via-[#111827] to-[#111827]" />
      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="container mx-auto px-4 max-w-5xl pb-14 md:pb-20">
          <div className="max-w-2xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-10 bg-brand" />
              <p className="text-brand text-[11px] font-bold uppercase tracking-[0.2em]">AKINEL OTO YEDEK PARÇA</p>
              <span className="h-px w-10 bg-brand" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-[1.1] tracking-tight">
              Aracınız için <span className="text-brand">doğru parçayı</span> bulun
            </h1>
            <p className="text-white/75 mb-8 text-sm md:text-base leading-relaxed">
              OEM numarası, parça adı veya aracınızı seçerek hızlıca arayın. Kaliteli ürün, hızlı teslimat.
            </p>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-1.5 mb-6 shadow-2xl">
              <GlobalSearch size="lg" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/vehicle" className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'h-11 px-6')}>
                <Car size={16} className="mr-2" /> Aracımı Seç
              </Link>
              <Link href="/search" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-6 bg-white/15 hover:bg-white/25 text-white border border-white/30')}>
                <Search size={16} className="mr-2" /> OEM ile Ara
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
