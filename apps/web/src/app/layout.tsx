import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: { default: 'AKİNEL OTO YEDEK PARÇA', template: '%s | AKİNEL OTO YEDEK PARÇA' },
  description: 'Aracınız için kaliteli yedek parçalar. Araç seçimi veya OEM numarası ile hızlı arama.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
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
      <body className="font-sans min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
