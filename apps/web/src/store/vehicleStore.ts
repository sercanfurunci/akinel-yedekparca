import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VehicleContext } from '@/lib/types';

interface VehicleStore {
  selectedVehicle: VehicleContext | null;
  setSelectedVehicle: (vehicle: VehicleContext | null) => void;
  clearVehicle: () => void;
}

export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set) => ({
      selectedVehicle: null,
      setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
      clearVehicle: () => set({ selectedVehicle: null }),
    }),
    { name: 'akinel-vehicle-context' }
  )
);
