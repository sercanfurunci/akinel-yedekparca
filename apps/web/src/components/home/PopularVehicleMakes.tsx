'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ChevronLeft, LayoutGrid } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { VehicleMake, VehicleModel } from '@/lib/types';

const POPULAR_MODELS: Record<string, string[]> = {
  'audi':          ['A3', 'A4', 'A5', 'A6', 'Q7', 'Q8'],
  'bmw':           ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X6'],
  'citroen':       ['C3', 'C4', 'C5', 'C-Elysee', 'Berlingo', 'C5 Aircross'],
  'fiat':          ['Linea', 'Albea', 'Doblo', 'Egea', 'Uno', '500L'],
  'ford':          ['Fiesta', 'Focus', 'Transit', 'Mondeo', 'Courier', 'Fusion'],
  'hyundai':       ['Accent', 'Getz', 'i20', 'i30', 'Tucson', 'Santa Fe'],
  'mercedes-benz': ['A Serisi', 'B Serisi', 'C Serisi', 'E Serisi', 'CLA', 'S Serisi'],
  'opel':          ['Corsa', 'Astra', 'Vectra', 'Insignia', 'Mokka', 'Grandland'],
  'peugeot':       ['206', '301', '307', '308', '2008', '3008'],
  'renault':       ['Clio', 'Laguna', 'Megane', 'Symbol', 'Master', 'Kangoo'],
  'toyota':        ['Corolla', 'Avensis', 'Auris', 'Yaris', 'RAV4', 'Verso'],
  'volkswagen':    ['Golf', 'Passat', 'Polo', 'Jetta', 'Tiguan', 'Caddy'],
  'honda':         ['Civic', 'CR-V', 'Jazz', 'HR-V', 'Accord', 'City'],
};

const STRIP_SLUGS = [
  'audi', 'bmw', 'citroen', 'fiat', 'ford', 'hyundai',
  'mercedes-benz', 'opel', 'peugeot', 'renault', 'toyota', 'volkswagen', 'honda',
];

// max-w-7xl = 1280px, px-4 padding = 32px total → 1248px usable
// 4 cards × 300px + 3 gaps × 16px = 1200 + 48 = 1248px ✓
const CARD_W = 300;
const GAP = 16;
const SLIDE_INTERVAL = 2000;
const TRANSITION_MS = 400;

interface MakeCard { make: VehicleMake; models: { label: string; id: string | null }[] }

function findModel(all: VehicleModel[], kw: string) {
  const k = kw.toLowerCase();
  return all.find(m => m.name.toLowerCase() === k)
    ?? all.find(m => m.name.toLowerCase().startsWith(k))
    ?? all.find(m => m.name.toLowerCase().includes(k));
}

