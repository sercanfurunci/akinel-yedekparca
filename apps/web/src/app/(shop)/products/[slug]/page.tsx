import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return { title: 'Ürün Bulunamadı' };
    const product = await res.json();
    return {
      title: `${product.name} — AKINEL OTO YEDEK PARÇA`,
      description: product.description
        ? product.description.slice(0, 160)
        : `${product.brandName} ${product.name} — OEM uyumlu yedek parça.`,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        images: product.primaryImageUrl ? [{ url: `${API_BASE}${product.primaryImageUrl}` }] : [],
      },
    };
  } catch {
    return { title: 'AKINEL OTO YEDEK PARÇA' };
  }
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductDetailClient params={params} />;
}
