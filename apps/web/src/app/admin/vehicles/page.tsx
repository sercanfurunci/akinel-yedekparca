'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronRight, ChevronDown, Plus, Pencil, Trash2, X,
  ArrowLeft, Search, Car, Layers, Zap, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type {
  VehicleMakeAdmin, VehicleModelAdmin, VehicleGenerationAdmin,
  VehicleEngineAdmin, AdminVehicleMakesResult, VehicleSearchResult,
  CreateGenerationData, CreateEngineData
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ── Types ──────────────────────────────────────────────────────────────────────

type Level = 'makes' | 'models' | 'generations' | 'engines';

interface Breadcrumb {
  label: string;
  level: Level;
  id?: string;
}

// ── Modal ──────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <h2 className="font-semibold text-sm">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X size={16} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ConfirmDelete({ message, onConfirm, onCancel, error }: {
  message: string; onConfirm: () => void; onCancel: () => void; error?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <h2 className="font-semibold">Silme Onayı</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        {error && <p className="text-sm text-destructive bg-destructive/10 rounded p-2">{error}</p>}
        {!error && (
          <div className="flex gap-3">
            <Button variant="destructive" className="flex-1" onClick={onConfirm}>Sil</Button>
            <Button variant="outline" className="flex-1" onClick={onCancel}>İptal</Button>
          </div>
        )}
        {error && (
          <Button variant="outline" className="w-full" onClick={onCancel}>Kapat</Button>
        )}
      </div>
    </div>
  );
}

// ── Search Results ──────────────────────────────────────────────────────────────

