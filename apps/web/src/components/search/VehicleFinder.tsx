'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useVehicleStore } from '@/store/vehicleStore';
import { useAuthStore } from '@/store/authStore';
import type { VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine, VehicleContext } from '@/lib/types';
import { Car, Check, X, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

type StepId = 'marka' | 'seri' | 'yil' | 'kasa' | 'sanziman' | 'motor';
const STEPS: { id: StepId; label: string; title: string }[] = [
  { id: 'marka',    label: 'Marka',    title: 'Marka Seçiniz' },
  { id: 'seri',     label: 'Seri',     title: 'Seri Seçiniz' },
  { id: 'yil',      label: 'Yıl',      title: 'Yıl Seçiniz' },
  { id: 'kasa',     label: 'Model',    title: 'Model Seçiniz' },
  { id: 'sanziman', label: 'Şanzıman', title: 'Şanzıman Seçiniz' },
  { id: 'motor',    label: 'Motor',    title: 'Motor Seçiniz' },
];

interface VehicleFinderProps {
  onVehicleSelected?: (ctx: VehicleContext) => void;
  showSaveButton?: boolean;
  triggerClassName?: string;
  triggerLabel?: string;
  // Controlled mode — omit to use built-in trigger button
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialMake?: VehicleMake;
}

export function VehicleFinder({
  onVehicleSelected,
  showSaveButton = false,
  triggerClassName,
  triggerLabel,
  open: controlledOpen,
  onOpenChange,
  initialMake,
}: VehicleFinderProps) {
  const router = useRouter();
  const { setSelectedVehicle, selectedVehicle } = useVehicleStore();
  const { accessToken } = useAuthStore();

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (isControlled) onOpenChange?.(val);
    else setInternalOpen(val);
  };

  const [currentStep, setCurrentStep] = useState<StepId>('marka');
  const [filter, setFilter] = useState('');

  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [allGenerations, setAllGenerations] = useState<VehicleGeneration[]>([]);
  const [engines, setEngines] = useState<VehicleEngine[]>([]);

  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<VehicleGeneration | null>(null);
  const [selectedGearbox, setSelectedGearbox] = useState<string | null>(null);
  const [selectedEngine, setSelectedEngine] = useState<VehicleEngine | null>(null);

  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Load makes once on first open
  useEffect(() => {
    if (open && makes.length === 0) {
      api.vehicles.makes().then(d => setMakes(d as VehicleMake[])).catch(() => {});
    }
  }, [open, makes.length]);

  // When opened with an initialMake, pre-select it and jump to seri step
  useEffect(() => {
    if (open && initialMake) {
      setSelectedMake(initialMake);
      setSelectedModel(null); setSelectedYear(null); setSelectedGeneration(null);
      setSelectedGearbox(null); setSelectedEngine(null);
      setModels([]); setAllGenerations([]); setEngines([]);
      setFilter(''); setCurrentStep('seri');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialMake?.id]);

  useEffect(() => {
    if (!selectedMake) return;
    setLoading(true);
    api.vehicles.models(selectedMake.id)
      .then(d => setModels(d as VehicleModel[]))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, [selectedMake]);

  useEffect(() => {
    if (!selectedModel) return;
    setLoading(true);
    api.vehicles.generations(selectedModel.id)
      .then(d => setAllGenerations(d as VehicleGeneration[]))
      .catch(() => setAllGenerations([]))
      .finally(() => setLoading(false));
  }, [selectedModel]);

  useEffect(() => {
    if (!selectedGeneration) return;
    setLoading(true);
    api.vehicles.engines(selectedGeneration.id)
      .then(d => setEngines(d as VehicleEngine[]))
      .catch(() => setEngines([]))
      .finally(() => setLoading(false));
  }, [selectedGeneration]);

  // Derive unique gearboxes from engines for the selected generation
  const availableGearboxes = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const e of engines) {
      const gb = e.gearbox?.trim();
      if (gb && !seen.has(gb)) { seen.add(gb); result.push(gb); }
    }
    return result;
  }, [engines]);

  // Filter engines by selected gearbox
  const filteredEngines = useMemo(() => {
    if (!selectedGearbox) return engines;
    return engines.filter(e => e.gearbox?.trim() === selectedGearbox);
  }, [engines, selectedGearbox]);

  // Derive available years from generations
  const availableYears = useMemo(() => {
    const now = new Date().getFullYear();
    const yearSet = new Set<number>();
    for (const gen of allGenerations) {
      const from = gen.yearFrom ?? 1980;
      const to = gen.yearTo ?? now;
      for (let y = from; y <= to; y++) yearSet.add(y);
    }
    return Array.from(yearSet).sort((a, b) => b - a);
  }, [allGenerations]);

  // Filter generations by selected year
  const filteredGenerations = useMemo(() => {
    if (!selectedYear) return allGenerations;
    const now = new Date().getFullYear();
    return allGenerations.filter(g => {
      const from = g.yearFrom ?? 0;
      const to = g.yearTo ?? now;
      return from <= selectedYear && selectedYear <= to;
    });
  }, [allGenerations, selectedYear]);

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  const getStepValue = (stepId: StepId): string => {
    switch (stepId) {
      case 'marka':    return selectedMake?.name ?? '';
      case 'seri':     return selectedModel?.name ?? '';
      case 'yil':      return selectedYear ? String(selectedYear) : '';
      case 'kasa':     return selectedGeneration?.name ?? '';
      case 'sanziman': return selectedGearbox ?? '';
      case 'motor':    return selectedEngine?.name ?? '';
    }
  };

  const reset = () => {
    setSelectedMake(null); setSelectedModel(null); setSelectedYear(null);
    setSelectedGeneration(null); setSelectedGearbox(null); setSelectedEngine(null);
    setModels([]); setAllGenerations([]); setEngines([]);
    setCurrentStep('marka'); setFilter(''); setShowSummary(false);
  };

  const pickMake = (make: VehicleMake) => {
    setSelectedMake(make);
    setSelectedModel(null); setSelectedYear(null); setSelectedGeneration(null);
    setSelectedGearbox(null); setSelectedEngine(null);
    setModels([]); setAllGenerations([]); setEngines([]);
    setFilter(''); setCurrentStep('seri');
  };

  const pickModel = (model: VehicleModel) => {
    setSelectedModel(model);
    setSelectedYear(null); setSelectedGeneration(null); setSelectedGearbox(null); setSelectedEngine(null);
    setAllGenerations([]); setEngines([]);
    setFilter(''); setCurrentStep('yil');
  };

  const pickYear = (year: number) => {
    setSelectedYear(year);
    setSelectedGeneration(null); setSelectedGearbox(null); setSelectedEngine(null); setEngines([]);
    setFilter(''); setCurrentStep('kasa');
  };

  const pickGeneration = (gen: VehicleGeneration) => {
    setSelectedGeneration(gen);
    setSelectedGearbox(null); setSelectedEngine(null); setEngines([]);
    setFilter(''); setCurrentStep('sanziman');
  };

  const pickGearbox = (gb: string) => {
    setSelectedGearbox(gb);
    setSelectedEngine(null);
    setFilter(''); setCurrentStep('motor');
  };

  const pickEngine = (engine: VehicleEngine) => {
    setSelectedEngine(engine);
    setShowSummary(true);
  };

  const handleConfirm = async () => {
    if (!selectedEngine) return;
    setConfirming(true);
    try {
      const ctx = await api.vehicles.context(selectedEngine.id) as VehicleContext;
      setSelectedVehicle(ctx);
      analytics.vehicleSelected({
        make: ctx.makeName, model: ctx.modelName,
        generation: ctx.generationName, engine: ctx.engineName,
      });
      setOpen(false);
      if (onVehicleSelected) {
        onVehicleSelected(ctx);
      } else {
        router.push(`/products?vehicleEngineId=${selectedEngine.id}`);
      }
    } catch {
      // ignore
    } finally {
      setConfirming(false);
    }
  };

  const handleSave = async () => {
    if (!selectedEngine || !accessToken) return;
    setSaving(true);
    try { await api.garage.add({ vehicleEngineId: selectedEngine.id }, accessToken); }
    catch {} finally { setSaving(false); }
  };

  const q = filter.toLowerCase();

  const popularMakes = makes.filter(m => m.isPopular);
  const otherMakes = makes.filter(m => !m.isPopular);

  const renderMakeGrid = (list: VehicleMake[]) =>
    list.filter(m => m.name.toLowerCase().includes(q)).map(make => (
      <button key={make.id} onClick={() => pickMake(make)}
        className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:border-brand hover:bg-brand/5 transition-colors text-left group">
        {make.logoUrl
          ? <img src={make.logoUrl} alt={make.name} className="w-8 h-8 object-contain shrink-0" />
          : <Car size={20} className="text-muted-foreground shrink-0" />}
        <span className="text-sm font-medium truncate group-hover:text-brand transition-colors">{make.name}</span>
      </button>
    ));

  const renderContent = () => {
    switch (currentStep) {
      case 'marka':
        if (makes.length === 0 && !loading) return <p className="text-sm text-muted-foreground text-center py-8">Marka yükleniyor...</p>;
        return (
          <div className="space-y-4">
            {popularMakes.length > 0 && !q && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Popüler Markalar</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{renderMakeGrid(popularMakes)}</div>
                </div>
                {otherMakes.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Diğer Markalar</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{renderMakeGrid(otherMakes)}</div>
                  </div>
                )}
              </>
            )}
            {(q || popularMakes.length === 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">{renderMakeGrid(makes)}</div>
            )}
          </div>
        );

      case 'seri':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {models.filter(m => m.name.toLowerCase().includes(q)).map(model => (
              <button key={model.id} onClick={() => pickModel(model)}
                className="px-3 py-3 rounded-xl border border-border hover:border-brand hover:bg-brand/5 transition-colors text-left group">
                <span className="text-sm font-medium group-hover:text-brand transition-colors">{model.name}</span>
              </button>
            ))}
            {models.length === 0 && !loading && <p className="text-sm text-muted-foreground text-center py-8 col-span-3">Model bulunamadı.</p>}
          </div>
        );

      case 'yil':
        return (
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {availableYears.filter(y => String(y).includes(q)).map(year => (
              <button key={year} onClick={() => pickYear(year)}
                className="py-3 rounded-xl border border-border text-sm font-semibold hover:border-brand hover:bg-brand/5 hover:text-brand transition-colors text-center">
                {year}
              </button>
            ))}
            {availableYears.length === 0 && !loading && <p className="text-sm text-muted-foreground col-span-6 text-center py-8">Yıl bilgisi bulunamadı.</p>}
          </div>
        );

      case 'kasa':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredGenerations.filter(g => g.name.toLowerCase().includes(q)).map(gen => (
              <button key={gen.id} onClick={() => pickGeneration(gen)}
                className={cn(
                  'px-3 py-3 rounded-xl border transition-colors text-left group',
                  selectedGeneration?.id === gen.id
                    ? 'border-brand bg-brand/5'
                    : 'border-border hover:border-brand hover:bg-brand/5'
                )}>
                <p className="text-sm font-medium group-hover:text-brand transition-colors leading-snug">{gen.name}</p>
                {gen.bodyType && <p className="text-xs text-muted-foreground mt-0.5">{gen.bodyType}</p>}
              </button>
            ))}
            {filteredGenerations.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-3">Bu yıl için kasa bilgisi bulunamadı.</p>
            )}
          </div>
        );

      case 'sanziman':
        return (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableGearboxes.filter(gb => gb.toLowerCase().includes(q)).map(gb => (
              <button key={gb} onClick={() => pickGearbox(gb)}
                className={cn(
                  'px-3 py-3 rounded-xl border transition-colors text-left group',
                  selectedGearbox === gb
                    ? 'border-brand bg-brand/5'
                    : 'border-border hover:border-brand hover:bg-brand/5'
                )}>
                <span className="text-sm font-medium group-hover:text-brand transition-colors">{gb}</span>
              </button>
            ))}
            {availableGearboxes.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-3">Şanzıman bilgisi bulunamadı.</p>
            )}
          </div>
        );

      case 'motor':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredEngines.filter(e => e.name.toLowerCase().includes(q)).map(engine => {
              const parts = [
                engine.fuelType,
                engine.displacement,
                engine.powerHp ? `${engine.powerHp} Hp` : null,
              ].filter(Boolean);
              return (
                <button key={engine.id} onClick={() => pickEngine(engine)}
                  className={cn(
                    'flex items-start justify-between px-4 py-3 rounded-xl border transition-colors text-left group',
                    selectedEngine?.id === engine.id
                      ? 'border-brand bg-brand/5'
                      : 'border-border hover:border-brand hover:bg-brand/5'
                  )}>
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-medium group-hover:text-brand transition-colors">{engine.name}</p>
                    {parts.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">{parts.join(' · ')}</p>
                    )}
                  </div>
                  <Check size={15} className={cn('shrink-0 mt-0.5', selectedEngine?.id === engine.id ? 'text-brand' : 'invisible')} />
                </button>
              );
            })}
            {filteredEngines.length === 0 && !loading && <p className="text-sm text-muted-foreground text-center py-8 col-span-2">Motor bilgisi bulunamadı.</p>}
          </div>
        );
    }
  };

  const currentStepMeta = STEPS.find(s => s.id === currentStep)!;

  return (
    <>
      {/* Trigger button — hidden in controlled mode */}
      {!isControlled && (
        <button
          onClick={() => setOpen(true)}
          className={triggerClassName ?? "inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand/90 active:scale-[0.98] transition-all shadow-sm"}
        >
          <Car size={16} />
          {triggerLabel ?? (selectedVehicle ? 'Aracı Değiştir' : 'Araç Seçin')}
        </button>
      )}

      {/* Selected vehicle chip */}
      {!isControlled && selectedVehicle && (
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border bg-brand/5 px-4 py-2 text-sm">
          <Check size={14} className="text-brand shrink-0" />
          <span className="font-medium">{selectedVehicle.displayLabel}</span>
          <button onClick={() => setOpen(true)} className="ml-1 text-xs text-brand hover:underline">
            Değiştir
          </button>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] max-h-[680px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b shrink-0">
              <div>
                <h2 className="font-bold text-base">Aracınıza Uyumlu Parçaları Seçin</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aracınıza ait marka, model gibi detayları girerek araç seçin ve uyumlu parçaları bulun.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-4 p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {showSummary && selectedEngine ? (
              <SummaryScreen
                make={selectedMake}
                model={selectedModel}
                generation={selectedGeneration}
                engine={selectedEngine}
                onBack={() => { setShowSummary(false); setCurrentStep('motor'); }}
                onSave={accessToken ? handleSave : undefined}
                onConfirm={handleConfirm}
                saving={saving}
                confirming={confirming}
                onReset={reset}
              />
            ) : (
              <>
                <div className="flex flex-1 min-h-0 overflow-hidden">
                  {/* Left sidebar — steps */}
                  <div className="hidden sm:flex w-48 shrink-0 border-r flex-col py-3 px-2 gap-0.5 overflow-y-auto">
                    {STEPS.map((step, i) => {
                      const val = getStepValue(step.id);
                      const done = i < stepIndex;
                      const active = step.id === currentStep;
                      const reachable = i <= stepIndex;
                      return (
                        <button
                          key={step.id}
                          disabled={!reachable}
                          onClick={() => { if (reachable) { setCurrentStep(step.id); setFilter(''); } }}
                          className={cn(
                            'flex items-start gap-2.5 p-2.5 rounded-lg text-left transition-colors w-full',
                            active ? 'bg-brand/10' : reachable ? 'hover:bg-muted/60 cursor-pointer' : 'opacity-40 cursor-not-allowed'
                          )}
                        >
                          <span className={cn(
                            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5',
                            done ? 'bg-brand text-white' : active ? 'bg-brand text-white' : 'bg-muted text-muted-foreground'
                          )}>
                            {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className={cn('text-xs font-semibold leading-tight', active ? 'text-brand' : 'text-foreground')}>
                              {step.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {val || (active ? 'Seçiliyor' : 'Seçilmedi')}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Right content area */}
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    {/* Content header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b gap-3 shrink-0">
                      <h3 className="font-semibold text-sm">{currentStepMeta.title}</h3>
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <input
                          value={filter}
                          onChange={e => setFilter(e.target.value)}
                          placeholder="Filtrele"
                          className="pl-7 pr-3 py-1.5 text-xs rounded-lg border bg-background focus:outline-none focus:ring-1 focus:ring-brand/40 w-32 sm:w-40"
                        />
                      </div>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {loading ? (
                        <div className="flex justify-center py-10">
                          <Loader2 size={22} className="animate-spin text-brand" />
                        </div>
                      ) : (
                        renderContent()
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t bg-muted/20 shrink-0">
                  <button
                    onClick={reset}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60"
                  >
                    Sıfırla
                  </button>
                  <div className="flex items-center gap-2">
                    {showSaveButton && selectedEngine && accessToken && (
                      <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
                        {saving ? 'Kaydediliyor...' : 'Garaja Kaydet'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={handleConfirm}
                      disabled={!selectedEngine || confirming}
                      className="bg-brand text-white hover:bg-brand/90 px-5"
                    >
                      {confirming ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                      Aracı Seç
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

interface SummaryScreenProps {
  make: VehicleMake | null;
  model: VehicleModel | null;
  generation: VehicleGeneration | null;
  engine: VehicleEngine;
  onBack: () => void;
  onSave?: () => void;
  onConfirm: () => void;
  onReset: () => void;
  saving: boolean;
  confirming: boolean;
}

function SummaryScreen({ make, model, generation, engine, onBack, onSave, onConfirm, onReset, saving, confirming }: SummaryScreenProps) {
  const engineParts = [
    engine.fuelType,
    engine.displacement,
    engine.powerKw ? `${engine.powerKw} Kw` : null,
    engine.powerHp ? `${engine.powerHp} Hp` : null,
  ].filter(Boolean).join(' - ');

  const yearLabel = generation?.yearFrom
    ? `${generation.yearFrom}${generation.yearTo ? ` - ${generation.yearTo}` : ''} Model`
    : null;

  return (
    <>
      {/* Summary body */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 py-8 text-center gap-6">
        <h2 className="text-2xl font-bold tracking-wide text-brand uppercase">Aracınız Hazır !</h2>

        {/* Vehicle image */}
        <div className="relative w-full max-w-sm aspect-[4/3] flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
          {generation?.imageUrl ? (
            <img
              src={generation.imageUrl}
              alt={generation.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Car size={80} className="text-gray-200" />
          )}
          {/* decorative arrows — only shown when image exists */}
          {generation?.imageUrl && (
            <>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors" aria-hidden>
                <ChevronLeft size={16} />
              </button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-colors" aria-hidden>
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Vehicle name */}
        <div>
          <p className="text-lg font-bold text-foreground">
            <span className="text-brand">{make?.name}</span> {model?.name}{generation ? ` ${generation.name}` : ''}
          </p>
          {yearLabel && <p className="text-sm text-muted-foreground mt-0.5">{yearLabel}</p>}
        </div>

        {/* Specs */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm">
          {engine.gearbox && (
            <span>
              <span className="text-muted-foreground">Şanzıman: </span>
              <span className="font-semibold">{engine.gearbox}</span>
            </span>
          )}
          {engineParts && (
            <span>
              <span className="text-muted-foreground">Motor: </span>
              <span className="font-semibold">{engineParts}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60 flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            Geri
          </button>
          <button
            onClick={onReset}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/60"
          >
            Sıfırla
          </button>
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <Button variant="outline" size="sm" onClick={onSave} disabled={saving}>
              {saving ? 'Kaydediliyor...' : 'Garaja Ekle'}
            </Button>
          )}
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={confirming}
            className="bg-brand text-white hover:bg-brand/90 px-5"
          >
            {confirming ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
            Aracı Seç
          </Button>
        </div>
      </div>
    </>
  );
}
