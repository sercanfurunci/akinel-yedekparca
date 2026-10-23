'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { VehicleMake, VehicleModel, VehicleGeneration, VehicleEngine } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const selectClass =
  'flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

interface Props {
  existingEngineIds: string[];
  onAdd: (engineIds: string[]) => Promise<void>;
}

export function BulkCompatibilitySelector({ existingEngineIds, onAdd }: Props) {
  const [makes, setMakes] = useState<VehicleMake[]>([]);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [generations, setGenerations] = useState<VehicleGeneration[]>([]);
  const [engines, setEngines] = useState<VehicleEngine[]>([]);

  const [makeId, setMakeId] = useState('');
  const [modelId, setModelId] = useState('');
  const [genId, setGenId] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [loadingMakes, setLoadingMakes] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingGens, setLoadingGens] = useState(false);
  const [loadingEngines, setLoadingEngines] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.vehicles.makes()
      .then(d => setMakes(d as VehicleMake[]))
      .catch(() => {})
      .finally(() => setLoadingMakes(false));
  }, []);

  const handleMakeChange = (id: string) => {
    setMakeId(id);
    setModelId('');
    setGenId('');
    setModels([]);
    setGenerations([]);
    setEngines([]);
    setSelected(new Set());
    if (!id) return;
    setLoadingModels(true);
    api.vehicles.models(id)
      .then(d => setModels(d as VehicleModel[]))
      .catch(() => {})
      .finally(() => setLoadingModels(false));
  };

  const handleModelChange = (id: string) => {
    setModelId(id);
    setGenId('');
    setGenerations([]);
    setEngines([]);
    setSelected(new Set());
    if (!id) return;
    setLoadingGens(true);
    api.vehicles.generations(id)
      .then(d => setGenerations(d as VehicleGeneration[]))
      .catch(() => {})
      .finally(() => setLoadingGens(false));
  };

  const handleGenChange = (id: string) => {
    setGenId(id);
    setEngines([]);
    setSelected(new Set());
    if (!id) return;
    setLoadingEngines(true);
    api.vehicles.engines(id)
      .then(d => setEngines(d as VehicleEngine[]))
      .catch(() => {})
      .finally(() => setLoadingEngines(false));
  };

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const available = engines.filter(e => !existingEngineIds.includes(e.id));
    setSelected(new Set(available.map(e => e.id)));
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setAdding(true);
    try {
      await onAdd([...selected]);
      setSelected(new Set());
    } finally {
      setAdding(false);
    }
  };

  const engineLabel = (e: VehicleEngine) => {
    const parts: string[] = [e.name];
    if (e.fuelType) parts.push(e.fuelType);
    if (e.powerHp) parts.push(`${e.powerHp}hp`);
    return parts.join(' · ');
  };

  const availableEngines = engines.filter(e => !existingEngineIds.includes(e.id));
  const alreadyAdded = engines.filter(e => existingEngineIds.includes(e.id));

  return (
    <div className="border rounded-xl p-4 bg-muted/20 space-y-4">
      {/* Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Marka</label>
          <select
            className={selectClass}
            value={makeId}
            onChange={e => handleMakeChange(e.target.value)}
            disabled={loadingMakes}
          >
            <option value="">{loadingMakes ? 'Yükleniyor…' : 'Marka seçin'}</option>
            {makes.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Model</label>
          <select
            className={selectClass}
            value={modelId}
            onChange={e => handleModelChange(e.target.value)}
            disabled={!makeId || loadingModels}
          >
            <option value="">{loadingModels ? 'Yükleniyor…' : 'Model seçin'}</option>
            {models.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Nesil</label>
          <select
            className={selectClass}
            value={genId}
            onChange={e => handleGenChange(e.target.value)}
            disabled={!modelId || loadingGens}
          >
            <option value="">{loadingGens ? 'Yükleniyor…' : 'Nesil seçin'}</option>
            {generations.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}{g.yearFrom ? ` (${g.yearFrom}${g.yearTo ? `–${g.yearTo}` : '+'})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Engine list */}
      {genId && (
        loadingEngines ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 size={14} className="animate-spin" /> Motorlar yükleniyor…
          </div>
        ) : engines.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Bu nesil için motor bulunamadı.</p>
        ) : (
          <div className="space-y-2">
            <div className="border rounded-lg divide-y overflow-hidden bg-background">
              {availableEngines.map(e => (
                <label
                  key={e.id}
                  className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(e.id)}
                    onChange={() => toggle(e.id)}
                    className="accent-brand h-4 w-4 shrink-0"
                  />
                  <span className="text-sm">{engineLabel(e)}</span>
                </label>
              ))}
              {alreadyAdded.map(e => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 px-3 py-2.5 opacity-50 cursor-not-allowed"
                >
                  <input type="checkbox" checked disabled className="h-4 w-4 shrink-0" />
                  <span className="text-sm line-through">{engineLabel(e)}</span>
                  <span className="text-xs text-muted-foreground ml-auto">Ekli</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={selectAll}
                disabled={availableEngines.length === 0}
                className="text-xs text-brand hover:underline disabled:opacity-40 disabled:no-underline"
              >
                Tümünü Seç ({availableEngines.length})
              </button>
              {selected.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Seçimi Temizle
                </button>
              )}
              <Button
                type="button"
                size="sm"
                disabled={selected.size === 0 || adding}
                onClick={handleAdd}
                className="ml-auto bg-brand text-brand-foreground hover:bg-brand/90"
              >
                {adding && <Loader2 size={13} className="mr-1 animate-spin" />}
                {selected.size > 0 ? `${selected.size} Motor Ekle` : 'Motor Ekle'}
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
