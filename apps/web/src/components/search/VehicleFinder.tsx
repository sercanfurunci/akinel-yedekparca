'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useVehicleStore } from '@/store/vehicleStore';
import { useAuthStore } from '@/store/authStore';
import type { VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine, VehicleContext } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Car, Check } from 'lucide-react';

const selectClass =
  'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/40 transition-colors';

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

  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingGenerations, setLoadingGenerations] = useState(false);
  const [loadingEngines, setLoadingEngines] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    api.vehicles.makes().then((d) => setMakes(d as VehicleMake[])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedMake) { setModels([]); return; }
    setLoadingModels(true);
    api.vehicles.models(selectedMake)
      .then((d) => setModels(d as VehicleModel[]))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
    setSelectedModel(''); setSelectedGeneration(''); setSelectedEngine('');
  }, [selectedMake]);

  useEffect(() => {
    if (!selectedModel) { setGenerations([]); return; }
    setLoadingGenerations(true);
    api.vehicles.generations(selectedModel)
      .then((d) => setGenerations(d as VehicleGeneration[]))
      .catch(() => setGenerations([]))
      .finally(() => setLoadingGenerations(false));
    setSelectedGeneration(''); setSelectedEngine('');
  }, [selectedModel]);

  useEffect(() => {
    if (!selectedGeneration) { setEngines([]); return; }
    setLoadingEngines(true);
    api.vehicles.engines(selectedGeneration)
      .then((d) => setEngines(d as VehicleEngine[]))
      .catch(() => setEngines([]))
      .finally(() => setLoadingEngines(false));
    setSelectedEngine('');
  }, [selectedGeneration]);

  const steps = [
    { label: 'Marka', value: selectedMake, onChange: setSelectedMake, items: makes, disabled: false, loading: false, placeholder: 'Marka seçin' },
    { label: 'Model', value: selectedModel, onChange: setSelectedModel, items: models, disabled: !selectedMake, loading: loadingModels, placeholder: !selectedMake ? 'Önce marka seçin' : (loadingModels ? 'Yükleniyor...' : 'Model seçin') },
    { label: 'Kasa / Nesil', value: selectedGeneration, onChange: setSelectedGeneration, items: generations, disabled: !selectedModel, loading: loadingGenerations, placeholder: !selectedModel ? 'Önce model seçin' : (loadingGenerations ? 'Yükleniyor...' : 'Nesil seçin') },
    { label: 'Motor', value: selectedEngine, onChange: setSelectedEngine, items: engines, disabled: !selectedGeneration, loading: loadingEngines, placeholder: !selectedGeneration ? 'Önce nesil seçin' : (loadingEngines ? 'Yükleniyor...' : 'Motor seçin') },
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
      <ol
        className="flex items-center gap-0 mb-4 overflow-x-auto pb-1"
        aria-label="Araç seçim adımları"
      >
        {steps.map((step, i) => {
          const done = i < completedSteps;
          const active = i === completedSteps;
          return (
            <li key={i} className="flex items-center shrink-0" aria-current={active ? 'step' : undefined}>
              <span className="flex flex-col items-center gap-1">
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                    done
                      ? 'bg-brand text-brand-foreground'
                      : active
                      ? 'bg-brand text-white ring-2 ring-brand/30'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  aria-label={`Adım ${i + 1}${done ? ' tamamlandı' : active ? ' aktif' : ''}`}
                >
                  {done ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className={`text-[11px] font-medium ${active ? 'text-foreground' : done ? 'text-brand' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </span>
              {i < 3 && (
                <span
                  className={`mx-2 h-px w-8 shrink-0 mb-3.5 ${done ? 'bg-brand' : 'bg-muted-foreground/20'}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Select dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, i) => {
          const selectId = `vehicle-step-${i}`;
          const hasNoItems = !step.disabled && !step.loading && step.items.length === 0 && i > 0;
          return (
            <div key={i} className="flex flex-col gap-1">
              <label
                htmlFor={selectId}
                className="text-xs font-medium text-muted-foreground"
              >
                {step.label} <span className="text-brand" aria-hidden="true">*</span>
              </label>
              <select
                id={selectId}
                value={step.value}
                onChange={(e) => step.onChange(e.target.value)}
                disabled={step.disabled || step.loading}
                aria-label={`${step.label} seçin`}
                aria-busy={step.loading}
                className={selectClass}
              >
                <option value="">{step.placeholder}</option>
                {step.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {hasNoItems && (
                <p className="text-[11px] text-muted-foreground italic">
                  Bu seçim için veri bulunamadı
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleSearch}
          disabled={!selectedEngine || loading}
          aria-label={loading ? 'Parçalar yükleniyor' : 'Uyumlu parçaları göster'}
          className="bg-brand text-brand-foreground hover:bg-brand/90 px-6 cursor-pointer disabled:cursor-not-allowed"
        >
          <Car size={16} className="mr-2" aria-hidden="true" />
          {loading ? 'Yükleniyor...' : 'Parçaları Göster'}
        </Button>

        {showSaveButton && selectedEngine && isAuthenticated && (
          <Button
            variant="outline"
            onClick={handleSaveToGarage}
            disabled={saving}
            aria-label={saving ? 'Garaja kaydediliyor' : 'Aracı garaja kaydet'}
            className="cursor-pointer disabled:cursor-not-allowed"
          >
            {saving ? 'Kaydediliyor...' : 'Garaja Kaydet'}
          </Button>
        )}

        {showSaveButton && selectedEngine && !isAuthenticated && (
          <span className="text-xs text-muted-foreground">
            Garaja kaydetmek için{' '}
            <a href="/login" className="text-brand underline cursor-pointer hover:text-brand/80">giriş yapın</a>.
          </span>
        )}

        {saveMsg && (
          <span
            className="text-xs text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            {saveMsg}
          </span>
        )}
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
