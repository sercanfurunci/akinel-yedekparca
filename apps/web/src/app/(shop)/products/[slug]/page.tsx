import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';

async function fetchProduct(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/api/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: 'Ürün Bulunamadı' };
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
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        brand: { '@type': 'Brand', name: product.brandName },
        sku: product.sku ?? product.partNumber ?? undefined,
        description: product.description ?? undefined,
        image: product.primaryImageUrl ? `${API_BASE}${product.primaryImageUrl}` : undefined,
        offers: {
          '@type': 'Offer',
          priceCurrency: product.currency ?? 'TRY',
          price: product.salePrice ?? product.price,
          availability:
            product.stockStatus === 'InStock' || product.stockStatus === 'LowStock'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient params={params} />
    </>
  );
}
