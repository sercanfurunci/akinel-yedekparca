'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { VehicleMake } from '@/lib/types';

const POPULAR_SLUGS = [
  'audi', 'mercedes-benz', 'volkswagen', 'bmw', 'toyota',
  'hyundai', 'ford', 'citroen', 'opel', 'honda',
  'renault', 'fiat', 'peugeot',
];

export function VehicleMakesMegaMenu() {
  const [open, setOpen] = useState(false);
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.vehicles.makes().then((data) => {
      const all = data as VehicleMake[];
      const popular = POPULAR_SLUGS
        .map(slug => all.find(m => m.slug === slug))
        .filter(Boolean) as VehicleMake[];
      setMakes(popular);
    }).catch(() => {});
  }, []);

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      className="relative h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className={cn(
          'relative px-4 h-full inline-flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer',
          open ? 'text-white' : 'text-white/70 hover:text-white'
        )}
        aria-haspopup="true"
        aria-expanded={open}
      >
        Araçlar
        <ChevronDown size={13} className={cn('transition-transform duration-200', open && 'rotate-180')} />
        {open && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-t-sm" aria-hidden="true" />
        )}
      </button>

      {open && makes.length > 0 && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 pt-0">
          <div className="bg-white border border-border shadow-2xl rounded-b-xl overflow-hidden w-72">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Araç Markası Seç</p>
            </div>
            <div className="grid grid-cols-2 gap-0 p-2">
              {makes.map((make) => (
                <Link
                  key={make.id}
                  href={`/vehicle?makeId=${make.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand/8 hover:text-brand transition-colors"
                >
                  {make.logoUrl ? (
                    <img src={make.logoUrl} alt="" className="w-5 h-5 object-contain shrink-0" />
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400 shrink-0">
                      {make.name.charAt(0)}
                    </span>
                  )}
                  <span className="truncate">{make.name}</span>
                </Link>
              ))}
            </div>
            <div className="px-3 py-2 border-t border-border">
              <Link
                href="/vehicle"
                onClick={() => setOpen(false)}
                className="block text-center text-xs text-brand hover:underline font-medium"
              >
                Tüm araçları gör →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
