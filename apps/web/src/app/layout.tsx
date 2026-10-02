import type { Metadata } from 'next';
import './globals.css';
import { PublicShell } from '@/components/layout/PublicShell';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';
import type { BusinessSettings } from '@/lib/types';

const SITE_URL = 'https://akinelotoyedekparca.com.tr';
const SITE_NAME = 'AKINEL OTO YEDEK PARÇA';
const DESCRIPTION = 'AKINEL Oto Yedek Parça — Darıca, Kocaeli. OEM numarası veya araç seçimiyle hızlı yedek parça arama. Fren, filtre, süspansiyon ve daha fazlası.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: [
    'akinel oto yedek parça', 'akinel yedek parça', 'oto yedek parça',
    'yedek parça darıca', 'yedek parça kocaeli', 'OEM yedek parça',
    'araba parçası', 'otomotiv yedek parça', 'AKINEL',
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
        <PostHogProvider>
          <PublicShell>{children}</PublicShell>
        </PostHogProvider>
      </body>
    </html>
  );
}
