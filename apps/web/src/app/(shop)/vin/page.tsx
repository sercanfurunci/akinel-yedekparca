'use client';

import { useState } from 'react';
import { Search, Info, Clock } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/i;

export default function VinLookupPage() {
  const [vin, setVin] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isValid = VIN_REGEX.test(vin.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) setSubmitted(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'VIN Sorgulama' }]} />

      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2">VIN ile Araç Sorgulama</h1>
        <p className="text-muted-foreground mb-8">
          VIN numaranız ile aracınızı doğrudan tespit edin.
        </p>

        {/* Coming soon banner */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">Bu özellik yakında aktif olacaktır.</p>
            <p className="text-xs text-amber-700 mt-1">
              VIN ile araç sorgulama özelliği üzerinde çalışmaktayız. Kısa süre içinde kullanıma açılacaktır.
            </p>
          </div>
        </div>

        {/* VIN form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
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
                onChange={(e) => { setVin(e.target.value.toUpperCase()); setSubmitted(false); }}
                placeholder="WBA3A5C50DF000000"
                maxLength={17}
                className="flex h-12 w-full rounded-lg border border-input bg-background pl-9 pr-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors uppercase"
              />
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${vin.length === 17 ? (isValid ? 'text-green-600' : 'text-destructive') : 'text-muted-foreground'}`}>
                {vin.length}/17 karakter
              </span>
              {vin.length === 17 && !isValid && (
                <span className="text-xs text-destructive">Geçersiz VIN formatı</span>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={!isValid}
            className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
          >
            Sorgula
          </Button>
        </form>

        {submitted && (
          <div className="rounded-xl border bg-muted/30 p-5 mb-8 text-center">
            <Clock size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">Sorgunuz alındı</p>
            <p className="text-sm text-muted-foreground mt-1">
              VIN sorgulama servisi henüz aktif değil. Yakında buradan sonuçlarınızı görebileceksiniz.
            </p>
          </div>
        )}

        {/* Info box */}
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Info size={16} className="text-brand" />
            VIN Nedir?
          </div>
          <p className="text-sm text-muted-foreground">
            VIN (Vehicle Identification Number), araç kimlik numarası olarak bilinir. 17 karakterden oluşur ve
            aracınıza ait benzersiz bir tanımlayıcıdır.
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground text-xs">VIN numaranızı nerede bulabilirsiniz?</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Araç ruhsatınızın ön yüzünde</li>
              <li>Ön camın altında, sol köşede</li>
              <li>Sigorta belgesinde</li>
              <li>Motor bölmesinde plaka üzerinde</li>
            </ul>
          </div>
          <div className="bg-muted rounded-lg p-3 font-mono text-xs">
            Örnek: <span className="text-brand">WBA3A5C50DF000000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
