import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu | Akinel Yedek Parça',
};

export default function OnBilgilendirmeFormuPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Ön Bilgilendirme Formu</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Mesafeli Sözleşmeler Yönetmeliği Madde 5 Kapsamında Tüketici Bilgilendirmesi
      </p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8">
        Bu belge taslak niteliğindedir. Satışa açılmadan önce hukuki danışmanlık alınarak tamamlanmalıdır. Ürün bilgileri ve fiyatlar dinamik olarak siparişe bağlı olduğundan bu form genellikle ödeme öncesi ekranda gösterilir ve onaylatılır.
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-2">1. Satıcı Bilgileri</h2>
          <ul className="space-y-1">
            <li><strong>Ticari Unvan:</strong> [İŞLETME ADI]</li>
            <li><strong>Adres:</strong> [ADRES]</li>
            <li><strong>Telefon:</strong> [TELEFON]</li>
            <li><strong>E-posta:</strong> [E-POSTA]</li>
            <li><strong>Web Sitesi:</strong> akinel.com</li>
            <li><strong>Vergi No:</strong> [VERGİ NO] / [VERGİ DAİRESİ]</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Mal veya Hizmetin Temel Nitelikleri</h2>
          <p>Siparişinize ait ürün adı, kodu, miktarı ve fiyatı sipariş özeti sayfasında ve onay e-postasında yer almaktadır. Ürünler otomotiv yedek parçası niteliğindedir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. Toplam Fiyat</h2>
          <p>Ürünün KDV dahil toplam fiyatı sipariş adımında görüntülenir. Kargo ücreti, varsa ek ücretler sipariş özetine yansıtılır. Ödeme kredi/banka kartı ile tahsil edilir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Teslimat Bilgileri</h2>
          <p>Sipariş onayının ardından ürün ortalama [X]–[Y] iş günü içinde kargoya verilir. Kargo takip numarası e-posta ile iletilir. Teslimat adresi yanlışsa oluşan ek masraf alıcıya aittir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Cayma Hakkı</h2>
          <p>Teslim tarihinden itibaren <strong>14 (on dört) gün</strong> içinde sözleşmeden cayabilirsiniz. Cayma bildirimini <strong>[E-POSTA]</strong> adresine iletmeniz yeterlidir. Bildirimin ardından 10 gün içinde ürünü iade etmeniz gerekmektedir.</p>
          <p className="mt-2 font-medium">Cayma hakkı aşağıdaki durumlarda kullanılamaz:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Alıcı tarafından açılmış veya kullanılmış ürünler</li>
            <li>Özel sipariş veya kişiye özel üretilen ürünler</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. İade Süreci</h2>
          <p>Cayma bildiriminin ardından ürün iade edildiğinde, ödemeniz <strong>14 (on dört) gün</strong> içinde aynı ödeme yöntemiyle iade edilir. İade kargo ücreti [Satıcı / Alıcı] tarafından karşılanır.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Şikâyet ve Uyuşmazlık</h2>
          <p>Şikâyetlerinizi <strong>[E-POSTA]</strong> adresine iletebilirsiniz. Uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine başvurabilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">8. Kişisel Verilerin Korunması</h2>
          <p>
            Kişisel verilerinizin işlenmesine ilişkin bilgiler için{' '}
            <a href="/belgeler/kvkk-aydinlatma-metni" className="text-brand hover:underline">KVKK Aydınlatma Metni</a>&apos;ni inceleyiniz.
          </p>
        </section>

      </div>
    </div>
  );
}
