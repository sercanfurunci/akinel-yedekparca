import type { Metadata } from 'next';
import './globals.css';
import { PublicShell } from '@/components/layout/PublicShell';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import { SentryProvider } from '@/components/SentryProvider';
import type { BusinessSettings } from '@/lib/types';

const SITE_URL = 'https://akinelotoyedekparca.com.tr';
const SITE_NAME = 'AKINEL OTO YEDEK PARÇA';
const DESCRIPTION = 'Akinel Oto Yedek Parça — Darıca, Kocaeli. Gebze, Tuzla, Pendik, İzmit ve çevre ilçelere hizmet. OEM numarası veya araç seçimiyle hızlı yedek parça arama. Fren, filtre, süspansiyon ve daha fazlası.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Darıca Kocaeli`, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: [
    // Marka
    'akinel', 'akinel yedek parça', 'akinel oto yedek parça', 'akinel oto', 'akinel parça',
    // Genel
    'yedek parça', 'oto yedek parça', 'otomotiv yedek parça', 'araba yedek parçası',
    'OEM yedek parça', 'orijinal yedek parça', 'ucuz yedek parça',
    // Darıca & Kocaeli
    'darıca yedek parça', 'darıca oto yedek parça', 'darıca oto',
    'kocaeli yedek parça', 'kocaeli oto yedek parça',
    'gebze yedek parça', 'gebze oto yedek parça',
    'dilovası yedek parça', 'çayırova yedek parça',
    'körfez yedek parça', 'izmit yedek parça', 'başiskele yedek parça',
    'gölcük yedek parça', 'kartepe yedek parça',
    // İstanbul yakın ilçeler
    'tuzla yedek parça', 'tuzla oto yedek parça',
    'pendik yedek parça', 'kartal yedek parça', 'maltepe yedek parça',
    'istanbul yedek parça', 'anadolu yakası yedek parça',
    // Ürün kategorileri
    'fren balatası', 'fren diski', 'hava filtresi', 'yağ filtresi',
    'amortisör', 'süspansiyon', 'motor parçaları', 'debriyaj seti',
  ],
  authors: [{ name: 'AKINEL OTO YEDEK PARÇA' }],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: DESCRIPTION,
    images: ['/opengraph-image'],
  },
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

async function fetchBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';
    const res = await fetch(`${base}/api/business/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function buildStructuredData(biz: BusinessSettings | null) {
  const openDays = biz?.workingHours
    .filter(h => h.isOpen && h.dayOfWeek >= 1 && h.dayOfWeek <= 6)
    .map(h => DAY_NAMES[h.dayOfWeek]) ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const firstOpen = biz?.workingHours.find(h => h.isOpen && h.dayOfWeek >= 1);

  return {
    '@context': 'https://schema.org',
    '@type': 'AutoPartsStore',
    name: biz?.companyName ?? 'AKINEL OTO YEDEK PARÇA',
    alternateName: 'Akinel Yedek Parça',
    url: SITE_URL,
    telephone: biz?.phone ?? '+905394624149',
    ...(biz?.email ? { email: biz.email } : { email: 'info@akinelotoyedekparca.com.tr' }),
    image: `${SITE_URL}/logo.png`,
    priceRange: '₺₺',
    description: biz?.shortDescription ?? 'Darıca, Kocaeli\'de otomotiv yedek parça satışı. OEM numarası veya araç seçimiyle hızlı arama.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz?.address ?? 'Osman Gazi, Tuzla Cd. No:238/B',
      addressLocality: biz?.district ?? 'Darıca',
      addressRegion: biz?.city ?? 'Kocaeli',
      postalCode: biz?.postalCode ?? '41700',
      addressCountry: 'TR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.7793666,
      longitude: 29.3758179,
    },
    openingHoursSpecification: openDays.length > 0
      ? [{ '@type': 'OpeningHoursSpecification', dayOfWeek: openDays, opens: firstOpen?.openTime ?? '09:00', closes: firstOpen?.closeTime ?? '19:00' }]
      : [],
    ...(biz?.googleMapsUrl ? { hasMap: biz.googleMapsUrl } : {}),
    areaServed: [
      'Darıca', 'Gebze', 'Dilovası', 'Çayırova', 'Körfez', 'İzmit', 'Başiskele',
      'Kartepe', 'Gölcük', 'Kocaeli', 'Tuzla', 'Pendik', 'Kartal', 'Maltepe', 'İstanbul',
    ],
    sameAs: [
      ...(biz?.instagramUrl ? [biz.instagramUrl] : []),
      ...(biz?.facebookUrl ? [biz.facebookUrl] : []),
      ...(biz?.googleMapsUrl ? [biz.googleMapsUrl] : []),
    ],
    servesCuisine: undefined,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/products?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const biz = await fetchBusinessSettings();
  const structuredData = buildStructuredData(biz);
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="font-sans min-h-screen flex flex-col">
        <SentryProvider>
          <PostHogProvider>
            <PublicShell>{children}</PublicShell>
          </PostHogProvider>
        </SentryProvider>
      </body>
    </html>
  );
}
