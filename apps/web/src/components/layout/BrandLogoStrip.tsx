'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutGrid, Car } from 'lucide-react';
import { api } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import type { VehicleMake, VehicleModel } from '@/lib/types';

const STRIP_SLUGS = [
  'audi', 'mercedes-benz', 'volkswagen', 'bmw', 'toyota',
  'hyundai', 'ford', 'citroen', 'opel', 'honda',
  'renault', 'fiat', 'peugeot',
];

const modelsCache = new Map<string, VehicleModel[]>();

export function BrandLogoStrip() {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [activeMake, setActiveMake] = useState<VehicleMake | null>(null);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
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
    if (modelsCache.has(make.id)) {
      setModels(modelsCache.get(make.id)!);
      return;
    }
    setLoadingModels(true);
    api.vehicles.models(make.id)
      .then((data) => {
        const list = data as VehicleModel[];
        modelsCache.set(make.id, list);
        setModels(list);
      })
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setActiveMake(null);
      setModels([]);
    }, 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  if (makes.length === 0) return null;

  return (
    <div
      className="bg-white border-b border-border relative z-10"
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-3 md:gap-4 h-10 md:h-12">
          {/* TÜM ARAÇLAR */}
          {/* Mobile: sadece logolar, scroll */}
          <div className="flex items-center gap-4 md:gap-0 overflow-x-auto flex-1 md:justify-between [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* TÜM ARAÇLAR — sadece desktop */}
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
          <div className="container mx-auto px-4 max-w-7xl py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {activeMake.logoUrl && (
                  <div className="relative h-8 w-16">
                    <Image
                      src={getImageUrl(activeMake.logoUrl)!}
                      alt={activeMake.name}
                      fill
                      className="object-contain"
                      sizes="64px"
                    />
                  </div>
                )}
                <span className="font-bold text-[#111827] text-base">{activeMake.name} Modelleri</span>
              </div>
              <Link href={`/vehicle?makeId=${activeMake.id}`} className="text-xs text-brand hover:underline font-semibold">
                Tümünü Gör →
              </Link>
            </div>

            {loadingModels ? (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : models.length === 0 ? (
              <p className="text-sm text-muted-foreground">Model bulunamadı.</p>
            ) : (
              <div className="grid grid-cols-5 gap-1.5 max-h-72 overflow-y-auto pr-1">
                {models.map((model) => (
                  <Link
                    key={model.id}
                    href={`/vehicle?makeId=${activeMake.id}&modelId=${model.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-brand/5 hover:text-brand text-[#374151] transition-colors group"
                  >
                    {model.imageUrl ? (
                      <div className="relative h-8 w-12 shrink-0 rounded overflow-hidden bg-gray-50">
                        <Image src={getImageUrl(model.imageUrl)!} alt={model.name} fill className="object-contain" sizes="48px" />
                      </div>
                    ) : (
                      <div className="h-8 w-12 shrink-0 rounded bg-gray-100 flex items-center justify-center">
                        <Car size={14} className="text-gray-400" />
                      </div>
                    )}
                    <span className="truncate text-xs font-medium group-hover:font-semibold">{model.name}</span>
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
