import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/', '/garage/'],
      },
    ],
    sitemap: 'https://akinelotoyedekparca.com.tr/sitemap.xml',
  };
}
