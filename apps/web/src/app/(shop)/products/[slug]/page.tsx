import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';
const SITE_URL = 'https://akinelotoyedekparca.com.tr';

function absoluteImageUrl(path: string | undefined): string | null {
  if (!path) return null;
  if (API_BASE.startsWith('http://localhost')) return null;
  return `${API_BASE}${path}`;
}

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
  const description = product.description
    ? product.description.slice(0, 160)
    : `${product.brandName} ${product.name} — OEM uyumlu yedek parça.`;
  const ogImage = absoluteImageUrl(product.primaryImageUrl);
  return {
    title: `${product.name} — AKINEL OTO YEDEK PARÇA`,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: product.name,
      description,
      url: `/products/${slug}`,
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: product.name,
      description,
      images: ogImage ? [ogImage] : [],
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
        url: `${SITE_URL}/products/${slug}`,
        brand: { '@type': 'Brand', name: product.brandName },
        sku: product.sku ?? product.partNumber ?? undefined,
        description: product.description ?? undefined,
        image: absoluteImageUrl(product.primaryImageUrl) ?? undefined,
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

  const breadcrumbLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Ürünler', item: `${SITE_URL}/products` },
          { '@type': 'ListItem', position: 3, name: product.name, item: `${SITE_URL}/products/${slug}` },
        ],
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
      {breadcrumbLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      )}
      <ProductDetailClient params={params} />
    </>
  );
}
