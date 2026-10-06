'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Search, Car } from 'lucide-react';
import { api } from '@/lib/api';
import type { VehicleMake, VehicleModel, VehicleGeneration } from '@/lib/types';
import { useVehicleStore } from '@/store/vehicleStore';

function MakeInitial({ name }: { name: string }) {
  return (
    <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
      {name.charAt(0)}
    </span>
  );
}

export default function VehiclePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const makeId = searchParams.get('makeId');
  const modelId = searchParams.get('modelId');

  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [generations, setGenerations] = useState<VehicleGeneration[]>([]);
  const [selectedMake, setSelectedMake] = useState<VehicleMake | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const { setSelectedVehicle } = useVehicleStore();

  // Load all makes once
  useEffect(() => {
    api.vehicles.makes().then((d) => setMakes(d as VehicleMake[])).catch(() => {});
  }, []);

  // Load models when makeId changes
  useEffect(() => {
    if (!makeId) { setModels([]); setSelectedMake(null); return; }
    setLoading(true);
    setSearch('');
    api.vehicles.models(makeId)
      .then((d) => setModels(d as VehicleModel[]))
      .catch(() => setModels([]))
      .finally(() => setLoading(false));
  }, [makeId]);

  // Load generations when modelId changes
  useEffect(() => {
    if (!modelId) { setGenerations([]); setSelectedModel(null); return; }
    setLoading(true);
    setSearch('');
    api.vehicles.generations(modelId)
      .then((d) => setGenerations(d as VehicleGeneration[]))
      .catch(() => setGenerations([]))
      .finally(() => setLoading(false));
  }, [modelId]);

  // Keep selectedMake/Model in sync
  useEffect(() => {
    if (makeId && makes.length > 0) {
      setSelectedMake(makes.find((m) => m.id === makeId) ?? null);
    }
  }, [makeId, makes]);

  useEffect(() => {
    if (modelId && models.length > 0) {
      setSelectedModel(models.find((m) => m.id === modelId) ?? null);
    }
  }, [modelId, models]);

  // Group makes alphabetically
  const groupedMakes = useMemo(() => {
    const filtered = search
      ? makes.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
      : makes;
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    const groups: Record<string, VehicleMake[]> = {};
    for (const make of sorted) {
      const letter = make.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(make);
    }
    return groups;
  }, [makes, search]);

  const filteredModels = useMemo(() => {
    if (!search) return models;
    return models.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [models, search]);

  const handleGenerationSelect = async (gen: VehicleGeneration) => {
    try {
      const engines = await api.vehicles.engines(gen.id) as Array<{ id: string; name: string }>;
      if (engines.length > 0) {
        const ctx = await api.vehicles.context(engines[0].id) as {
          engineId: string; makeName: string; modelName: string;
          generationName: string; engineName: string; displayLabel: string;
        };
        setSelectedVehicle({
          engineId: ctx.engineId,
          makeName: ctx.makeName,
          modelName: ctx.modelName,
          generationName: ctx.generationName,
          engineName: ctx.engineName,
          displayLabel: ctx.displayLabel,
        });
        router.push(`/products?vehicleEngineId=${ctx.engineId}`);
      } else {
        const label = `${selectedMake?.name ?? ''} ${selectedModel?.name ?? ''} ${gen.name}`.trim();
        setSelectedVehicle({
          engineId: '',
          makeName: selectedMake?.name ?? '',
          modelName: selectedModel?.name ?? '',
          generationName: gen.name,
          engineName: '',
          displayLabel: label,
        });
        router.push(`/products?q=${encodeURIComponent(label)}`);
      }
    } catch {
      router.push('/products');
    }
  };

  // ── VIEW: Generations ──────────────────────────────────────────
  if (makeId && modelId) {
    return (
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/vehicle" className="hover:text-foreground transition-colors">Tüm Araçlar</Link>
          <ChevronRight size={14} />
          <Link href={`/vehicle?makeId=${makeId}`} className="hover:text-foreground transition-colors">
            {selectedMake?.name ?? '...'}
          </Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{selectedModel?.name ?? '...'}</span>
        </nav>

        <div className="flex items-center gap-3 mb-6">
          {selectedMake?.logoUrl ? (
            <img src={selectedMake.logoUrl} alt="" className="h-10 w-10 object-contain" />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold">{selectedMake?.name} {selectedModel?.name}</h1>
            <p className="text-sm text-muted-foreground">Nesil / Kasa seçin</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : generations.length === 0 ? (
          <p className="text-muted-foreground">Bu model için nesil bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {generations.map((gen) => (
              <button
                key={gen.id}
                onClick={() => handleGenerationSelect(gen)}
                className="flex flex-col gap-1 p-4 rounded-xl border border-border bg-white hover:border-brand hover:shadow-md hover:bg-brand/5 transition-all text-left cursor-pointer group"
              >
                <span className="font-semibold text-sm text-foreground group-hover:text-brand transition-colors">
                  {gen.name}
                </span>
                {(gen.yearFrom || gen.yearTo) && (
                  <span className="text-xs text-muted-foreground">
                    {gen.yearFrom ?? '?'} – {gen.yearTo ?? 'günümüz'}
                  </span>
                )}
                {gen.bodyType && (
                  <span className="text-xs text-muted-foreground">{gen.bodyType}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── VIEW: Models ───────────────────────────────────────────────
  if (makeId) {
    return (
      <div className="container mx-auto px-4 max-w-6xl py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/vehicle" className="hover:text-foreground transition-colors">Tüm Araçlar</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{selectedMake?.name ?? '...'}</span>
        </nav>

        <div className="flex items-center gap-3 mb-6">
          {selectedMake?.logoUrl ? (
            <img src={selectedMake.logoUrl} alt="" className="h-12 w-12 object-contain" />
          ) : null}
          <div>
            <h1 className="text-2xl font-bold">{selectedMake?.name ?? 'Modeller'}</h1>
            <p className="text-sm text-muted-foreground">Model seçin</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Model ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredModels.length === 0 ? (
          <p className="text-muted-foreground">Model bulunamadı.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filteredModels.map((model) => (
              <Link
                key={model.id}
                href={`/vehicle?makeId=${makeId}&modelId=${model.id}`}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-white hover:border-brand hover:shadow-md hover:bg-brand/5 transition-all group"
              >
                {model.imageUrl ? (
                  <img src={model.imageUrl} alt="" className="w-10 h-8 object-contain shrink-0" />
                ) : (
                  <Car size={18} className="shrink-0 text-gray-300 group-hover:text-brand transition-colors" />
                )}
                <span className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors leading-tight">
                  {model.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── VIEW: All Makes ────────────────────────────────────────────
  const letters = Object.keys(groupedMakes).sort((a, b) => a.localeCompare(b, 'tr'));

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      <h1 className="text-2xl font-bold mb-1">Tüm Araç Modelleri</h1>
      <p className="text-sm text-muted-foreground mb-6">Markanızı seçin, uyumlu parçaları keşfedin.</p>

      {/* Search */}
      <div className="relative mb-8 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Araç ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-white"
        />
      </div>

      {makes.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : letters.length === 0 ? (
        <p className="text-muted-foreground">Araç bulunamadı.</p>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => (
            <div key={letter}>
              {/* Letter anchor */}
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white text-sm font-bold shrink-0">
                  {letter}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {groupedMakes[letter].map((make) => (
                  <Link
                    key={make.id}
                    href={`/vehicle?makeId=${make.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-white hover:border-brand hover:shadow-md hover:bg-brand/5 transition-all group"
                  >
                    {make.logoUrl ? (
                      <img src={make.logoUrl} alt="" className="w-10 h-10 object-contain shrink-0" />
                    ) : (
                      <MakeInitial name={make.name} />
                    )}
                    <span className="text-sm font-medium text-gray-700 group-hover:text-brand transition-colors leading-tight">
                      {make.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
