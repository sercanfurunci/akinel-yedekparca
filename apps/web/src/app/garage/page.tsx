'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useVehicleStore } from '@/store/vehicleStore';
import { VehicleCard } from '@/components/vehicle/VehicleCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { VehicleContext } from '@/lib/types';

interface UserVehicle {
  id: string;
  makeName: string;
  modelName: string;
  generationName: string;
  engineName: string;
  nickname?: string;
  engineId: string;
}

export default function GaragePage() {
  const { accessToken } = useAuthStore();
  const isAuthenticated = !!accessToken;
  const { setSelectedVehicle } = useVehicleStore();
  const router = useRouter();

  const [vehicles, setVehicles] = useState<UserVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [garageUnavailable, setGarageUnavailable] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!accessToken) return;

    api.garage.list(accessToken)
      .then((data) => setVehicles(data as UserVehicle[]))
      .catch((err: unknown) => {
        // If 404, garage not yet available
        const message = err instanceof Error ? err.message : '';
        if (message.includes('404')) {
          setGarageUnavailable(true);
        }
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, accessToken, router]);

  const handleSelect = (vehicle: UserVehicle) => {
    const ctx: VehicleContext = {
      engineId: vehicle.engineId,
      makeName: vehicle.makeName,
      modelName: vehicle.modelName,
      generationName: vehicle.generationName,
      engineName: vehicle.engineName,
      displayLabel: `${vehicle.makeName} ${vehicle.modelName} ${vehicle.generationName} ${vehicle.engineName}`,
    };
    setSelectedVehicle(ctx);
    router.push(`/products?vehicleEngineId=${vehicle.engineId}`);
  };

  const handleDelete = async (id: string) => {
    if (!accessToken) return;
    try {
      await api.garage.remove(id, accessToken);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch {
      // ignore
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <LoadingPage />;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'Garajım' }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Garajım</h1>
        <Link
          href="/vehicle"
          className={cn(buttonVariants({ variant: 'default' }), 'bg-brand text-brand-foreground hover:bg-brand/90')}
        >
          <Plus size={16} className="mr-2" />
          Araç Ekle
        </Link>
      </div>

      {garageUnavailable ? (
        <div
          className="rounded-xl border bg-card p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <Car size={48} className="mx-auto text-muted-foreground mb-4" aria-hidden="true" />
          <h2 className="font-semibold mb-2">Garaj özelliği yakında</h2>
          <p className="text-sm text-muted-foreground">Bu özellik şu anda geliştirme aşamasında. Yakında kullanıma açılacak.</p>
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={<Car size={48} />}
          title="Henüz araç eklemediniz"
          description="Aracınızı seçerek kişiselleştirilmiş parça önerilerine hızlıca ulaşın."
          action={
            <Link
              href="/vehicle"
              className={cn(buttonVariants({ variant: 'default' }), 'bg-brand text-brand-foreground hover:bg-brand/90 cursor-pointer')}
              aria-label="Yeni araç ekle"
            >
              <Plus size={16} className="mr-2" aria-hidden="true" />
              Araç Ekle
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
