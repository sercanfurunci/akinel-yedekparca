import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Car, Gauge, MapPin, Package } from 'lucide-react';

export const metadata: Metadata = { title: 'Hakkımızda' };

const features = [
  {
    icon: Car,
    title: 'Araç Seçimi ile Arama',
    description: 'Marka, model, kasa ve motor bilginizi seçin — sadece aracınıza uyumlu parçaları listeleyin.',
  },
  {
    icon: Search,
    title: 'OEM Numarası ile Arama',
    description: 'Orijinal parça numaranızı girin, doğrudan ürüne ulaşın.',
  },
  {
    icon: Gauge,
    title: 'Gerçek Zamanlı Stok',
    description: 'Her ürünün anlık stok durumunu görün; stokta olan parçaları öncelikle listeleyin.',
  },
  {
    icon: Package,
    title: 'Fiyat Şeffaflığı',
    description: 'Liste fiyatlarını gizlemeden doğrudan gösterin; her üründe net fiyat bilgisi.',
  },
  {
    icon: MapPin,
    title: 'Garajım',
    description: 'Birden fazla aracınızı kaydedin, her araç için hızlıca uyumlu parçalara ulaşın.',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 max-w-4xl py-12">
      <h1 className="text-3xl font-bold mb-2">Hakkımızda</h1>
      <p className="text-muted-foreground mb-10">AKİNEL OTO YEDEK PARÇA nedir ve ne sağlar?</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground mb-12">
        <p className="text-foreground text-base leading-relaxed">
          <strong>AKİNEL OTO YEDEK PARÇA</strong>, Darıca/Kocaeli merkezli{' '}
          <strong>AKN MOTORS Car Service</strong> hizmet noktasının online yedek parça platformudur.
        </p>
        <p className="leading-relaxed">
          Amacımız; araç sahiplerinin doğru yedek parçayı, doğru fiyatla ve en kısa sürede bulmasını sağlamak.
          Araç bilginizi seçerek ya da OEM numaranızı girerek uyumlu parçaları anında listeleyebilir,
          stok ve fiyat durumunu şeffaf biçimde görebilirsiniz.
        </p>
        <p className="leading-relaxed">
          Platform, otomotiv yedek parça aramanızı mağaza gezisi gerektirmeden ve teknik bilgiye ihtiyaç duymadan
          kolaylaştırmak için tasarlanmıştır.
        </p>
      </div>

      <h2 className="text-xl font-bold mb-6">Neler Sunuyoruz?</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-4 rounded-xl border bg-card p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-muted text-brand">
              <Icon size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground leading-snug">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-muted/30 p-6 text-center">
        <h3 className="font-semibold mb-2">Sormak istediğiniz bir şey mi var?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          AKN MOTORS Car Service ekibimiz size yardımcı olmaktan memnuniyet duyar.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-6 py-2.5 text-sm font-medium hover:bg-brand/90 transition-colors"
        >
          İletişime Geç
        </Link>
      </div>
    </div>
  );
}
