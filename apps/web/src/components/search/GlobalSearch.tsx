'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface SuggestResult {
  products: Array<{ name: string; slug: string; brand: string }>;
  brands: Array<{ name: string; slug: string }>;
  categories: Array<{ name: string; slug: string }>;
}

interface GlobalSearchProps {
  defaultValue?: string;
  className?: string;
  size?: 'default' | 'lg';
  autoFocus?: boolean;
}

export function GlobalSearch({ defaultValue = '', className, size = 'default', autoFocus }: GlobalSearchProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<SuggestResult | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (q.trim().length < 2) {
      setSuggestions(null);
      setOpen(false);
      return;
    }
    api.search.suggest(q)
      .then((data) => {
        const d = data as { products: Array<{ name: string; slug: string; brandName: string }>; brands: Array<{ name: string; slug: string }>; categories: Array<{ name: string; slug: string }> };
        const normalized: SuggestResult = {
          products: (d.products ?? []).map(p => ({ name: p.name, slug: p.slug, brand: p.brandName ?? '' })),
          brands: d.brands ?? [],
          categories: d.categories ?? [],
        };
        setSuggestions(normalized);
        const total = normalized.products.length + normalized.brands.length + normalized.categories.length;
        setOpen(total > 0);
        setActiveIndex(-1);
      })
      .catch(() => {
        setSuggestions(null);
        setOpen(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(() => fetchSuggestions(val), 250);
    setDebounceTimer(t);
  };

  // Build flat list of navigatable items for keyboard nav
  const flatItems: Array<{ type: 'product' | 'brand' | 'category'; href: string; label: string }> = [];
  if (suggestions) {
    suggestions.products.forEach(p => flatItems.push({ type: 'product', href: `/products/${p.slug}`, label: p.name }));
    suggestions.brands.forEach(b => flatItems.push({ type: 'brand', href: `/products?brandId=${b.slug}`, label: b.name }));
    suggestions.categories.forEach(c => flatItems.push({ type: 'category', href: `/products?categoryId=${c.slug}`, label: c.name }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
      inputRef.current?.blur();
      return;
    }
    if (!open || flatItems.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) {
        setOpen(false);
        router.push(item.href);
      }
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions(null);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form
        onSubmit={handleSubmit}
        role="search"
        aria-label="Ürün arama"
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
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions && flatItems.length > 0) setOpen(true);
          }}
          placeholder="OEM numarası, parça adı veya parça kodu…"
          aria-label="Arama"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
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

      {/* Autocomplete dropdown */}
      {open && suggestions && flatItems.length > 0 && (
        <div
          role="listbox"
          aria-label="Arama önerileri"
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-border bg-white shadow-xl overflow-hidden max-h-[80vh] overflow-y-auto"
        >
          {suggestions.products.length > 0 && (
            <div>
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/40">
                Ürünler
              </p>
              {suggestions.products.map((product, i) => {
                const globalIdx = i;
                const isActive = activeIndex === globalIdx;
                return (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    onClick={() => setOpen(false)}
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors',
                      isActive && 'bg-muted/80'
                    )}
                  >
                    <Search size={13} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="flex-1 min-w-0">
                      <span className="block truncate font-medium">{product.name}</span>
                      {product.brand && (
                        <span className="text-xs text-muted-foreground">{product.brand}</span>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {suggestions.brands.length > 0 && (
            <div>
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/40">
                Markalar
              </p>
              {suggestions.brands.map((brand, i) => {
                const globalIdx = suggestions.products.length + i;
                const isActive = activeIndex === globalIdx;
                return (
                  <Link
                    key={brand.slug}
                    href={`/marka/${brand.slug}`}
                    onClick={() => setOpen(false)}
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors',
                      isActive && 'bg-muted/80'
                    )}
                  >
                    <Search size={13} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="truncate font-medium">{brand.name}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {suggestions.categories.length > 0 && (
            <div>
              <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border bg-muted/40">
                Kategoriler
              </p>
              {suggestions.categories.map((cat, i) => {
                const globalIdx = suggestions.products.length + suggestions.brands.length + i;
                const isActive = activeIndex === globalIdx;
                return (
                  <Link
                    key={cat.slug}
                    href={`/kategori/${cat.slug}`}
                    onClick={() => setOpen(false)}
                    role="option"
                    aria-selected={isActive}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors',
                      isActive && 'bg-muted/80'
                    )}
                  >
                    <Search size={13} className="text-muted-foreground shrink-0" aria-hidden="true" />
                    <span className="truncate font-medium">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
