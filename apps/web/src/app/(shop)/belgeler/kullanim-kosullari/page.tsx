import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | AKINEL OTO YEDEK PARÇA',
};

export default function KullanimKosullariPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Kullanım Koşulları</h1>
      <p className="text-sm text-muted-foreground mb-2">Son güncelleme: 1 Ekim 2026 — Sürüm 1.0</p>
      <p className="text-sm text-muted-foreground mb-8">
        Bu Kullanım Koşulları, AKINEL OTO YEDEK PARÇA web sitesinin tüm kullanıcıları için
        geçerlidir.
      </p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8 space-y-1">
        <p className="font-semibold">İşletme Sahibine Not — Üretime Geçmeden Önce Tamamlanması Gerekenler:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Vergi numarası ve varsa ticaret sicil bilgileri eklenmelidir.</li>
          <li>
            Uyuşmazlık için geçerli Tüketici Hakem Heyeti yetki sınırları yıllık olarak
            değiştiğinden bu belgede tutar belirtilmemektedir — güncel tutarlar Ticaret Bakanlığı
            duyurularından takip edilmelidir.
          </li>
          <li>Bu belge hukuki danışmanlık alınarak nihai hâle getirilmelidir; bu metin taslak niteliğindedir.</li>
        </ul>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-3">1. Taraflar ve Kabul</h2>
          <p>
            Bu Kullanım Koşulları, <strong>AKINEL OTO YEDEK PARÇA</strong> ticari unvanlı işletme
            (&ldquo;AKINEL&rdquo; veya &ldquo;Satıcı&rdquo;) ile{' '}
            <strong>https://akinelotoyedekparca.com.tr</strong> adresindeki web sitesini
            (&ldquo;Site&rdquo;) ziyaret eden veya hizmetlerinden yararlanan her gerçek kişi
            (&ldquo;Kullanıcı&rdquo;) arasındaki ilişkiyi düzenler.
          </p>
          <p className="mt-2">
            Siteye erişmek, bir hesap oluşturmak veya sipariş vermek, bu koşulları okuduğunuzu
            ve bağlayıcı olduğunu kabul ettiğinizi gösterir. Koşulları kabul etmiyorsanız
            lütfen siteyi kullanmayınız.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">2. Satıcı Kimliği ve İletişim</h2>
          <div className="rounded border p-3 space-y-0.5 text-xs bg-muted/40">
            <p><strong>Ticari Unvan:</strong> AKINEL OTO YEDEK PARÇA</p>
            <p><strong>Adres:</strong> Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli, Türkiye</p>
            <p><strong>Telefon:</strong> +90 539 462 41 49 / +90 533 140 56 49</p>
            <p><strong>E-posta:</strong> info@akinelotoyedekparca.com.tr</p>
            <p><strong>Çalışma Saatleri:</strong> Pazartesi – Cumartesi 09:00 – 19:00 (Pazar kapalı)</p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">3. Hizmetin Kapsamı</h2>
          <p>
            AKINEL OTO YEDEK PARÇA, otomotiv yedek parçalarının çevrimiçi satışını
            gerçekleştiren bir e-ticaret platformudur. Site, kullanıcıların araç bilgisine
            veya OEM parça numarasına göre uyumlu yedek parça aramasını ve sipariş vermesini
            sağlar.
          </p>
          <p className="mt-2">
            Araç uyumluluk bilgileri ve OEM numarası eşleşmeleri yardımcı nitelikte bilgi
            sunmaktadır. Kesin uyumluluk onayı için bölüm 10 (Araç Uyumluluğu ve OEM
            Numaraları) okunmalıdır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">4. Üyelik ve Hesap Güvenliği</h2>
          <p>
            Üyelik kaydı sırasında doğru, eksiksiz ve güncel bilgi sağlamak zorunludur. Yanıltıcı
            bilgiyle oluşturulan hesaplar askıya alınabilir veya silinebilir.
          </p>
          <p className="mt-2">
            Hesap şifrenizin gizliliğini korumak sizin sorumluluğunuzdadır. Hesabınıza yetkisiz
            erişim olduğundan şüpheleniyorsanız derhal{' '}
            <a href="mailto:info@akinelotoyedekparca.com.tr" className="text-brand hover:underline">
              info@akinelotoyedekparca.com.tr
            </a>{' '}
            adresine bildirmeniz gerekmektedir. Bildirim yapılmadan gerçekleşen yetkisiz işlemlerden
            AKINEL sorumlu tutulamaz.
          </p>
          <p className="mt-2">
            Site, kullanıcı hesabına bağlı olmaksızın misafir olarak sipariş verme imkânı da
            sunmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">5. Sipariş ve Ödeme</h2>
          <p>
            Sipariş, sepetteki ürünlerin onaylanması ve ödeme adımının tamamlanmasıyla
            oluşturulur. Sipariş onayı; stok mevcudiyetine, ödeme tahsilatının/onayının
            gerçekleşmesine ve sipariş e-postasının iletilmesine bağlıdır.
          </p>
          <p className="mt-2">
            Ödeme yöntemleri: kredi veya banka kartı, banka havalesi/EFT, kapıda ödeme.
            Ödeme işlemleri HTTPS şifrelemeli bağlantı üzerinden gerçekleştirilir; kart
            bilgileri AKINEL sunucularında saklanmaz.
          </p>
          <p className="mt-2">
            Fiyatlar KDV dahil Türk lirası olarak gösterilir. Sipariş onaylandıktan sonra
            fiyat değişikliği uygulanmaz; ancak ürün stoğundan düşülmeden önce fiyat hatası
            tespit edilirse kullanıcı bilgilendirilir ve siparişi iptal etme hakkı tanınır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">6. Teslimat</h2>
          <p>
            Tahmini teslimat süresi{' '}
            <a href="/belgeler/on-bilgilendirme-formu" className="text-brand hover:underline">
              Ön Bilgilendirme Formu
            </a>
            &apos;nda ve sipariş onay e-postasında belirtilir. Beklenmeyen durumlarda (stok dışı
            ürün, kargo gecikmesi vb.) kullanıcıya bildirim yapılır.
          </p>
          <p className="mt-2">
            Teslimat adresi hatalı girilmiş ise oluşan ek maliyet kullanıcıya yansıtılabilir.
            Teslimat konusundaki haklarınız için{' '}
            <a href="/belgeler/mesafeli-satis-sozlesmesi" className="text-brand hover:underline">
              Mesafeli Satış Sözleşmesi
            </a>
            &apos;ni inceleyiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">7. İade ve Cayma Hakkı</h2>
          <p>
            6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
            Yönetmeliği kapsamındaki 14 günlük yasal cayma hakkınız saklıdır. Detaylar için:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <a href="/belgeler/mesafeli-satis-sozlesmesi" className="text-brand hover:underline">
                Mesafeli Satış Sözleşmesi
              </a>
            </li>
            <li>
              <a href="/belgeler/on-bilgilendirme-formu" className="text-brand hover:underline">
                Ön Bilgilendirme Formu
              </a>
            </li>
          </ul>
          <p className="mt-2">
            Bu Kullanım Koşulları, yasal tüketici haklarını kısıtlamaz veya ortadan kaldırmaz.
            Herhangi bir çelişki hâlinde tüketici lehine yorum esası uygulanır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">8. Kullanıcı Yükümlülükleri</h2>
          <p>Kullanıcı, siteyi kullanırken:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Yürürlükteki Türk hukukuna ve bu koşullara uymayı,</li>
            <li>Başkalarının haklarını ve gizliliğini ihlal etmemeyi,</li>
            <li>Site altyapısına zarar verecek, aşırı yük oluşturacak veya güvenliği tehdit edecek eylemlerden kaçınmayı,</li>
            <li>Gerçek olmayan sipariş vermemeyi veya sistemleri test amacıyla kullanmamayı,</li>
            <li>Hesap bilgilerini üçüncü kişilerle paylaşmamayı</li>
          </ul>
          <p className="mt-2">kabul eder.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">9. Fikri Mülkiyet</h2>
          <p>
            Sitedeki tüm içerik, logo, görsel, yazılım ve tasarım unsurları AKINEL OTO YEDEK
            PARÇA&apos;ya veya lisans alınan üçüncü taraflara aittir. Yazılı izin alınmaksızın
            ticari amaçla kopyalanamaz, çoğaltılamaz, dağıtılamaz veya uyarlanamaz.
          </p>
          <p className="mt-2">
            Ürün görselleri ve marka adları ilgili üretici veya hak sahiplerine ait olabilir;
            bu materyaller yalnızca bilgi ve satış amaçlı kullanılmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">10. Araç Uyumluluğu ve OEM Numaraları</h2>
          <p>
            Sitede sunulan araç uyumluluk eşleştirmeleri ve OEM parça numaraları mevcut katalog
            verileri doğrultusunda hazırlanmıştır. Bu bilgiler yardımcı nitelikte olup
            araç üreticisi tarafından yapılan değişiklikleri her zaman yansıtmayabilir.
          </p>
          <p className="mt-2">
            Kullanıcının doğru araç bilgisini (marka, model, yıl, motor kodu) seçmesi
            uyumluluk doğruluğu açısından önemlidir. Yanlış araç seçiminden veya yanlış
            OEM numarasından kaynaklanan uyumsuzluk hâllerinde ürünün ayıplı olmadığı kabul
            edilmez; bu durum yasal garanti ve cayma haklarını etkilemez.
          </p>
          <p className="mt-2">
            Uyumluluk konusunda tereddüt yaşıyorsanız sipariş vermeden önce{' '}
            <a href="mailto:info@akinelotoyedekparca.com.tr" className="text-brand hover:underline">
              info@akinelotoyedekparca.com.tr
            </a>{' '}
            adresinden destek alabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">11. Sorumluluk</h2>
          <p>
            AKINEL, makul teknik önlemlere rağmen gerçekleşen geçici erişim kesintilerinden,
            üçüncü taraf içeriklerinden veya mücbir sebeplerden kaynaklanan aksaklıklardan
            sorumlu tutulamaz.
          </p>
          <p className="mt-2">
            Bu madde, tüketicinin ayıplı maldan veya mesafeli satış mevzuatından doğan yasal
            haklarını etkilememektedir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">12. Kişisel Veriler</h2>
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
          <h2 className="text-base font-semibold mb-3">13. Uygulanacak Hukuk ve Uyuşmazlık Çözümü</h2>
          <p>
            Bu Kullanım Koşulları Türk hukukuna tabidir. Tüketici sıfatını taşıyan kullanıcılarla
            ortaya çıkabilecek uyuşmazlıklarda öncelikle Tüketici Hakem Heyetlerine, Tüketici Hakem
            Heyeti yetkisini aşan tutarlarda ise Tüketici Mahkemelerine başvurulabilir. Yetki sınırı
            tutarları her yıl Ticaret Bakanlığı tarafından güncellenmekte olup güncel değerler için
            ilgili resmi duyurular esas alınır.
          </p>
          <p className="mt-2">
            Bu koşullar, tüketicinin emredici mevzuattan doğan haklarını kısıtlamaz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">14. Koşullardaki Değişiklikler</h2>
          <p>
            AKINEL, bu Kullanım Koşullarını önceden duyurarak güncelleme hakkını saklı tutar.
            Güncel koşullar sitede yayımlandığı tarihten itibaren geçerli olur. Değişiklik
            sonrasında siteyi kullanmaya devam etmek, güncel koşulların kabul edildiği anlamına
            gelir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">15. İletişim</h2>
          <p>
            Bu koşullara ilişkin sorularınız için:{' '}
            <a href="mailto:info@akinelotoyedekparca.com.tr" className="text-brand hover:underline">
              info@akinelotoyedekparca.com.tr
            </a>
            {' '}veya{' '}
            <a href="tel:+905394624149" className="text-brand hover:underline">
              +90 539 462 41 49
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
