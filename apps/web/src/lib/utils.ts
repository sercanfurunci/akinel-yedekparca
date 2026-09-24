import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(price);
}

export function stockStatusLabel(status: string | number): string {
  const s = typeof status === 'number' ? status : status;
  switch (s) {
    case 'InStock':
    case 2:
      return 'Stokta';
    case 'LowStock':
    case 1:
      return 'Az Stok';
    case 'OutOfStock':
    case 0:
      return 'Tükendi';
    default:
      return String(status);
  }
}

export function getImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100'}${url}`;
}

export function stockStatusColor(status: string | number): string {
  switch (status) {
    case 'InStock':
    case 2:
      return 'bg-green-100 text-green-800';
    case 'LowStock':
    case 1:
      return 'bg-yellow-100 text-yellow-800';
    case 'OutOfStock':
    case 0:
      return 'bg-gray-100 text-gray-500';
    default:
      return 'bg-gray-100 text-gray-500';
  }
}
