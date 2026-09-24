'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
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

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <Search
        size={size === 'lg' ? 18 : 16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="OEM numarası, parça adı veya parça kodu…"
        className={cn(
          'w-full rounded-lg border border-input bg-background pl-10 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-colors placeholder:text-muted-foreground',
          size === 'lg' ? 'h-12 text-base pl-12 pr-20' : 'h-10'
        )}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-0.5 text-xs text-muted-foreground pointer-events-none">
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">⌘</kbd>
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[10px]">K</kbd>
      </span>
    </form>
  );
}
