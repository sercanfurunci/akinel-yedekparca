import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Ürünler — AKINEL OTO YEDEK PARÇA' },
  description: 'Otomobil ve ticari araçlar için geniş yedek parça seçenekleri. OEM numarasıyla arama, araç bazlı uyumlu parça bulma.',
  alternates: { canonical: '/products' },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
