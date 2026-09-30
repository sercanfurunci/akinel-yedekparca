import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { API_BASE } from '@/lib/api';

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

  // Redirect to /products filtered by brand ID
  redirect(`/products?brandId=${brand.id}`);
}
