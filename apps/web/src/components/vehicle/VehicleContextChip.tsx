'use client';

import Link from 'next/link';
import { Car, X } from 'lucide-react';
import { useVehicleStore } from '@/store/vehicleStore';

export function VehicleContextChip() {
  const { selectedVehicle, clearVehicle } = useVehicleStore();

  if (!selectedVehicle) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <Car size={14} className="text-brand shrink-0" />
      <span className="text-muted-foreground text-xs">Seçili Araç:</span>
      <span className="font-medium text-xs text-brand truncate max-w-[200px] md:max-w-none">
        {selectedVehicle.displayLabel}
      </span>
      <Link
        href="/vehicle"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline shrink-0 cursor-pointer"
        title="Aracı değiştir"
      >
        Değiştir
      </Link>
      <button
        type="button"
        onClick={clearVehicle}
        className="inline-flex items-center justify-center h-5 w-5 rounded-full hover:bg-muted-foreground/20 active:scale-95 transition-all shrink-0 cursor-pointer"
        aria-label="Araç seçimini temizle"
        title="Temizle"
      >
        <X size={10} aria-hidden="true" />
      </button>
    </div>
  );
}
