'use client';

import { Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface UserVehicle {
  id: string;
  makeName: string;
  modelName: string;
  generationName: string;
  engineName: string;
  nickname?: string;
  engineId: string;
}

interface VehicleCardProps {
  vehicle: UserVehicle;
  onSelect?: (vehicle: UserVehicle) => void;
  onDelete?: (id: string) => void;
}

export function VehicleCard({ vehicle, onSelect, onDelete }: VehicleCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
              <Car size={20} />
            </div>
            <div>
              {vehicle.nickname && (
                <p className="text-xs text-muted-foreground mb-0.5">{vehicle.nickname}</p>
              )}
              <p className="font-semibold text-sm">
                {vehicle.makeName} {vehicle.modelName}
              </p>
              <p className="text-sm text-muted-foreground">{vehicle.generationName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{vehicle.engineName}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {onSelect && (
              <Button
                size="sm"
                onClick={() => onSelect(vehicle)}
                aria-label={`${vehicle.makeName} ${vehicle.modelName} aracını seç`}
                title="Bu aracı seç"
                className="cursor-pointer"
              >
                Seç
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(vehicle.id)}
                aria-label={`${vehicle.makeName} ${vehicle.modelName} aracını sil`}
                title="Aracı sil"
                className="cursor-pointer"
              >
                Sil
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
