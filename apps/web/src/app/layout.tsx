import type { Metadata } from 'next';
import './globals.css';
import { PublicShell } from '@/components/layout/PublicShell';
import { PostHogProvider } from '@/components/analytics/PostHogProvider';

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

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AutoPartsStore',
  name: 'AKINEL OTO YEDEK PARÇA',
  alternateName: 'Akinel Yedek Parça',
  url: 'https://akinelotoyedekparca.com.tr',
  telephone: '+905394624149',
  email: 'info@akinelotoyedekparca.com.tr',
  image: 'https://akinelotoyedekparca.com.tr/logo.png',
  priceRange: '₺₺',
  description: 'Darıca, Kocaeli\'de otomotiv yedek parça satışı. OEM numarası veya araç seçimiyle hızlı arama.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Osman Gazi, Tuzla Cd. No:238/B',
    addressLocality: 'Darıca',
    addressRegion: 'Kocaeli',
    postalCode: '41700',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.7793666,
    longitude: 29.3758179,
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '19:00' },
  ],
  hasMap: 'https://www.google.com/maps/dir//AKINEL+OTO+YEDEK+PAR%C3%87A,+Osman+Gazi,+Tuzla+Cd.+No:238%2FB,+41700+Dar%C4%B1ca%2FKocaeli/@40.7793666,29.3758179,17z',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
