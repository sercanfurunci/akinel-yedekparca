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

const INTERVAL_MS = 5000;

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const totalSlides = slides.length;

  const goTo = useCallback((index: number) => {
    setCurrent(((index % totalSlides) + totalSlides) % totalSlides);
  }, [totalSlides]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const prefersReduced = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    timerRef.current = setTimeout(next, INTERVAL_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, isPaused, next, totalSlides]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  const slide = slides[current];

  return (
    <section aria-label="Ana sayfa slayt gösterisi">
      {/* ── IMAGE SLIDER (top, pure visual) ─────────────────────────── */}
      <div
        className="relative overflow-hidden bg-[#111827]"
        style={{ height: 'clamp(220px, 35vw, 420px)' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {slides.map((s, i) => {
          const imgUrl = getImageUrl(s.imageUrl);
          return (
            <div
              key={s.id}
              aria-hidden={i !== current}
              className={cn(
                'absolute inset-0 transition-opacity duration-700',
                i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
              )}
            >
              {imgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imgUrl}
                  alt=""
                  role="presentation"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding={i === 0 ? 'sync' : 'async'}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent" />
              )}
            </div>
          );
        })}

        {/* Prev / Next */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Önceki slayt"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-colors backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Sonraki slayt"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-colors backdrop-blur-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2"
              role="tablist"
              aria-label="Slaytlar"
            >
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Slayt ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={cn(
                    'rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60',
                    i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── CONTENT (below image, always readable) ───────────────────── */}
      <div className="bg-[#111827] text-white">
        <div className="container mx-auto px-4 max-w-7xl py-10 md:py-14">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="h-0.5 w-8 bg-brand rounded-full" />
              <p className="text-brand text-xs font-bold uppercase tracking-widest">
                AKINEL OTO YEDEK PARÇA
              </p>
              <span className="h-0.5 w-8 bg-brand rounded-full" />
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">
              {slide?.title ? (
                slide.title
              ) : (
                <>Aracınız için <span className="text-brand">doğru parçayı</span> bulun</>
              )}
            </h1>

            <p className="text-white/70 mb-6 text-sm md:text-base max-w-2xl mx-auto">
              {slide?.subtitle
                ? slide.subtitle
                : 'OEM numarası, parça adı veya aracınızı seçerek hızlıca arayın. AKN MOTORS Car Service güvencesi.'}
            </p>

            <div className="bg-white rounded-xl p-2 mb-5 shadow-2xl shadow-brand/10">
              <GlobalSearch size="lg" />
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {slide?.ctaText && slide?.ctaUrl ? (
                <Link
                  href={slide.ctaUrl}
                  className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'h-11 px-5')}
                >
                  {slide.ctaText}
                </Link>
              ) : null}
              <Link
                href="/vehicle"
                className={cn(buttonVariants({ variant: slide?.ctaText ? 'secondary' : 'default', size: 'lg' }), 'h-11 px-5')}
              >
                <Car size={16} className="mr-2" /> Aracımı Seç
              </Link>
              <Link
                href="/search"
                className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'h-11 px-5 bg-white/15 hover:bg-white/25 text-white border-white/20')}
              >
                <Search size={16} className="mr-2" /> OEM ile Ara
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Static hero — fallback when no active slides */
export function StaticHero() {
  return (
    <section className="bg-[#111827] text-white py-14 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 max-w-7xl relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="h-0.5 w-8 bg-brand rounded-full" />
            <p className="text-brand text-xs font-bold uppercase tracking-widest">
              AKINEL OTO YEDEK PARÇA
            </p>
            <span className="h-0.5 w-8 bg-brand rounded-full" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight">
            Aracınız için{' '}
            <span className="text-brand">doğru parçayı</span>{' '}
            bulun
          </h1>
          <p className="text-white/70 mb-6 text-sm md:text-base max-w-2xl mx-auto">
            OEM numarası, parça adı veya aracınızı seçerek hızlıca arayın.
            AKN MOTORS Car Service güvencesi.
          </p>
          <div className="bg-white rounded-xl p-2 mb-5 shadow-2xl shadow-brand/10">
            <GlobalSearch size="lg" />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/vehicle"
              className={cn(buttonVariants({ variant: 'default', size: 'lg' }), 'h-11 px-5')}
            >
              <Car size={16} className="mr-2" /> Aracımı Seç
            </Link>
            <Link
              href="/search"
              className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'h-11 px-5')}
            >
              <Search size={16} className="mr-2" /> OEM ile Ara
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
