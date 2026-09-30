'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Info, CheckCircle2, AlertCircle, Loader2, Car, ChevronRight } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useVehicleStore } from '@/store/vehicleStore';
import type { VinDecodeResult, InternalVehicleMatch, VehicleContext } from '@/lib/types';
import Link from 'next/link';

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;
const INVALID_CHARS = /[IOQ]/i;

function validateVin(vin: string): string | null {
  if (vin.length === 0) return null;
  if (vin.length < 17) return 'VIN 17 karakter olmalıdır.';
  if (vin.length > 17) return 'VIN 17 karakter olmalıdır.';
  if (INVALID_CHARS.test(vin)) return 'VIN geçersiz karakter içeriyor (I, O, Q kullanılamaz).';
  if (!VIN_REGEX.test(vin)) return 'Geçersiz VIN formatı.';
  return null;
}

function fuelTypeToTurkish(fuelType?: string): string {
  if (!fuelType) return '';
  const map: Record<string, string> = {
    Diesel: 'Dizel',
    Gasoline: 'Benzin',
    Electric: 'Elektrik',
    Hybrid: 'Hibrit',
    LPG: 'LPG',
  };
  return map[fuelType] ?? fuelType;
}

type PageState = 'input' | 'loading' | 'result' | 'error';

export default function VinLookupPage() {
  const router = useRouter();
  const { setSelectedVehicle } = useVehicleStore();

  const [vin, setVin] = useState('');
  const [pageState, setPageState] = useState<PageState>('input');
  const [result, setResult] = useState<VinDecodeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<InternalVehicleMatch | null>(null);

  const vinError = validateVin(vin);
  const isValid = vin.length === 17 && !vinError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setPageState('loading');
    setResult(null);
    setErrorMsg('');
    setSelectedMatch(null);

    try {
      const data = await api.vehicles.decodeVin(vin) as VinDecodeResult;
      setResult(data);
      setPageState('result');
      // Auto-select if single internal vehicle match
      if (data.internalVehicle) {
        setSelectedMatch(data.internalVehicle);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('404') || msg.toLowerCase().includes('bulunamadı')) {
        setErrorMsg('Bu VIN numarası için araç bilgisi bulunamadı. Lütfen listeden seçin.');
      } else {
        setErrorMsg('VIN sorgusu yapılamadı. İnternet bağlantınızı kontrol edin veya listeden seçin.');
      }
      setPageState('error');
    }
  };

  const handleConfirm = async (match: InternalVehicleMatch) => {
    try {
      const ctx = await api.vehicles.context(match.engineId) as VehicleContext;
      setSelectedVehicle(ctx);
      router.push(`/products?vehicleEngineId=${match.engineId}`);
    } catch {
      // fallback: still navigate
      router.push(`/products?vehicleEngineId=${match.engineId}`);
    }
  };

  const handleReset = () => {
    setPageState('input');
    setResult(null);
    setErrorMsg('');
    setSelectedMatch(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'VIN Sorgulama' }]} />

      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-4">
            <Car size={28} />
          </div>
          <h1 className="text-2xl font-bold mb-2">VIN / Şasi ile Aracınızı Bulun</h1>
          <p className="text-muted-foreground text-sm">
            17 karakterli VIN numaranızı girerek aracınıza uygun yedek parçaları bulun.
          </p>
        </div>

        {/* ── Input State ───────────────────────────────── */}
        {(pageState === 'input' || pageState === 'loading') && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label htmlFor="vin" className="block text-sm font-medium mb-2">
                VIN Numarası
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="vin"
                  type="text"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase().replace(/[\s-]/g, ''))}
                  placeholder="WBA3A5C50DF000000"
                  maxLength={17}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={pageState === 'loading'}
                  className="flex h-12 w-full rounded-lg border border-input bg-background pl-9 pr-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors uppercase disabled:opacity-60"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className={`text-xs ${vin.length === 17 ? (isValid ? 'text-green-600' : 'text-destructive') : 'text-muted-foreground'}`}>
                  {vin.length}/17 karakter
                </span>
                {vin.length > 0 && vinError && (
                  <span className="text-xs text-destructive">{vinError}</span>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isValid || pageState === 'loading'}
              className="w-full h-11 bg-brand text-brand-foreground hover:bg-brand/90"
            >
              {pageState === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Araç bilgileri alınıyor...
                </>
              ) : (
                <>
                  <Search size={16} className="mr-2" />
                  Aracımı Bul
                </>
              )}
            </Button>
          </form>
        )}

        {/* ── Result State ──────────────────────────────── */}
        {pageState === 'result' && result && (
          <div className="space-y-4 mb-6">
            {/* Success header */}
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30 p-4">
              <CheckCircle2 size={20} className="text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-green-800 dark:text-green-300">Araç Bilgileri Alındı</p>
                <p className="text-xs text-green-700 dark:text-green-400 font-mono mt-0.5">{result.vin}</p>
              </div>
            </div>

            {/* Vehicle details card */}
            <div className="rounded-xl border bg-card p-5 space-y-3">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Araç Bilgileri</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {result.make && (
                  <>
                    <dt className="text-muted-foreground">Marka</dt>
                    <dd className="font-medium">{result.make}</dd>
                  </>
                )}
                {result.model && (
                  <>
                    <dt className="text-muted-foreground">Model</dt>
                    <dd className="font-medium">{result.model}</dd>
                  </>
                )}
                {result.year && (
                  <>
                    <dt className="text-muted-foreground">Yıl</dt>
                    <dd className="font-medium">{result.year}</dd>
                  </>
                )}
                {result.displacement && (
                  <>
                    <dt className="text-muted-foreground">Motor Hacmi</dt>
                    <dd className="font-medium">{result.displacement}L</dd>
                  </>
                )}
                {result.fuelType && (
                  <>
                    <dt className="text-muted-foreground">Yakıt</dt>
                    <dd className="font-medium">{fuelTypeToTurkish(result.fuelType)}</dd>
                  </>
                )}
                {result.bodyStyle && (
                  <>
                    <dt className="text-muted-foreground">Kasa</dt>
                    <dd className="font-medium">{result.bodyStyle}</dd>
                  </>
                )}
                {result.engineCode && (
                  <>
                    <dt className="text-muted-foreground">Motor Kodu</dt>
                    <dd className="font-mono font-medium">{result.engineCode}</dd>
                  </>
                )}
              </dl>
            </div>

            {/* Internal vehicle match — single match */}
            {result.internalVehicle && (
              <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 space-y-3">
                <p className="text-xs font-medium text-brand uppercase tracking-wide">Katalogda Eşleşme Bulundu</p>
                <p className="font-semibold text-sm">
                  {result.internalVehicle.makeDisplay} {result.internalVehicle.modelDisplay} — {result.internalVehicle.generationDisplay}
                </p>
                <p className="text-sm text-muted-foreground">{result.internalVehicle.engineDisplay}</p>
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90"
                    onClick={() => handleConfirm(result.internalVehicle!)}
                  >
                    <CheckCircle2 size={15} className="mr-1.5" />
                    Bu Araçla Devam Et
                  </Button>
                </div>
              </div>
            )}

            {/* Multiple possible matches */}
            {result.possibleMatches.length > 0 && (
              <div className="rounded-xl border bg-card p-4 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Olası Eşleşmeler — Birini Seçin</p>
                <div className="space-y-2">
                  {result.possibleMatches.map((m) => (
                    <button
                      key={m.engineId}
                      onClick={() => setSelectedMatch(m)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors ${
                        selectedMatch?.engineId === m.engineId
                          ? 'border-brand bg-brand/5'
                          : 'border-border hover:border-brand/50 hover:bg-muted/40'
                      }`}
                    >
                      <p className="font-medium text-sm">{m.makeDisplay} {m.modelDisplay} — {m.generationDisplay}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.engineDisplay}</p>
                    </button>
                  ))}
                </div>
                {selectedMatch && (
                  <Button
                    className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
                    onClick={() => handleConfirm(selectedMatch)}
                  >
                    <CheckCircle2 size={15} className="mr-1.5" />
                    Seçili Araçla Devam Et
                  </Button>
                )}
              </div>
            )}

            {/* No internal match */}
            {!result.internalVehicle && result.possibleMatches.length === 0 && (
              <div className="rounded-xl border bg-muted/30 p-4 text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Araç katalogumuzda eşleşme bulunamadı. Lütfen listeden seçin.
                </p>
                <Link
                  href="/vehicle"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                >
                  Araç Listesinden Seç <ChevronRight size={14} />
                </Link>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Farklı VIN Sorgula
              </Button>
              <Link
                href="/vehicle"
                className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-muted transition-colors"
              >
                Araç Listesinden Seç
              </Link>
            </div>
          </div>
        )}

        {/* ── Error State ───────────────────────────────── */}
        {pageState === 'error' && (
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <AlertCircle size={18} className="text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{errorMsg}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Tekrar Dene
              </Button>
              <Link
                href="/vehicle"
                className="flex-1 inline-flex h-9 items-center justify-center rounded-lg bg-brand text-brand-foreground hover:bg-brand/90 px-4 text-sm font-medium transition-colors"
              >
                Araç Listesinden Seç
              </Link>
            </div>
          </div>
        )}

        {/* ── Info box ──────────────────────────────────── */}
        {pageState === 'input' && (
          <>
            <p className="text-center text-sm text-muted-foreground mb-6">
              ya da{' '}
              <Link href="/vehicle" className="text-brand hover:underline font-medium">
                Aracımı listeden seçmek istiyorum →
              </Link>
            </p>

            <div className="rounded-xl border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Info size={16} className="text-brand" />
                VIN Numaranızı Nereden Bulabilirsiniz?
              </div>
              <p className="text-sm text-muted-foreground">
                VIN (Vehicle Identification Number), 17 karakterden oluşan araç kimlik numarasıdır.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>Araç ruhsatınızın ön yüzünde</li>
                <li>Ön camın sol alt köşesinde (sürücü tarafı)</li>
                <li>Sigorta belgesinde</li>
                <li>Motor bölmesinde plaka üzerinde</li>
              </ul>
              <div className="bg-muted rounded-lg p-3 font-mono text-xs">
                Örnek: <span className="text-brand">WBA3A5C50DF000000</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
