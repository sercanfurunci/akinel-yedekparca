'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  defaultValue?: string;
  className?: string;
  size?: 'default' | 'lg';
  autoFocus?: boolean;
}

export function GlobalSearch({ defaultValue = '', className, size = 'default', autoFocus }: GlobalSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Ürün arama"
      className={cn('relative w-full', className)}
    >
      <label htmlFor="global-search-input" className="sr-only">
        Ürün, OEM numarası veya parça kodu ara
      </label>
      <Search
        size={size === 'lg' ? 18 : 16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
      <input
        id="global-search-input"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="OEM numarası, parça adı veya parça kodu…"
        aria-label="Arama"
        className={cn(
          'w-full rounded-lg border border-input bg-background pl-10 pr-20 text-sm cursor-text focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors placeholder:text-muted-foreground',
          size === 'lg' ? 'h-12 text-base pl-12 pr-24' : 'h-10'
        )}
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Aramayı temizle"
          title="Temizle"
          className={cn(
            'absolute top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer',
            size === 'lg' ? 'right-16 h-6 w-6' : 'right-14 h-5 w-5'
          )}
        >
          <X size={size === 'lg' ? 14 : 12} />
        </button>
      )}
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 text-xs text-muted-foreground pointer-events-none"
        aria-hidden="true"
      >
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">⌘</kbd>
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">K</kbd>
      </span>
    </form>
  );
}