function Card({ make, models }: MakeCard) {
  return (
    <div
      className="border border-border rounded-xl p-5 flex flex-col bg-white hover:border-brand/40 hover:shadow-md transition-all shrink-0"
      style={{ width: CARD_W, minHeight: 320 }}
    >
      <div className="flex justify-center mb-3">
        {make.logoUrl
          ? <div className="relative h-12 w-24"><Image src={getImageUrl(make.logoUrl)!} alt={make.name} fill className="object-contain" sizes="96px" /></div>
          : <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-lg">{make.name[0]}</div>
        }
      </div>
      <p className="text-center text-sm font-bold text-[#111827] mb-3 leading-snug">
        {make.name} Oto Yedek Parçaları
      </p>
      <ul className="flex-1 space-y-0.5 mb-4">
        {models.map(({ label, id }) => (
          <li key={label}>
            <Link
              href={id ? `/vehicle?makeId=${make.id}&modelId=${id}` : `/vehicle?makeId=${make.id}`}
              className="block text-center text-xs text-[#4B5563] hover:text-brand transition-colors py-0.5"
            >
              {label} Yedek Parçaları
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={`/products?brandSlug=${make.slug}`}
        className="flex items-center justify-center gap-1 text-xs font-bold text-[#111827] hover:text-brand border-t border-border/60 pt-3 transition-colors uppercase tracking-wide"
      >
        {make.name} Ürünlerini Listele <ChevronRight size={13} />
      </Link>
    </div>
  );
}

function AllBrandsCard() {
  return (
    <div
      className="border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center bg-[#F9FAFB] shrink-0 gap-3"
      style={{ width: CARD_W, minHeight: 320 }}
    >
      <LayoutGrid size={36} className="text-gray-300" />
      <div className="text-center">
        <p className="text-4xl font-black text-brand">60+</p>
        <p className="text-xs text-muted-foreground mt-1">farklı marka için binlerce<br />orijinal yedek parça</p>
      </div>
      <Link href="/brands" className="flex items-center gap-1 text-xs font-bold text-[#111827] hover:text-brand transition-colors uppercase tracking-wide">
        Tüm Markaları Gör <ChevronRight size={13} />
      </Link>
    </div>
  );
}

export function PopularVehicleMakes() {
  const [cards, setCards] = useState<MakeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [animated, setAnimated] = useState(true);
  const paused = useRef(false);

  useEffect(() => {
    api.vehicles.makes().then(async (data) => {
      const all = data as VehicleMake[];
      const ordered = STRIP_SLUGS.map(s => all.find(m => m.slug === s)).filter(Boolean) as VehicleMake[];
      const built = await Promise.all(ordered.map(async make => {
        let allModels: VehicleModel[] = [];
        try { allModels = await api.vehicles.models(make.id) as VehicleModel[]; } catch { /**/ }
        return {
          make,
          models: (POPULAR_MODELS[make.slug] ?? []).map(label => ({
            label, id: findModel(allModels, label)?.id ?? null,
          })),
        };
      }));
      setCards(built);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalItems = cards.length + 1; // cards + AllBrands = 14

  // Forward snap: when offset reaches totalItems, instantly reset to 0 (set2 start = set1 start)
  useEffect(() => {
    if (offset < totalItems || cards.length === 0) return;
    const t = setTimeout(() => {
      setAnimated(false);
      setOffset(0);
    }, TRANSITION_MS);
    return () => clearTimeout(t);
  }, [offset, totalItems, cards.length]);

  // Re-enable animation after snap
  useEffect(() => {
    if (!animated) {
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimated(true)));
    }
  }, [animated]);

  // Auto-advance
  useEffect(() => {
    if (cards.length === 0) return;
    const id = setInterval(() => {
      if (!paused.current) setOffset(prev => prev + 1);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [cards.length]);

  const slideNext = useCallback(() => {
    setAnimated(true);
    setOffset(prev => prev + 1);
  }, []);

  const slidePrev = useCallback(() => {
    if (offset === 0) {
      // Jump to cloned end (invisible), then animate back
      setAnimated(false);
      setOffset(totalItems);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setAnimated(true);
        setOffset(totalItems - 1);
      }));
    } else {
      setAnimated(true);
      setOffset(prev => prev - 1);
    }
  }, [offset, totalItems]);

  if (loading) {
    return (
      <section className="bg-white border-b border-border py-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="h-6 w-72 bg-gray-200 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </section>
    );
  }

  if (cards.length === 0) return null;

  // Render 2 copies for seamless forward loop; backward edge handled by jump trick
  const allItems: (MakeCard | null)[] = [...cards, null];
  const doubled = [...allItems, ...allItems];

  return (
    <section className="bg-white border-b border-border py-10">
      {/* Title + arrows */}
      <div className="container mx-auto px-4 max-w-7xl mb-6">
        <div className="flex items-end justify-between">
          <div>
            <div className="w-10 h-1 bg-brand rounded-full mb-3" />
            <h2 className="text-xl md:text-2xl font-bold text-[#111827]">Popüler Oto Yedek Parça Fiyatları</h2>
            <p className="text-sm text-muted-foreground mt-1">Marka ve modele göre yedek parça bulun</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={slidePrev}
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-[#374151] hover:border-brand hover:text-brand transition-colors"
              aria-label="Önceki"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={slideNext}
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-[#374151] hover:border-brand hover:text-brand transition-colors"
              aria-label="Sonraki"
            >
              <ChevronRight size={18} />
            </button>
            <Link href="/vehicle" className="ml-2 text-sm text-brand hover:text-brand/80 font-semibold flex items-center gap-1 transition-colors">
              Tüm Markalar <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel — overflow-hidden clips to container width (1248px = 4 × 300 + 3 × 16) */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              gap: GAP,
              transform: `translateX(-${offset * (CARD_W + GAP)}px)`,
              transition: animated ? `transform ${TRANSITION_MS}ms ease` : 'none',
            }}
            onMouseEnter={() => { paused.current = true; }}
            onMouseLeave={() => { paused.current = false; }}
          >
            {doubled.map((card, i) =>
              card === null
                ? <AllBrandsCard key={`ab-${i}`} />
                : <Card key={`${card.make.id}-${i}`} {...card} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
