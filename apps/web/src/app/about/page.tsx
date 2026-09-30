import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, Car, Gauge, MapPin, Package, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'AKINEL Oto Yedek Parça hakkında bilgi edinin. Darıca, Kocaeli\'de faaliyet gösteren otomotiv yedek parça mağazamız OEM numarası ve araç seçimiyle hizmet vermektedir.',
};

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
      <p className="text-muted-foreground mb-10">AKINEL OTO YEDEK PARÇA nedir ve ne sağlar?</p>

      <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground mb-12">
        <p className="text-foreground text-base leading-relaxed">
          <strong>AKINEL OTO YEDEK PARÇA</strong>, Darıca / Kocaeli'de faaliyet gösteren bir otomotiv yedek
          parça mağazasıdır. Fren sistemleri, filtreler, süspansiyon, debriyaj ve elektrik sistemi
          parçaları başta olmak üzere geniş ürün yelpazesiyle hizmet vermekteyiz.
        </p>
        <p className="leading-relaxed">
          Amacımız; araç sahiplerinin doğru yedek parçayı, doğru fiyatla ve en kısa sürede bulmasını sağlamak.
          Marka, model ve motor bilginizi seçerek ya da OEM / orijinal parça numaranızı girerek uyumlu
          parçaları anında listeleyebilir, stok ve fiyat durumunu şeffaf biçimde görebilirsiniz.
        </p>
        <p className="leading-relaxed">
          Bosch, Valeo, SKF, TRW, Delphi gibi kaliteli markalardan ürünler stoklarımızda bulunmaktadır.
          Kocaeli, İstanbul ve çevre illere hızlı teslimat sağlamaktayız.
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

      {/* Map section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <MapPin size={20} className="text-brand" />
          Neredeyiz?
        </h2>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl overflow-hidden border" style={{ minHeight: '320px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.211392343826!2d29.37324297745954!3d40.77936657138359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cadfa5b24995a1%3A0xc7de0d66a28e88a9!2sAKINEL%20OTO%20YEDEK%20PAR%C3%87A!5e0!3m2!1str!2str!4v1790785274428!5m2!1str!2str"
              width="100%"
              height="100%"
              style={{ minHeight: '320px', border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="AKINEL OTO YEDEK PARÇA konum"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border bg-card p-5 flex-1">
              <p className="font-semibold text-sm mb-1">Adresimiz</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Osman Gazi, Tuzla Cd. No:238/B<br />
                41700 Darıca / Kocaeli
              </p>
            </div>
            <a
              href="https://www.google.com/maps/dir//AKINEL+OTO+YEDEK+PAR%C3%87A,+Osman+Gazi,+Tuzla+Cd.+No:238%2FB,+41700+Dar%C4%B1ca%2FKocaeli/@40.7793666,29.3758179,17z"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border bg-brand text-brand-foreground p-4 flex items-center gap-3 hover:bg-brand/90 transition-colors"
            >
              <MapPin size={18} />
              <span className="font-medium text-sm">Yol Tarifi Al</span>
              <ExternalLink size={13} className="ml-auto opacity-70" />
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-6 text-center">
        <h3 className="font-semibold mb-2">Sormak istediğiniz bir şey mi var?</h3>
        <p className="text-sm text-muted-foreground mb-4">
          AKINEL OTO YEDEK PARÇA ekibimiz size yardımcı olmaktan memnuniyet duyar.
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
