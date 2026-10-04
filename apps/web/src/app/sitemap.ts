import type { MetadataRoute } from 'next';

export const revalidate = 3600;

const SITE_URL = 'https://akinelotoyedekparca.com.tr';
const PAGE_SIZE = 100;

type ProductSlugItem = { slug: string; updatedAt?: string };
type CategorySlugItem = { slug: string; updatedAt?: string };

async function fetchAllProductSlugs(base: string): Promise<ProductSlugItem[]> {
  const items: ProductSlugItem[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${base}/api/products?pageSize=${PAGE_SIZE}&pageNumber=${page}`,
      { cache: 'no-store' },
    );
    if (!res.ok) break;
    const data = await res.json();
    const batch: ProductSlugItem[] = data.items ?? [];
    items.push(...batch);
    const totalCount: number = data.totalCount ?? 0;
    if (items.length >= totalCount || batch.length === 0) break;
    page++;
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/brands`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/vehicle`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/sss`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';

    const [productSlugs, categoriesRes] = await Promise.all([
      fetchAllProductSlugs(base),
      fetch(`${base}/api/categories`, { cache: 'no-store' }),
    ]);

    const productPages: MetadataRoute.Sitemap = productSlugs.map((p) => ({
      url: `${SITE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    const categoryPages: MetadataRoute.Sitemap = categoriesRes.ok
      ? ((await categoriesRes.json()) as CategorySlugItem[]).map((c) => ({
          url: `${SITE_URL}/kategori/${c.slug}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        }))
      : [];

    if (productPages.length > 0 || categoryPages.length > 0) {
      return [...staticPages, ...categoryPages, ...productPages];
    }
  } catch {
    // return static pages only if API is unavailable
  }

  return staticPages;
}
