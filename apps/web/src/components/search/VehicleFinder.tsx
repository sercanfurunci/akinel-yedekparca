'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useVehicleStore } from '@/store/vehicleStore';
import { useAuthStore } from '@/store/authStore';
import type { VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine, VehicleContext } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Car, ChevronRight } from 'lucide-react';

const selectClass =
  'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

interface VehicleFinderProps {
  onVehicleSelected?: (ctx: VehicleContext) => void;
  showSaveButton?: boolean;
}

export function VehicleFinder({ onVehicleSelected, showSaveButton = false }: VehicleFinderProps) {
  const router = useRouter();
  const { setSelectedVehicle, selectedVehicle } = useVehicleStore();
  const { accessToken } = useAuthStore();
  const isAuthenticated = !!accessToken;

  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [generations, setGenerations] = useState<VehicleGeneration[]>([]);
  const [engines, setEngines] = useState<VehicleEngine[]>([]);

  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    api.vehicles.makes().then((d) => setMakes(d as VehicleMake[])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedMake) { setModels([]); return; }
    api.vehicles.models(selectedMake).then((d) => setModels(d as VehicleModel[])).catch(() => {});
    setSelectedModel(''); setSelectedGeneration(''); setSelectedEngine('');
  }, [selectedMake]);

  useEffect(() => {
    if (!selectedModel) { setGenerations([]); return; }
    api.vehicles.generations(selectedModel).then((d) => setGenerations(d as VehicleGeneration[])).catch(() => {});
    setSelectedGeneration(''); setSelectedEngine('');
  }, [selectedModel]);

  useEffect(() => {
    if (!selectedGeneration) { setEngines([]); return; }
    api.vehicles.engines(selectedGeneration).then((d) => setEngines(d as VehicleEngine[])).catch(() => {});
    setSelectedEngine('');
  }, [selectedGeneration]);

  const steps = [
    { label: 'Marka', value: selectedMake, onChange: setSelectedMake, items: makes, disabled: false, placeholder: 'Marka seçin' },
    { label: 'Model', value: selectedModel, onChange: setSelectedModel, items: models, disabled: !selectedMake, placeholder: 'Model seçin' },
    { label: 'Kasa / Nesil', value: selectedGeneration, onChange: setSelectedGeneration, items: generations, disabled: !selectedModel, placeholder: 'Nesil seçin' },
    { label: 'Motor', value: selectedEngine, onChange: setSelectedEngine, items: engines, disabled: !selectedGeneration, placeholder: 'Motor seçin' },
  ];

  const handleSearch = async () => {
    if (!selectedEngine) return;
    setLoading(true);
    try {
      const ctx = await api.vehicles.context(selectedEngine) as VehicleContext;
      setSelectedVehicle(ctx);
      if (onVehicleSelected) {
        onVehicleSelected(ctx);
      } else {
        router.push(`/products?vehicleEngineId=${selectedEngine}`);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToGarage = async () => {
    if (!selectedEngine || !accessToken) return;
    setSaving(true);
    setSaveMsg('');
    try {
      await api.garage.add({ vehicleEngineId: selectedEngine }, accessToken);
      setSaveMsg('Araç garaja eklendi!');
    } catch {
      setSaveMsg('Garaja eklenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const completedSteps = [selectedMake, selectedModel, selectedGeneration, selectedEngine].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center gap-0 mb-4 overflow-x-auto pb-1">
        {steps.map((step, i) => {
          const done = i < completedSteps;
          const active = i === completedSteps;
          return (
            <span key={i} className="flex items-center shrink-0">
              <span className="flex flex-col items-center gap-1">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                    done
                      ? 'bg-brand text-brand-foreground'
                      : active
                      ? 'bg-accent-brand text-white ring-2 ring-accent-brand/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className={`text-[11px] font-medium ${active ? 'text-foreground' : done ? 'text-brand' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </span>
              {i < 3 && (
                <span className={`mx-2 h-px w-8 shrink-0 mb-3.5 ${done ? 'bg-brand' : 'bg-muted-foreground/20'}`} />
              )}
            </span>
          );
        })}
      </div>

      {/* Select dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground">{step.label}</label>
            <select
              value={step.value}
              onChange={(e) => step.onChange(e.target.value)}
              disabled={step.disabled}
              className={selectClass}
            >
              <option value="">{step.placeholder}</option>
              {step.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleSearch}
          disabled={!selectedEngine || loading}
          className="bg-brand text-brand-foreground hover:bg-brand/90 px-6"
        >
          <Car size={16} className="mr-2" />
          {loading ? 'Yükleniyor...' : 'Parçaları Göster'}
        </Button>

        {showSaveButton && selectedEngine && isAuthenticated && (
          <Button variant="outline" onClick={handleSaveToGarage} disabled={saving}>
            {saving ? 'Kaydediliyor...' : 'Garaja Kaydet'}
          </Button>
        )}

        {showSaveButton && selectedEngine && !isAuthenticated && (
          <span className="text-xs text-muted-foreground">
            Garaja kaydetmek için{' '}
            <a href="/login" className="text-brand underline">giriş yapın</a>.
          </span>
        )}

        {saveMsg && <span className="text-xs text-muted-foreground">{saveMsg}</span>}
      </div>

      {/* Already selected vehicle context */}
      {selectedVehicle && (
        <div className="rounded-lg border bg-brand-muted/40 px-4 py-3 flex items-center gap-2 mt-2">
          <Car size={16} className="text-brand shrink-0" />
          <p className="text-sm">
            <span className="text-muted-foreground">Seçili araç: </span>
            <span className="font-medium">{selectedVehicle.displayLabel}</span>
          </p>
        </div>
      )}
    </div>
  );
}
