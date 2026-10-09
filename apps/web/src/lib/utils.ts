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

const CDN = 'https://cdn.akinelotoyedekparca.com.tr/file/akinel-uploads';
const OLD_S3 = 'https://akinel-uploads.s3.eu-central-003.backblazeb2.com';
const OLD_CDN = 'https://cdn.akinelotoyedekparca.com.tr/uploads/';

export function getImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  // Normalize old S3 URLs to CDN
  if (trimmed.startsWith(OLD_S3)) return CDN + trimmed.slice(OLD_S3.length);
  // Fix broken CDN URLs missing /file/akinel-uploads prefix
  if (trimmed.startsWith(OLD_CDN)) return CDN + '/uploads/' + trimmed.slice(OLD_CDN.length);
  if (trimmed.startsWith('http')) return trimmed;
  return `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100'}${trimmed}`;
}

export function stockStatusColor(status: string | number): string {
  switch (status) {
    case 'InStock':
    case 2:
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'LowStock':
    case 1:
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'OutOfStock':
    case 0:
      return 'bg-gray-100 text-gray-600 border border-gray-200';
    default:
      return 'bg-gray-100 text-gray-500 border border-gray-200';
  }
}
