import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/api';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string>>;
}

async function fetchCategory(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/api/categories/${encodeURIComponent(slug)}`, {
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
  const category = await fetchCategory(slug);

  if (!category) {
    return { title: 'Kategori Bulunamadı — AKINEL OTO YEDEK PARÇA' };
  }

  const title = `${category.name} Yedek Parça Darıca Kocaeli — AKINEL OTO YEDEK PARÇA`;
  const description = `${category.name} kategorisinde otomobil yedek parçaları. Darıca, Kocaeli, Gebze, Tuzla ve çevre ilçelere hizmet. Akinel Oto Yedek Parça'da OEM uyumlu ürünler.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/kategori/${slug}`,
    },
    openGraph: { title, description },
  };
}

export default async function KategoriPage({ params }: Props) {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  if (!category) {
    notFound();
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://akinelotoyedekparca.com.tr' },
      { '@type': 'ListItem', position: 2, name: 'Ürünler', item: 'https://akinelotoyedekparca.com.tr/products' },
      { '@type': 'ListItem', position: 3, name: category.name, item: `https://akinelotoyedekparca.com.tr/kategori/${slug}` },
    ],
  };

  // Render the same UI as /category/[slug] with JSON-LD structured data
  // We use a dynamic import to reuse the existing CategoryPage component
  const { default: CategoryPageContent } = await import('../../category/[slug]/page');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <CategoryPageContent params={params} />
    </>
  );
}
