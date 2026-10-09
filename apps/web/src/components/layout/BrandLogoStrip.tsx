'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid, Car } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { VehicleMake, VehicleGenerationWithModel } from '@/lib/types';

const STRIP_SLUGS = [
  'audi', 'mercedes-benz', 'volkswagen', 'bmw', 'toyota',
  'hyundai', 'ford', 'citroen', 'opel', 'honda',
  'renault', 'fiat', 'peugeot',
];

const gensCache = new Map<string, VehicleGenerationWithModel[]>();

export function BrandLogoStrip() {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [activeMake, setActiveMake] = useState<VehicleMake | null>(null);
  const [generations, setGenerations] = useState<VehicleGenerationWithModel[]>([]);
  const [bodyFilter, setBodyFilter] = useState<string | null>(null);
  const [loadingGens, setLoadingGens] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.vehicles.makes().then((data) => {
      const all = data as VehicleMake[];
      const ordered = STRIP_SLUGS
        .map(slug => all.find(m => m.slug === slug))
        .filter(Boolean) as VehicleMake[];
      setMakes(ordered);
    }).catch(() => {});
  }, []);

  const openMake = useCallback((make: VehicleMake) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMake(make);
    setBodyFilter(null);
    if (gensCache.has(make.id)) {
      setGenerations(gensCache.get(make.id)!);
      return;
    }
    setLoadingGens(true);
    api.vehicles.generationsByMake(make.id, 24)
      .then((data) => {
        const list = data as VehicleGenerationWithModel[];
        gensCache.set(make.id, list);
        setGenerations(list);
      })
      .catch(() => setGenerations([]))
      .finally(() => setLoadingGens(false));
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setActiveMake(null);
      setGenerations([]);
      setBodyFilter(null);
    }, 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  if (makes.length === 0) return null;

  // Body types from loaded generations
  const bodyTypes = activeMake
    ? [...new Set(generations.map(g => g.bodyType).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, 'tr'))
    : [];

  const filtered = bodyFilter ? generations.filter(g => g.bodyType === bodyFilter) : generations;

  return (
    <div
      className="bg-white border-b border-border relative z-10"
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-3 md:gap-4 h-10 md:h-12">
          <div className="flex items-center gap-4 md:gap-0 overflow-x-auto flex-1 md:justify-between [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* TÜM ARAÇLAR — desktop only */}
            <Link
              href="/vehicle"
              className="hidden md:flex shrink-0 items-center gap-1.5 bg-brand hover:bg-brand/90 text-white text-xs font-bold px-3 h-8 rounded-md transition-colors whitespace-nowrap mr-3"
            >
              <LayoutGrid size={13} />
              TÜM ARAÇLAR
            </Link>

            <div className="hidden md:block w-px h-5 bg-border/60 shrink-0 mr-3" />

            {makes.map((make) => {
              const isActive = activeMake?.id === make.id;
              return (
                <button
                  key={make.id}
                  type="button"
                  onMouseEnter={() => openMake(make)}
                  onClick={() => openMake(make)}
                  className="flex flex-col items-center justify-center gap-0.5 shrink-0 px-1 cursor-pointer group"
                >
                  {make.logoUrl ? (
                    <div className="relative h-5 w-12 md:h-6 md:w-14">
                      <Image
                        src={getImageUrl(make.logoUrl)!}
                        alt={make.name}
                        fill
                        className="object-contain"
                        sizes="56px"
                      />
                    </div>
                  ) : (
                    <span className={`text-xs font-semibold whitespace-nowrap ${isActive ? 'text-[#111827]' : 'text-gray-400 group-hover:text-[#111827]'}`}>
                      {make.name}
                    </span>
                  )}
                  <span className={`block h-0.5 w-5 rounded-full bg-brand transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {activeMake && (
        <div className="absolute left-0 right-0 bg-white border-t-2 border-brand shadow-2xl z-50">
          <div className="container mx-auto px-4 max-w-7xl py-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {activeMake.logoUrl && (
                  <div className="relative h-7 w-14">
                    <Image src={getImageUrl(activeMake.logoUrl)!} alt={activeMake.name} fill className="object-contain" sizes="56px" />
                  </div>
                )}
                <span className="font-bold text-[#111827] text-sm">{activeMake.name} Modelleri</span>
              </div>
              <Link href={`/vehicle?makeId=${activeMake.id}`} className="text-xs text-brand hover:underline font-semibold">
                Tümünü Gör →
              </Link>
            </div>

            {/* Body type filter chips */}
            {bodyTypes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => setBodyFilter(null)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    bodyFilter === null ? 'bg-brand text-white border-brand' : 'border-border text-muted-foreground hover:border-brand hover:text-brand bg-white'
                  }`}
                >
                  Tümü
                </button>
                {bodyTypes.map(bt => (
                  <button
                    key={bt}
                    onClick={() => setBodyFilter(bodyFilter === bt ? null : bt)}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      bodyFilter === bt ? 'bg-brand text-white border-brand' : 'border-border text-muted-foreground hover:border-brand hover:text-brand bg-white'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            )}

            {/* Kasas grid */}
            {loadingGens ? (
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Kasa bulunamadı.</p>
            ) : (
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto pr-1">
                {filtered.map((gen) => (
                  <Link
                    key={gen.id}
                    href={`/vehicle?makeId=${activeMake.id}&modelId=${gen.modelId}`}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-border hover:border-brand hover:bg-brand/5 text-[#374151] transition-colors group"
                  >
                    <div className="relative h-12 w-16 shrink-0 rounded overflow-hidden bg-gray-50 flex items-center justify-center">
                      {gen.imageUrl ? (
                        <img src={getImageUrl(gen.imageUrl)!} alt={gen.name} className="w-full h-full object-cover" />
                      ) : (
                        <Car size={16} className="text-gray-300 group-hover:text-brand/50 transition-colors" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate group-hover:text-brand transition-colors leading-tight">{gen.modelName}</p>
                      <p className="text-[10px] text-muted-foreground truncate leading-tight">{gen.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
