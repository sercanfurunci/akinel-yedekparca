import type { MetadataRoute } from 'next';

const SITE_URL = 'https://akinelotoyedekparca.com.tr';

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

    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${base}/api/products?pageSize=500&pageNumber=1`, { next: { revalidate: 3600 } }),
      fetch(`${base}/api/categories`, { next: { revalidate: 3600 } }),
    ]);

    const productPages: MetadataRoute.Sitemap = productsRes.ok
      ? (await productsRes.json()).items?.map((p: { slug: string; updatedAt?: string }) => ({
          url: `${SITE_URL}/products/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })) ?? []
      : [];

    const categoryPages: MetadataRoute.Sitemap = categoriesRes.ok
      ? (await categoriesRes.json()).map?.((c: { slug: string; updatedAt?: string }) => ({
          url: `${SITE_URL}/kategori/${c.slug}`,
          lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.75,
        })) ?? []
      : [];

    if (productPages.length > 0 || categoryPages.length > 0) {
      return [...staticPages, ...categoryPages, ...productPages];
    }
  } catch {
    // return static pages only if API is unavailable
  }

  return staticPages;
}
