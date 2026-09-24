export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: { default: 'Akinel Yedek Parça', template: '%s | Akinel Yedek Parça' },
  description: 'Aracınız için kaliteli yedek parçalar. Araç seçimi veya OEM numarası ile hızlı arama.',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'AKN MOTORS Car Service',
  url: 'https://aknmotors.com.tr',
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
      <body className={`${geist.variable} ${geistMono.variable} font-sans min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
