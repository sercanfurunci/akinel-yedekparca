import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Markalar',
  description: 'AKINEL Oto Yedek Parça marka kataloğu. Araç markanıza uygun yedek parçaları marka bazında inceleyin.',
  alternates: { canonical: '/brands' },
};

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
