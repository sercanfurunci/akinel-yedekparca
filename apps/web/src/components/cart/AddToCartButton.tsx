'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

interface Props {
  productId: string;
  quantity?: number;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AddToCartButton({ productId, quantity = 1, disabled = false, className, size = 'sm' }: Props) {
  const { addItem } = useCartStore();
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || state !== 'idle') return;
    setState('loading');
    try {
      await addItem(productId, quantity);
      setState('success');
      setTimeout(() => setState('idle'), 1800);
    } catch {
      setState('idle');
    }
  };

  const sizeClass = size === 'lg' ? 'h-11 px-6 text-sm' : size === 'md' ? 'h-9 px-4 text-sm' : 'h-8 px-3 text-xs';

  const label = disabled
    ? 'Stok Yok'
    : state === 'loading'
    ? 'Ekleniyor...'
    : state === 'success'
    ? 'Eklendi!'
    : 'Sepete Ekle';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || state === 'loading'}
      aria-label={disabled ? 'Ürün stokta yok' : state === 'success' ? 'Sepete eklendi' : 'Sepete ekle'}
      aria-busy={state === 'loading'}
      title={disabled ? 'Bu ürün şu anda stokta yok' : 'Sepete ekle'}
      className={cn(
        'inline-flex w-full items-center justify-center gap-1.5 rounded-lg font-medium transition-all',
        sizeClass,
        disabled
          ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
          : state === 'success'
          ? 'bg-green-600 text-white cursor-default'
          : state === 'loading'
          ? 'bg-brand/80 text-brand-foreground cursor-wait'
          : 'bg-brand text-brand-foreground hover:bg-brand/90 active:scale-[0.98] cursor-pointer',
        className
      )}
    >
      {state === 'loading' ? (
        <Loader2 size={13} className="animate-spin" aria-hidden="true" />
      ) : state === 'success' ? (
        <Check size={13} aria-hidden="true" />
      ) : (
        <ShoppingCart size={13} aria-hidden="true" />
      )}
      {label}
    </button>
  );
}
