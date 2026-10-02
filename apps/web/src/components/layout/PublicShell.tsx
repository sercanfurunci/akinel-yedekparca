'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementTicker } from './AnnouncementTicker';
import { WhatsAppButton } from './WhatsAppButton';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold"
      >
        İçeriğe geç
      </a>
      <AnnouncementTicker />
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
