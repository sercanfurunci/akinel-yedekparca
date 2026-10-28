'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Hash } from 'lucide-react';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';

const examples = ['1J0698151B', 'AV6J2K021AA', '34116778138', '77364-0K012'];

export default function OemPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = query.trim().replace(/\s+/g, '');
    if (normalized) router.push(`/oem/${encodeURIComponent(normalized)}`);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <Breadcrumbs items={[{ label: 'Ana Sayfa', href: '/' }, { label: 'OEM Ara' }]} />

      <div className="mt-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Hash size={20} className="text-brand" />
          <h1 className="text-2xl font-bold">OEM Numarası ile Parça Ara</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Orijinal ekipman üretici numarasını girin — tam eşleşen ürünleri ve uyumlu alternatifleri bulun.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn: 1J0698151B"
            className="w-full h-11 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 transition-colors"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <Button type="submit" className="h-11 px-6" disabled={!query.trim()}>
          Ara
        </Button>
      </form>

      <div className="mt-6">
        <p className="text-xs text-muted-foreground mb-2">Örnek numaralar:</p>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => router.push(`/oem/${encodeURIComponent(ex)}`)}
              className="text-xs font-mono px-3 py-1.5 rounded-md border border-border hover:border-brand hover:text-brand transition-colors bg-muted/40 cursor-pointer"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
