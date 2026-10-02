import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import BrandPageContent from './BrandPageContent';

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchBrand(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/api/brands/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<{ id: string; name: string; slug: string }>;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await fetchBrand(slug);

  if (!brand) {
    return { title: 'Marka Bulunamadı — AKINEL OTO YEDEK PARÇA' };
  }

  const title = `${brand.name} Yedek Parça — AKINEL OTO YEDEK PARÇA`;
  const description = `${brand.name} markalı otomobil yedek parçaları. Orijinal ve muadil parça seçenekleri.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/marka/${slug}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function MarkaPage({ params }: Props) {
  const { slug } = await params;
  const brand = await fetchBrand(slug);

  if (!brand) {
    notFound();
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://akinelotoyedekparca.com.tr' },
      { '@type': 'ListItem', position: 2, name: 'Markalar', item: 'https://akinelotoyedekparca.com.tr/brands' },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `https://akinelotoyedekparca.com.tr/marka/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BrandPageContent brandId={brand.id} brandName={brand.name} slug={slug} />
    </>
  );
}