function SearchResults({ results, onNavigate }: {
  results: VehicleSearchResult;
  onNavigate: (type: string, id: string, makeId?: string) => void;
}) {
  const hasResults = results.makes.length > 0 || results.models.length > 0 || results.engines.length > 0;
  if (!hasResults) return <p className="text-xs text-muted-foreground p-3">Sonuç bulunamadı.</p>;

  return (
    <div className="py-1">
      {results.makes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground px-3 py-1 uppercase tracking-wide">Markalar</p>
          {results.makes.map((m) => (
            <button key={m.id} onClick={() => onNavigate('make', m.id)}
              className="w-full text-left px-3 py-2 hover:bg-muted/40 text-sm flex items-center gap-2">
              <Car size={12} className="text-muted-foreground shrink-0" />
              {m.name}
            </button>
          ))}
        </div>
      )}
      {results.models.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground px-3 py-1 uppercase tracking-wide">Modeller</p>
          {results.models.map((m) => (
            <button key={m.id} onClick={() => onNavigate('model', m.id, m.makeId)}
              className="w-full text-left px-3 py-2 hover:bg-muted/40 text-sm flex items-center gap-2">
              <Layers size={12} className="text-muted-foreground shrink-0" />
              <span>{m.name}</span>
              <span className="text-muted-foreground text-xs">({m.makeName})</span>
            </button>
          ))}
        </div>
      )}
      {results.engines.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground px-3 py-1 uppercase tracking-wide">Motorlar</p>
          {results.engines.map((e) => (
            <button key={e.id} onClick={() => onNavigate('engine', e.id, e.makeId)}
              className="w-full text-left px-3 py-2 hover:bg-muted/40 text-sm flex items-center gap-2">
              <Zap size={12} className="text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <div>{e.name}</div>
                <div className="text-xs text-muted-foreground truncate">{e.path}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AdminVehiclesPage() {
  const { accessToken, _hasHydrated } = useAuthStore();

  // Navigation state
  const [level, setLevel] = useState<Level>('makes');
  const [selectedMake, setSelectedMake] = useState<VehicleMakeAdmin | null>(null);
  const [selectedModel, setSelectedModel] = useState<VehicleModelAdmin | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<VehicleGenerationAdmin | null>(null);

  // Data
  const [makes, setMakes] = useState<VehicleMakeAdmin[]>([]);
  const [makesTotal, setMakesTotal] = useState(0);
  const [makesPage, setMakesPage] = useState(1);
  const [models, setModels] = useState<VehicleModelAdmin[]>([]);
  const [generations, setGenerations] = useState<VehicleGenerationAdmin[]>([]);
  const [engines, setEngines] = useState<VehicleEngineAdmin[]>([]);

  // Loading
  const [loading, setLoading] = useState(false);

  // Search
  const [makeSearch, setMakeSearch] = useState('');
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState<VehicleSearchResult | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Modal state
  type ModalType =
    | 'createMake' | 'editMake'
    | 'createModel' | 'editModel'
    | 'createGen' | 'editGen'
    | 'createEngine' | 'editEngine'
    | null;

  const [modal, setModal] = useState<ModalType>(null);
  const [editingItem, setEditingItem] = useState<VehicleMakeAdmin | VehicleModelAdmin | VehicleGenerationAdmin | VehicleEngineAdmin | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [fName, setFName] = useState('');
  const [fBodyType, setFBodyType] = useState('');
  const [fYearFrom, setFYearFrom] = useState('');
  const [fYearTo, setFYearTo] = useState('');
  const [fFuelType, setFFuelType] = useState('');
  const [fPowerHp, setFPowerHp] = useState('');
  const [fDisplacementCc, setFDisplacementCc] = useState('');
  const [fDisplacement, setFDisplacement] = useState('');
  const [fGearbox, setFGearbox] = useState('');
  const [fDrivetrain, setFDrivetrain] = useState('');
  const [fEngineCode, setFEngineCode] = useState('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string; type: Level } | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const PAGE_SIZE = 30;

  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchMakes = useCallback(async (page = 1, search = '') => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await api.admin.vehicles.getMakes(accessToken, { page, pageSize: PAGE_SIZE, search: search || undefined }) as AdminVehicleMakesResult;
      setMakes(res.items);
      setMakesTotal(res.total);
      setMakesPage(page);
    } catch {
      setMakes([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchModels = useCallback(async (makeId: string) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await api.admin.vehicles.getModels(makeId, accessToken) as VehicleModelAdmin[];
      setModels(res);
    } catch {
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchGenerations = useCallback(async (modelId: string) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await api.admin.vehicles.getGenerations(modelId, accessToken) as VehicleGenerationAdmin[];
      setGenerations(res);
    } catch {
      setGenerations([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchEngines = useCallback(async (generationId: string) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await api.admin.vehicles.getEngines(generationId, accessToken) as VehicleEngineAdmin[];
      setEngines(res);
    } catch {
      setEngines([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Initial load — wait for auth hydration
  useEffect(() => { if (_hasHydrated && accessToken) fetchMakes(1, ''); }, [_hasHydrated, accessToken, fetchMakes]);

  // Search debounce
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!globalSearch || globalSearch.length < 2) { setSearchResults(null); setShowSearchDropdown(false); return; }
    searchTimerRef.current = setTimeout(async () => {
      if (!accessToken) return;
      setSearchLoading(true);
      try {
        const res = await api.admin.vehicles.search(globalSearch, accessToken) as VehicleSearchResult;
        setSearchResults(res);
        setShowSearchDropdown(true);
      } catch {
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 350);
  }, [globalSearch, accessToken]);

  // Make search debounce — skip on initial render, only fire when user types
  const makeSearchInitRef = useRef(true);
  useEffect(() => {
    if (makeSearchInitRef.current) { makeSearchInitRef.current = false; return; }
    const timer = setTimeout(() => { fetchMakes(1, makeSearch); }, 300);
    return () => clearTimeout(timer);
  }, [makeSearch, fetchMakes]);

  // ── Navigation ────────────────────────────────────────────────────────────

  const navToMake = (make: VehicleMakeAdmin) => {
    setSelectedMake(make);
    setSelectedModel(null);
    setSelectedGeneration(null);
    setLevel('models');
    fetchModels(make.id);
  };

  const navToModel = (model: VehicleModelAdmin) => {
    setSelectedModel(model);
    setSelectedGeneration(null);
    setLevel('generations');
    fetchGenerations(model.id);
  };

  const navToGeneration = (gen: VehicleGenerationAdmin) => {
    setSelectedGeneration(gen);
    setLevel('engines');
    fetchEngines(gen.id);
  };

  const navBack = () => {
    if (level === 'engines') { setLevel('generations'); setSelectedGeneration(null); }
    else if (level === 'generations') { setLevel('models'); setSelectedModel(null); }
    else if (level === 'models') { setLevel('makes'); setSelectedMake(null); }
  };

  // Search navigation
  const handleSearchNavigate = async (type: string, id: string, makeId?: string) => {
    setShowSearchDropdown(false);
    setGlobalSearch('');
    if (!accessToken) return;

    if (type === 'make') {
      // Navigate to makes and highlight
      setLevel('makes');
      setSelectedMake(null);
      setSelectedModel(null);
      setSelectedGeneration(null);
      fetchMakes(1, '');
    } else if (type === 'model' && makeId) {
      // Navigate to models of this make
      try {
        const allMakes = await api.admin.vehicles.getMakes(accessToken, { pageSize: 100 }) as AdminVehicleMakesResult;
        const make = allMakes.items.find((m: VehicleMakeAdmin) => m.id === makeId);
        if (make) { navToMake(make); }
      } catch { /* ignore */ }
    }
    // Engine: would need full path traversal — for now just go to makes
  };

  // ── Modal helpers ─────────────────────────────────────────────────────────

  const closeModal = () => { setModal(null); setEditingItem(null); setFormError(''); };

  const openCreateMake = () => { setFName(''); setFormError(''); setModal('createMake'); };
  const openEditMake = (m: VehicleMakeAdmin) => { setEditingItem(m); setFName(m.name); setFormError(''); setModal('editMake'); };

  const openCreateModel = () => { setFName(''); setFormError(''); setModal('createModel'); };
  const openEditModel = (m: VehicleModelAdmin) => { setEditingItem(m); setFName(m.name); setFormError(''); setModal('editModel'); };

  const openCreateGen = () => { setFName(''); setFBodyType(''); setFYearFrom(''); setFYearTo(''); setFormError(''); setModal('createGen'); };
  const openEditGen = (g: VehicleGenerationAdmin) => {
    setEditingItem(g);
    setFName(g.name);
    setFBodyType(g.bodyType ?? '');
    setFYearFrom(g.yearFrom?.toString() ?? '');
    setFYearTo(g.yearTo?.toString() ?? '');
    setFormError('');
    setModal('editGen');
  };

  const openCreateEngine = () => {
    setFName(''); setFFuelType(''); setFPowerHp(''); setFDisplacementCc('');
    setFDisplacement(''); setFGearbox(''); setFDrivetrain(''); setFEngineCode('');
    setFYearFrom(''); setFYearTo('');
    setFormError(''); setModal('createEngine');
  };
  const openEditEngine = (e: VehicleEngineAdmin) => {
    setEditingItem(e);
    setFName(e.name);
    setFFuelType(e.fuelType ?? '');
    setFPowerHp(e.powerHp?.toString() ?? '');
    setFDisplacementCc(e.displacementCc?.toString() ?? '');
    setFDisplacement(e.displacement ?? '');
    setFGearbox(e.gearbox ?? '');
    setFDrivetrain(e.drivetrain ?? '');
    setFEngineCode(e.engineCode ?? '');
    setFYearFrom(e.yearFrom?.toString() ?? '');
    setFYearTo(e.yearTo?.toString() ?? '');
    setFormError('');
    setModal('editEngine');
  };

  // ── Save handlers ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!accessToken || !fName.trim()) { setFormError('Ad zorunludur.'); return; }
    setSaving(true); setFormError('');
    try {
      if (modal === 'createMake') {
        await api.admin.vehicles.createMake({ name: fName.trim() }, accessToken);
        closeModal(); fetchMakes(makesPage, makeSearch);
      } else if (modal === 'editMake' && editingItem) {
        await api.admin.vehicles.updateMake(editingItem.id, { name: fName.trim() }, accessToken);
        closeModal(); fetchMakes(makesPage, makeSearch);
      } else if (modal === 'createModel' && selectedMake) {
        await api.admin.vehicles.createModel(selectedMake.id, { name: fName.trim() }, accessToken);
        closeModal(); fetchModels(selectedMake.id);
      } else if (modal === 'editModel' && editingItem && selectedMake) {
        await api.admin.vehicles.updateModel(editingItem.id, { name: fName.trim() }, accessToken);
        closeModal(); fetchModels(selectedMake.id);
      } else if (modal === 'createGen' && selectedModel) {
        const data: CreateGenerationData = {
          name: fName.trim(),
          bodyType: fBodyType.trim() || undefined,
          yearFrom: fYearFrom ? parseInt(fYearFrom) : undefined,
          yearTo: fYearTo ? parseInt(fYearTo) : undefined,
        };
        await api.admin.vehicles.createGeneration(selectedModel.id, data, accessToken);
        closeModal(); fetchGenerations(selectedModel.id);
      } else if (modal === 'editGen' && editingItem && selectedModel) {
        const data: CreateGenerationData = {
          name: fName.trim(),
          bodyType: fBodyType.trim() || undefined,
          yearFrom: fYearFrom ? parseInt(fYearFrom) : undefined,
          yearTo: fYearTo ? parseInt(fYearTo) : undefined,
        };
        await api.admin.vehicles.updateGeneration(editingItem.id, data, accessToken);
        closeModal(); fetchGenerations(selectedModel.id);
      } else if (modal === 'createEngine' && selectedGeneration) {
        const data: CreateEngineData = {
          name: fName.trim(),
          fuelType: fFuelType.trim() || undefined,
          powerHp: fPowerHp ? parseInt(fPowerHp) : undefined,
          displacementCc: fDisplacementCc ? parseInt(fDisplacementCc) : undefined,
          displacement: fDisplacement.trim() || undefined,
          gearbox: fGearbox.trim() || undefined,
          drivetrain: fDrivetrain.trim() || undefined,
          engineCode: fEngineCode.trim() || undefined,
          yearFrom: fYearFrom ? parseInt(fYearFrom) : undefined,
          yearTo: fYearTo ? parseInt(fYearTo) : undefined,
        };
        await api.admin.vehicles.createEngine(selectedGeneration.id, data, accessToken);
        closeModal(); fetchEngines(selectedGeneration.id);
      } else if (modal === 'editEngine' && editingItem && selectedGeneration) {
        const data: CreateEngineData = {
          name: fName.trim(),
          fuelType: fFuelType.trim() || undefined,
          powerHp: fPowerHp ? parseInt(fPowerHp) : undefined,
          displacementCc: fDisplacementCc ? parseInt(fDisplacementCc) : undefined,
          displacement: fDisplacement.trim() || undefined,
          gearbox: fGearbox.trim() || undefined,
          drivetrain: fDrivetrain.trim() || undefined,
          engineCode: fEngineCode.trim() || undefined,
          yearFrom: fYearFrom ? parseInt(fYearFrom) : undefined,
          yearTo: fYearTo ? parseInt(fYearTo) : undefined,
        };
        await api.admin.vehicles.updateEngine(editingItem.id, data, accessToken);
        closeModal(); fetchEngines(selectedGeneration.id);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete handler ────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget || !accessToken) return;
    setDeleteError('');
    try {
      if (deleteTarget.type === 'makes') {
        await api.admin.vehicles.deleteMake(deleteTarget.id, accessToken);
        setDeleteTarget(null);
        fetchMakes(makesPage, makeSearch);
      } else if (deleteTarget.type === 'models') {
        await api.admin.vehicles.deleteModel(deleteTarget.id, accessToken);
        setDeleteTarget(null);
        if (selectedMake) fetchModels(selectedMake.id);
      } else if (deleteTarget.type === 'generations') {
        await api.admin.vehicles.deleteGeneration(deleteTarget.id, accessToken);
        setDeleteTarget(null);
        if (selectedModel) fetchGenerations(selectedModel.id);
      } else if (deleteTarget.type === 'engines') {
        await api.admin.vehicles.deleteEngine(deleteTarget.id, accessToken);
        setDeleteTarget(null);
        if (selectedGeneration) fetchEngines(selectedGeneration.id);
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Silinemedi.');
    }
  };

  // ── Breadcrumbs ───────────────────────────────────────────────────────────

  const breadcrumbs: Breadcrumb[] = [{ label: 'Markalar', level: 'makes' }];
  if (selectedMake) breadcrumbs.push({ label: selectedMake.name, level: 'models', id: selectedMake.id });
  if (selectedModel) breadcrumbs.push({ label: selectedModel.name, level: 'generations', id: selectedModel.id });
  if (selectedGeneration) breadcrumbs.push({ label: selectedGeneration.name, level: 'engines', id: selectedGeneration.id });

  // ── Render helpers ────────────────────────────────────────────────────────

  const totalPages = Math.ceil(makesTotal / PAGE_SIZE);

  const levelTitle = () => {
    if (level === 'makes') return 'Araç Markaları';
    if (level === 'models') return `${selectedMake?.name} — Modeller`;
    if (level === 'generations') return `${selectedModel?.name} — Kasa / Nesiller`;
    return `${selectedGeneration?.name} — Motorlar`;
  };

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold">Araç Kataloğu</h1>
        {/* Global search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            onFocus={() => searchResults && setShowSearchDropdown(true)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
            placeholder="Marka, model veya motor ara..."
            className="pl-8 text-sm h-9"
          />
          {searchLoading && (
            <RefreshCw size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin" />
          )}
          {showSearchDropdown && searchResults && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border rounded-xl shadow-xl z-40 max-h-80 overflow-y-auto">
              <SearchResults results={searchResults} onNavigate={handleSearchNavigate} />
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
        {breadcrumbs.map((bc, i) => (
          <span key={bc.level} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={12} />}
            <button
              onClick={() => {
                if (bc.level === 'makes') { setLevel('makes'); setSelectedMake(null); setSelectedModel(null); setSelectedGeneration(null); }
                else if (bc.level === 'models' && selectedMake) { setLevel('models'); setSelectedModel(null); setSelectedGeneration(null); fetchModels(selectedMake.id); }
                else if (bc.level === 'generations' && selectedModel) { setLevel('generations'); setSelectedGeneration(null); fetchGenerations(selectedModel.id); }
              }}
              className={i === breadcrumbs.length - 1 ? 'font-medium text-foreground' : 'hover:text-foreground transition-colors'}
            >
              {bc.label}
            </button>
          </span>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {/* Panel header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center justify-between px-4 py-3 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            {level !== 'makes' && (
              <button onClick={navBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={14} />
                <span>Geri</span>
              </button>
            )}
            <span className="text-sm font-medium">{levelTitle()}</span>
            {level === 'makes' && (
              <span className="text-xs text-muted-foreground">({makesTotal} marka)</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {level === 'makes' && (
              <>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <Input
                    value={makeSearch}
                    onChange={(e) => setMakeSearch(e.target.value)}
                    placeholder="Ara..."
                    className="pl-7 h-8 text-xs w-36"
                  />
                </div>
                <Button onClick={openCreateMake} size="sm" className="h-8 text-xs bg-brand text-brand-foreground hover:bg-brand/90">
                  <Plus size={12} className="mr-1" /> Marka Ekle
                </Button>
              </>
            )}
            {level === 'models' && (
              <Button onClick={openCreateModel} size="sm" className="h-8 text-xs bg-brand text-brand-foreground hover:bg-brand/90">
                <Plus size={12} className="mr-1" /> Model Ekle
              </Button>
            )}
            {level === 'generations' && (
              <Button onClick={openCreateGen} size="sm" className="h-8 text-xs bg-brand text-brand-foreground hover:bg-brand/90">
                <Plus size={12} className="mr-1" /> Nesil Ekle
              </Button>
            )}
            {level === 'engines' && (
              <Button onClick={openCreateEngine} size="sm" className="h-8 text-xs bg-brand text-brand-foreground hover:bg-brand/90">
                <Plus size={12} className="mr-1" /> Motor Ekle
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground text-center">Yükleniyor...</p>
        ) : (
          <>
            {/* Makes */}
            {level === 'makes' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-muted-foreground">
                    <tr>
                      <th className="text-left py-2.5 px-4 font-medium">Marka</th>
                      <th className="text-center py-2.5 px-4 font-medium hidden sm:table-cell">Model Sayısı</th>
                      <th className="text-right py-2.5 px-4 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {makes.length === 0 ? (
                      <tr><td colSpan={3} className="py-10 text-center text-muted-foreground text-sm">Marka bulunamadı.</td></tr>
                    ) : makes.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 px-4">
                          <button onClick={() => navToMake(m)} className="font-medium hover:text-brand transition-colors flex items-center gap-1.5">
                            <ChevronRight size={13} className="text-muted-foreground" />
                            {m.name}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-center text-muted-foreground hidden sm:table-cell">{m.modelCount}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditMake(m)}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted transition-colors" title="Düzenle">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => { setDeleteError(''); setDeleteTarget({ id: m.id, label: m.name, type: 'makes' }); }}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors" title="Sil">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Models */}
            {level === 'models' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-muted-foreground">
                    <tr>
                      <th className="text-left py-2.5 px-4 font-medium">Model</th>
                      <th className="text-center py-2.5 px-4 font-medium hidden sm:table-cell">Nesil Sayısı</th>
                      <th className="text-right py-2.5 px-4 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {models.length === 0 ? (
                      <tr><td colSpan={3} className="py-10 text-center text-muted-foreground text-sm">Model bulunamadı.</td></tr>
                    ) : models.map((m) => (
                      <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 px-4">
                          <button onClick={() => navToModel(m)} className="font-medium hover:text-brand transition-colors flex items-center gap-1.5">
                            <ChevronRight size={13} className="text-muted-foreground" />
                            {m.name}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-center text-muted-foreground hidden sm:table-cell">{m.generationCount}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditModel(m)}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted transition-colors" title="Düzenle">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => { setDeleteError(''); setDeleteTarget({ id: m.id, label: m.name, type: 'models' }); }}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors" title="Sil">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Generations */}
            {level === 'generations' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-muted-foreground">
                    <tr>
                      <th className="text-left py-2.5 px-4 font-medium">Nesil / Kasa</th>
                      <th className="text-left py-2.5 px-4 font-medium hidden sm:table-cell">Kasa Tipi</th>
                      <th className="text-left py-2.5 px-4 font-medium hidden sm:table-cell">Yıllar</th>
                      <th className="text-center py-2.5 px-4 font-medium hidden md:table-cell">Motor Sayısı</th>
                      <th className="text-right py-2.5 px-4 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {generations.length === 0 ? (
                      <tr><td colSpan={5} className="py-10 text-center text-muted-foreground text-sm">Nesil bulunamadı.</td></tr>
                    ) : generations.map((g) => (
                      <tr key={g.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 px-4">
                          <button onClick={() => navToGeneration(g)} className="font-medium hover:text-brand transition-colors flex items-center gap-1.5">
                            <ChevronRight size={13} className="text-muted-foreground" />
                            {g.name}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell">{g.bodyType || '—'}</td>
                        <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell text-xs">
                          {g.yearFrom ? `${g.yearFrom}${g.yearTo ? `–${g.yearTo}` : '–'}` : '—'}
                        </td>
                        <td className="py-2.5 px-4 text-center text-muted-foreground hidden md:table-cell">{g.engineCount}</td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditGen(g)}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted transition-colors" title="Düzenle">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => { setDeleteError(''); setDeleteTarget({ id: g.id, label: g.name, type: 'generations' }); }}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors" title="Sil">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Engines */}
            {level === 'engines' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 text-muted-foreground">
                    <tr>
                      <th className="text-left py-2.5 px-4 font-medium">Motor</th>
                      <th className="text-left py-2.5 px-4 font-medium hidden sm:table-cell">Yakıt</th>
                      <th className="text-left py-2.5 px-4 font-medium hidden sm:table-cell">Güç (HP)</th>
                      <th className="text-left py-2.5 px-4 font-medium hidden md:table-cell">Motor Kodu</th>
                      <th className="text-center py-2.5 px-4 font-medium hidden md:table-cell">Uyumluluk</th>
                      <th className="text-right py-2.5 px-4 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {engines.length === 0 ? (
                      <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">Motor bulunamadı.</td></tr>
                    ) : engines.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-2.5 px-4 font-medium">{e.name}</td>
                        <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell">{e.fuelType || '—'}</td>
                        <td className="py-2.5 px-4 text-muted-foreground hidden sm:table-cell">{e.powerHp ?? '—'}</td>
                        <td className="py-2.5 px-4 text-muted-foreground text-xs hidden md:table-cell">{e.engineCode || '—'}</td>
                        <td className="py-2.5 px-4 text-center text-muted-foreground hidden md:table-cell">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${e.compatCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'}`}>
                            {e.compatCount}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEditEngine(e)}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted transition-colors" title="Düzenle">
                              <Pencil size={13} />
                            </button>
                            <button onClick={() => { setDeleteError(''); setDeleteTarget({ id: e.id, label: e.name, type: 'engines' }); }}
                              className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-destructive transition-colors" title="Sil">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Pagination (makes only) */}
        {level === 'makes' && totalPages > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{makesTotal} markadan {(makesPage - 1) * PAGE_SIZE + 1}–{Math.min(makesPage * PAGE_SIZE, makesTotal)} gösteriliyor</span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={makesPage <= 1} onClick={() => fetchMakes(makesPage - 1, makeSearch)}>
                ‹ Önceki
              </Button>
              <span className="h-7 px-3 inline-flex items-center text-xs">{makesPage} / {totalPages}</span>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={makesPage >= totalPages} onClick={() => fetchMakes(makesPage + 1, makeSearch)}>
                Sonraki ›
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}

      {/* Make modals */}
      {(modal === 'createMake' || modal === 'editMake') && (
        <Modal title={modal === 'createMake' ? 'Yeni Marka Ekle' : 'Markayı Düzenle'} onClose={closeModal}>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="makeName">Marka Adı</Label>
              <Input id="makeName" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="ör: Toyota" autoFocus />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button variant="outline" onClick={closeModal}>İptal</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Model modals */}
      {(modal === 'createModel' || modal === 'editModel') && (
        <Modal title={modal === 'createModel' ? 'Yeni Model Ekle' : 'Modeli Düzenle'} onClose={closeModal}>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="modelName">Model Adı</Label>
              <Input id="modelName" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="ör: Corolla" autoFocus />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button variant="outline" onClick={closeModal}>İptal</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Generation modals */}
      {(modal === 'createGen' || modal === 'editGen') && (
        <Modal title={modal === 'createGen' ? 'Yeni Nesil / Kasa Ekle' : 'Nesil / Kasa Düzenle'} onClose={closeModal}>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="genName">Nesil Adı</Label>
              <Input id="genName" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="ör: Mk4 (E90)" autoFocus />
            </div>
            <div className="space-y-1">
              <Label htmlFor="genBody">Kasa Tipi (opsiyonel)</Label>
              <Input id="genBody" value={fBodyType} onChange={(e) => setFBodyType(e.target.value)} placeholder="ör: Sedan" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="genYearFrom">Başlangıç Yılı</Label>
                <Input id="genYearFrom" type="number" value={fYearFrom} onChange={(e) => setFYearFrom(e.target.value)} placeholder="2010" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="genYearTo">Bitiş Yılı</Label>
                <Input id="genYearTo" type="number" value={fYearTo} onChange={(e) => setFYearTo(e.target.value)} placeholder="2016" />
              </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button variant="outline" onClick={closeModal}>İptal</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Engine modals */}
      {(modal === 'createEngine' || modal === 'editEngine') && (
        <Modal title={modal === 'createEngine' ? 'Yeni Motor Ekle' : 'Motoru Düzenle'} onClose={closeModal}>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="engName">Motor Adı</Label>
              <Input id="engName" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="ör: 1.6 TDI 105 PS" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="engFuel">Yakıt Tipi</Label>
                <Input id="engFuel" value={fFuelType} onChange={(e) => setFFuelType(e.target.value)} placeholder="Gasoline / Diesel" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="engCode">Motor Kodu</Label>
                <Input id="engCode" value={fEngineCode} onChange={(e) => setFEngineCode(e.target.value)} placeholder="ör: CAYC" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="engHp">Güç (HP)</Label>
                <Input id="engHp" type="number" value={fPowerHp} onChange={(e) => setFPowerHp(e.target.value)} placeholder="150" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="engCc">Hacim (cc)</Label>
                <Input id="engCc" type="number" value={fDisplacementCc} onChange={(e) => setFDisplacementCc(e.target.value)} placeholder="1598" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="engDisp">Silindir Hacmi (metin)</Label>
              <Input id="engDisp" value={fDisplacement} onChange={(e) => setFDisplacement(e.target.value)} placeholder="ör: 1.6" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="engGearbox">Vites</Label>
                <Input id="engGearbox" value={fGearbox} onChange={(e) => setFGearbox(e.target.value)} placeholder="Manuel / Otomatik" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="engDrive">Çekiş</Label>
                <Input id="engDrive" value={fDrivetrain} onChange={(e) => setFDrivetrain(e.target.value)} placeholder="FWD / RWD / 4WD" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="engYF">Başlangıç Yılı</Label>
                <Input id="engYF" type="number" value={fYearFrom} onChange={(e) => setFYearFrom(e.target.value)} placeholder="2012" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="engYT">Bitiş Yılı</Label>
                <Input id="engYT" type="number" value={fYearTo} onChange={(e) => setFYearTo(e.target.value)} placeholder="2018" />
              </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSave} className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
              <Button variant="outline" onClick={closeModal}>İptal</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <ConfirmDelete
          message={`"${deleteTarget.label}" öğesini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          error={deleteError}
        />
      )}
    </div>
  );
}
