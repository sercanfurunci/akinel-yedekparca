import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'Sık Sorulan Sorular — AKINEL OTO YEDEK PARÇA' },
  description: 'Sipariş, iade, ödeme, araç uyumluluğu ve teslimat hakkında sık sorulan sorular.',
  alternates: { canonical: '/sss' },
};

const faqs = [
  {
    q: 'Aracıma uygun parçayı nasıl bulabilirim?',
    a: '"Aracımı Seç" özelliğini kullanarak marka, model ve motor tipinizi seçin. Sisteme kayıtlı aracınıza uyumlu ürünler otomatik olarak filtrelenir.',
  },
  {
    q: 'OEM numarasıyla arama yapabilir miyim?',
    a: 'Evet. Arama çubuğuna OEM veya parça numarasını girerek doğrudan ürüne ulaşabilirsiniz.',
  },
  {
    q: 'Sipariş verdikten sonra ne zaman kargoya verilir?',
    a: 'Siparişler, ödeme onayından sonra iş günleri içinde hazırlanıp kargoya teslim edilir. Teslimat süresi kargo firmasına ve bölgenize göre değişir.',
  },
  {
    q: 'Cayma hakkım var mı?',
    a: '14 gün içinde koşulsuz cayma hakkınız bulunmaktadır. Ürünü kullanmamış ve orijinal ambalajında iade edebilirsiniz.',
  },
  {
    q: 'İade sürecinde kargo ücreti kime ait?',
    a: 'Anlaşmalı kargo firmamızı kullanarak iade gönderirseniz kargo ücreti tarafımıza aittir. Farklı kargo firması kullanılması halinde aradaki fark size yansıtılır.',
  },
  {
    q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    a: 'Kredi kartı, banka kartı, EFT/havale ve kapıda ödeme seçenekleri mevcuttur.',
  },
  {
    q: 'Ürün garanti kapsamında mı?',
    a: 'Tüm ürünler Türk Ticaret Kanunu ve 6502 sayılı TKHK kapsamında 2 yıl ayıplı mal garantisi ile satılmaktadır. Üretici garantisi ayrıca geçerlidir.',
  },
  {
    q: 'Faturama nasıl ulaşabilirim?',
    a: 'Faturanız sipariş onay e-postasına eklenerek gönderilir. Aynı zamanda "Hesabım > Siparişlerim" bölümünden de indirebilirsiniz.',
  },
  {
    q: 'Araç uyumluluk bilgisi kesin midir?',
    a: 'Uyumluluk bilgileri referans amaçlıdır. Parçayı takmadan önce teknik servis veya yetkili bayi ile teyit etmenizi öneririz. Uyumluluk teyidi, yasal tüketici haklarınızı ortadan kaldırmaz.',
  },
  {
    q: 'Kişisel verilerimi nasıl kullanıyorsunuz?',
    a: 'Kişisel verileriniz KVKK (6698 sayılı Kanun) kapsamında işlenmektedir. Detaylar için Gizlilik Politikamızı ve KVKK Aydınlatma Metnimizi inceleyebilirsiniz.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function SssPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="mb-8">
          <div className="w-10 h-1 bg-brand rounded-full mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">Sık Sorulan Sorular</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Aklınızdaki soruyu bulamazsanız{' '}
            <Link href="/contact" className="text-brand font-semibold hover:underline">
              iletişim sayfasından
            </Link>{' '}
            bize ulaşabilirsiniz.
          </p>
        </div>

        <div className="divide-y divide-border">
          {faqs.map(({ q, a }, i) => (
            <details key={i} className="group py-4">
              <summary className="flex items-center justify-between cursor-pointer list-none gap-4">
                <span className="font-semibold text-[#111827] text-sm md:text-base">{q}</span>
                <span className="shrink-0 text-brand text-lg font-bold group-open:rotate-45 transition-transform duration-200">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
