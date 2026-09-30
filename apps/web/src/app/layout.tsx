import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementTicker } from '@/components/layout/AnnouncementTicker';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

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
    streetAddress: 'Nenehatun, Fatih Cd. No:81',
    addressLocality: 'Darıca',
    addressRegion: 'Kocaeli',
    postalCode: '41700',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 40.7647,
    longitude: 29.3712,
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
        <AnnouncementTicker />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
