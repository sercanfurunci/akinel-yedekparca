import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu | AKINEL OTO YEDEK PARÇA',
};

export default function OnBilgilendirmeFormuPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Ön Bilgilendirme Formu</h1>
      <p className="text-sm text-muted-foreground mb-2">Son güncelleme: 1 Ekim 2026 — Sürüm 1.0</p>
      <p className="text-sm text-muted-foreground mb-8">
        Mesafeli Sözleşmeler Yönetmeliği Madde 5 kapsamında tüketiciye sözleşmeden önce
        verilmesi zorunlu bilgiler.
      </p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8 space-y-2">
        <p className="font-semibold">İşletme Sahibine Not — Üretime Geçmeden Önce Tamamlanması Gerekenler:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>
            <strong>Vergi numarası ve vergi dairesi:</strong> Satıcı bilgileri bölümüne eklenmelidir.
          </li>
          <li>
            <strong>Anlaşmalı iade kargo firması:</strong> Yönetmelik gereği burada açıkça belirtilmesi
            zorunludur. Belirlenmeden bu form yayınlanmamalıdır.
          </li>
          <li>
            <strong>Tahmini teslimat süresi:</strong> Bölüm 5&apos;e girilmelidir.
          </li>
          <li>
            <strong>Sipariş-özgü bilgiler (ürün adı, fiyat, adet):</strong> Bu statik sayfa genel koşulları
            içermektedir. Sipariş özeti (ürün, fiyat, toplam tutar) ödeme adımında Alıcı&apos;ya
            gösterilmekte; Alıcı bu formu ve Mesafeli Satış Sözleşmesi&apos;ni onaylayarak siparişi
            tamamlamaktadır. Bu akışın mevzuata uygunluğu hukuki danışmanlık ile teyit edilmelidir.
          </li>
          <li>Bu belge hukuki danışmanlık alınarak nihai hâle getirilmelidir; bu metin taslak niteliğindedir.</li>
        </ul>

        <div className="mt-3 border-t border-amber-300 pt-2">
          <p className="font-medium">Uygulama Notu:</p>
          <p className="mt-0.5">
            Mesafeli Sözleşmeler Yönetmeliği&apos;ne göre Ön Bilgilendirme Formu&apos;nun, Alıcı
            siparişle bağlı hâle gelmeden <em>önce</em> onaylatılması zorunludur. Mevcut uygulamada
            bu form ödeme adımında diğer zorunlu belgelerle birlikte onaylatılmaktadır ve sipariş
            özeti aynı sayfada görüntülenmektedir. Bu uygulama biçiminin yasal gereklilikleri
            karşılayıp karşılamadığı hukuki danışmanla teyit edilmelidir.
          </p>
        </div>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-3">1. Satıcı Bilgileri</h2>
          <div className="rounded border p-3 space-y-1 text-xs bg-muted/40">
            <p><strong>Ticari Unvan:</strong> AKINEL OTO YEDEK PARÇA</p>
            <p><strong>Adres:</strong> Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli, Türkiye</p>
            <p><strong>Telefon:</strong> +90 539 462 41 49 / +90 533 140 56 49</p>
            <p><strong>E-posta:</strong> info@akinelotoyedekparca.com.tr</p>
            <p><strong>Web Sitesi:</strong> https://akinelotoyedekparca.com.tr</p>
            <p className="text-amber-700">
              <strong>Vergi No / Dairesi:</strong> [İŞLETME SAHİBİ TARAFINDAN EKLENECEK]
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">2. Malın/Hizmetin Temel Nitelikleri</h2>
          <p>
            Sipariş ettiğiniz ürünlerin adı, marka/OEM kodu, miktarı ve temel özellikleri
            ödeme adımındaki sipariş özeti bölümünde ve sipariş onay e-postasında yer almaktadır.
          </p>
          <p className="mt-2">
            Ürünler otomotiv yedek parçası niteliğindedir. Listelenen araç uyumluluk bilgileri
            yardımcı nitelikte olup, kesin uyumluluk için doğru araç bilgisinin (marka, model,
            yıl, motor kodu) girilmesi veya sipariş öncesinde Satıcı&apos;dan onay alınması
            önerilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">3. Toplam Fiyat</h2>
          <p>
            Ürünlerin KDV dahil birim fiyatları ve toplam sipariş tutarı ödeme adımındaki
            sipariş özetinde görüntülenir. Kargo ücreti ayrıca belirtilir; ücretsiz kargo
            eşiğinin üzerindeki siparişlerde kargo ücreti alınmaz.
          </p>
          <p className="mt-2">
            Banka havalesi/EFT ile ödeme seçilmesi hâlinde sipariş tutarı ve hesap bilgileri
            onay e-postasında gönderilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">4. Ödeme Koşulları</h2>
          <p>Mevcut ödeme yöntemleri:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Kredi / Banka Kartı (güvenli HTTPS bağlantısı üzerinden)</li>
            <li>Banka Havalesi / EFT</li>
            <li>Kapıda Ödeme</li>
          </ul>
          <p className="mt-2">
            Kredi kartı bilgileri Satıcı sunucularında saklanmaz. Taksit seçenekleri, ödeme
            adımında banka/kart türüne göre gösterilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">5. Teslimat Bilgileri</h2>
          <p>
            Tahmini teslimat süresi:{' '}
            <strong className="text-amber-700">
              [İŞLETME SAHİBİ TARAFINDAN EKLENECEK — örn. 2–5 iş günü]
            </strong>
          </p>
          <p className="mt-2">
            Kargoya verildiğinde takip numarası e-posta ile iletilir. Yanlış veya eksik
            teslimat adresi nedeniyle oluşan ek masraf Alıcı&apos;ya aittir. Teslimat yalnızca
            Türkiye&apos;deki adreslere yapılmaktadır. Sipariş, yasal azami süre olan{' '}
            <strong>30 (otuz) gün</strong> içinde teslim edilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">6. Cayma Hakkı</h2>

          <h3 className="font-medium mt-3 mb-1">6.1 Cayma Süresi ve Bildirimi</h3>
          <p>
            Ürünü teslim aldığınız tarihten itibaren <strong>14 (on dört) gün</strong> içinde
            herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayabilirsiniz.
          </p>
          <p className="mt-2">
            Cayma bildirimini 14 günlük süre içinde aşağıdaki kanallardan biriyle yapabilirsiniz:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>E-posta:</strong>{' '}
              <a href="mailto:info@akinelotoyedekparca.com.tr" className="text-brand hover:underline">
                info@akinelotoyedekparca.com.tr
              </a>{' '}
              (konu: &ldquo;Cayma — Sipariş No: [Sipariş Numaranız]&rdquo;)
            </li>
            <li>
              <strong>Yazılı posta:</strong> Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli
            </li>
          </ul>

          <h3 className="font-medium mt-3 mb-1">6.2 İade Kargo Firması ve Masrafları</h3>
          <p>
            Satıcı&apos;nın anlaşmalı iade kargo firması:{' '}
            <strong className="text-amber-700">
              [ANLAŞMALI KARGO FİRMASI — İŞLETME SAHİBİ TARAFINDAN EKLENECEK]
            </strong>
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Anlaşmalı kargo firmasını kullanırsanız iade kargo ücreti <strong>Satıcı</strong>{' '}
              tarafından karşılanır.
            </li>
            <li>
              Farklı bir kargo firması kullanırsanız, anlaşmalı kargo ücreti ile seçtiğiniz
              firmanın ücreti arasındaki fark sizin sorumluluğunuzdadır.
            </li>
            <li>
              Anlaşmalı kargo firmasının bulunduğunuz yerde şubesi veya teslim/teslim al noktası
              yoksa iade kargo ücreti <strong>Satıcı</strong> tarafından karşılanır.
            </li>
          </ul>

          <h3 className="font-medium mt-3 mb-1">6.3 İade Ödemesinin Zamanı ve Yöntemi</h3>
          <p>
            Satıcı, cayma bildirimini aldıktan sonra ürünü teslim aldığında veya iade
            gönderiminin yapıldığına dair kanıt sunulduğunda (hangisi önce gerçekleşirse)
            en geç <strong>14 (on dört) gün</strong> içinde ödemenizi aynı ödeme yöntemiyle
            iade eder.
          </p>

          <h3 className="font-medium mt-3 mb-1">6.4 Cayma Hakkının İstisnaları</h3>
          <p>Aşağıdaki durumlarda cayma hakkı kullanılamaz:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Tüketicinin özel istekleri doğrultusunda üretilmiş veya açıkça kişisel ihtiyaca
              göre özelleştirilmiş ürünler.
            </li>
            <li>
              Teslimden sonra başka ürünlerle ayrıştırılamayacak şekilde karışan ürünler.
            </li>
          </ul>
          <p className="mt-2">
            Standart seri üretim otomotiv yedek parçaları kural olarak cayma hakkı kapsamındadır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">7. Ayıplı Mal Hakları</h2>
          <p>
            6502 Sayılı TKHK kapsamında teslim tarihinden itibaren <strong>2 (iki) yıl</strong>{' '}
            boyunca ayıplı mal haklarınız saklıdır: sözleşmeden dönme, misliyle değiştirme,
            ücretsiz onarım veya bedel indirimi.
          </p>
          <p className="mt-2">
            Detaylar için{' '}
            <a href="/belgeler/mesafeli-satis-sozlesmesi" className="text-brand hover:underline">
              Mesafeli Satış Sözleşmesi
            </a>{' '}
            Madde 9&apos;a bakınız.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">8. Şikâyet ve Uyuşmazlık</h2>
          <p>
            Şikâyetlerinizi{' '}
            <a href="mailto:info@akinelotoyedekparca.com.tr" className="text-brand hover:underline">
              info@akinelotoyedekparca.com.tr
            </a>{' '}
            adresine veya +90 539 462 41 49 numaralı telefona iletebilirsiniz.
          </p>
          <p className="mt-2">
            Uyuşmazlık hâlinde Tüketici Hakem Heyetleri ve Tüketici Mahkemelerine
            başvurabilirsiniz. Tüketici Hakem Heyeti parasal yetki sınırları her yıl Ticaret
            Bakanlığı tarafından güncellenmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">9. Kişisel Verilerin Korunması</h2>
          <p>
            Kişisel verilerinizin işlenmesine ilişkin bilgi için:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <a href="/belgeler/gizlilik-politikasi" className="text-brand hover:underline">
                Gizlilik Politikası
              </a>
            </li>
            <li>
              <a href="/belgeler/kvkk-aydinlatma-metni" className="text-brand hover:underline">
                KVKK Aydınlatma Metni
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">10. Sipariş Onayı</h2>
          <p>
            Ödeme adımında zorunlu onay kutucuklarını işaretleyerek siparişi tamamlamanız,
            bu Ön Bilgilendirme Formu&apos;nu, Mesafeli Satış Sözleşmesi&apos;ni ve Kullanım
            Koşulları&apos;nı okuduğunuzu ve kabul ettiğinizi ifade eder. Onay zaman damgası
            sipariş kaydına işlenir.
          </p>
        </section>

      </div>
    </div>
  );
}
