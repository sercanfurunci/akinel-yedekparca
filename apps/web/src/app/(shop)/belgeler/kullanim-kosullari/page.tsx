import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | AKINEL OTO YEDEK PARÇA',
};

export default function KullanimKosullariPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Kullanım Koşulları</h1>
      <p className="text-sm text-muted-foreground mb-8">Son güncelleme: [TARİH — yayına alınmadan önce güncellenecektir]</p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8">
        Bu belge taslak niteliğindedir. Satışa açılmadan önce hukuki danışmanlık alınarak işletmeye özgü bilgilerle tamamlanmalı ve onaylanmalıdır.
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-2">1. Taraflar ve Kapsam</h2>
          <p>
            Bu Kullanım Koşulları, <strong>[İŞLETME ADI]</strong> (&ldquo;AKINEL&rdquo; veya &ldquo;Satıcı&rdquo;) ile siteyi ziyaret eden veya hizmetlerden yararlanan kişi (&ldquo;Kullanıcı&rdquo;) arasındaki ilişkiyi düzenler. Siteyi kullanmakla bu koşulları kabul etmiş sayılırsınız.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Hizmetin Kapsamı</h2>
          <p>AKINEL OTO YEDEK PARÇA, otomotiv yedek parçalarının çevrimiçi olarak satışını gerçekleştiren bir e-ticaret platformudur. Site üzerinden sunulan araç uyumluluk bilgileri yardımcı nitelikte olup, kesin uyumluluk için yetkili servis danışmanınıza başvurmanız önerilir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. Üyelik ve Hesap Güvenliği</h2>
          <p>Üyelik için gerçek ve güncel bilgi sağlamak zorunludur. Hesap şifrenizin güvenliğinden siz sorumlusunuz. Yetkisiz erişim şüphesi durumunda derhal [E-POSTA] adresine bildirmeniz gerekmektedir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Sipariş ve Ödeme</h2>
          <p>Sipariş onayı, stok mevcudiyeti ve ödeme tahsilatının tamamlanmasıyla geçerli olur. Fiyat değişikliği durumunda kullanıcı bilgilendirilir ve siparişi iptal etme hakkına sahip olur. Ödeme işlemleri 256-bit SSL şifrelemeli altyapı üzerinden gerçekleştirilir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Teslimat</h2>
          <p>Teslimat süreleri ve koşulları sipariş sayfasında belirtilir. Beklenmedik durumlarda (stok dışı, kargo gecikme vb.) kullanıcıya bildirim yapılır. Teslimat adresi hatalıysa ek masraf kullanıcıya yansıtılabilir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. İade ve İptal</h2>
          <p>
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında 14 günlük cayma hakkınız bulunmaktadır. Ayrıntılar için{' '}
            <a href="/belgeler/mesafeli-satis-sozlesmesi" className="text-brand hover:underline">Mesafeli Satış Sözleşmesi</a>{' '}
            ve{' '}
            <a href="/belgeler/on-bilgilendirme-formu" className="text-brand hover:underline">Ön Bilgilendirme Formu</a>&apos;nu inceleyiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Fikri Mülkiyet</h2>
          <p>Sitedeki tüm içerik, logo, görsel ve yazılım AKINEL&apos;e aittir. İzinsiz kopyalanamaz, çoğaltılamaz veya dağıtılamaz.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">8. Sorumluluk Sınırlaması</h2>
          <p>AKINEL, siteye erişim kesintilerinden, üçüncü taraf bağlantılarından veya kullanıcının yanlış araç seçiminden kaynaklanabilecek zararlardan sorumlu tutulamaz.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">9. Uygulanacak Hukuk</h2>
          <p>Bu koşullar Türk hukukuna tabidir. Anlaşmazlıklarda [İLGİLİ İL] Tüketici Hakem Heyetleri ve Mahkemeleri yetkilidir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">10. Değişiklikler</h2>
          <p>AKINEL bu koşulları önceden haber vermeksizin güncelleme hakkını saklı tutar. Güncel koşullar sitede yayımlanır.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">11. İletişim</h2>
          <p>Sorularınız için: <strong>[E-POSTA ADRESİ]</strong> — <strong>[TELEFON]</strong></p>
        </section>

      </div>
    </div>
  );
}
