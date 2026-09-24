'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Car } from 'lucide-react';
import { VehicleFinder } from '@/components/search/VehicleFinder';
import { useVehicleStore } from '@/store/vehicleStore';
import type { VehicleContext } from '@/lib/types';
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { cn } from '@/lib/utils';

export default function VehicleFinderPage() {
  const { selectedVehicle, clearVehicle } = useVehicleStore();
  const [justSelected, setJustSelected] = useState<VehicleContext | null>(null);

  const handleVehicleSelected = (ctx: VehicleContext) => {
    setJustSelected(ctx);
  };

  const displayVehicle = justSelected ?? selectedVehicle;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Aracımı Seç' }]} />

      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Aracınızı Seçin</h1>
        <p className="text-muted-foreground mb-8">
          4 adımda aracınızı seçin ve uyumlu parçaları keşfedin.
        </p>

        <div className="bg-card border rounded-xl p-6 mb-6">
          <VehicleFinder onVehicleSelected={handleVehicleSelected} showSaveButton={true} />
        </div>

        {/* Summary after selection */}
        {displayVehicle && (
          <div className="bg-card border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted text-brand">
                <Car size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Seçili Araç</p>
                <p className="font-bold">{displayVehicle.displayLabel}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/products?vehicleEngineId=${displayVehicle.engineId}`}
                className={cn(buttonVariants({ variant: 'default' }), 'bg-brand text-brand-foreground hover:bg-brand/90')}
              >
                Parçaları Gör
              </Link>
              <Button
                variant="outline"
                onClick={() => { clearVehicle(); setJustSelected(null); }}
              >
                Aracı Değiştir
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
