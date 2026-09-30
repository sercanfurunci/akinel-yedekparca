import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const SITE_URL = 'https://akinelotoyedekparca.com.tr';
const SITE_NAME = 'AKINEL OTO YEDEK PARÇA';
const DESCRIPTION = 'Aracınız için kaliteli yedek parçalar. OEM numarası veya araç seçimi ile hızlı arama. Darıca, Kocaeli.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: ['yedek parça', 'oto yedek parça', 'OEM', 'araba parçası', 'Darıca', 'Kocaeli', 'AKINEL'],
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
  '@type': 'LocalBusiness',
  name: 'AKINEL OTO YEDEK PARÇA',
  url: 'https://akinelotoyedekparca.com.tr',
  telephone: '+905331405649',
  email: 'info@aknmotors.com.tr',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Nenehatun, Fatih Cd. No:81',
    addressLocality: 'Darıca',
    addressRegion: 'Kocaeli',
    postalCode: '41700',
    addressCountry: 'TR',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '19:00' },
  ],
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
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
