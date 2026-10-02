import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Gizlilik Politikası | AKINEL OTO YEDEK PARÇA' },
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Gizlilik Politikası</h1>
      <p className="text-sm text-muted-foreground mb-2">Son güncelleme: 1 Ekim 2026 — Sürüm 1.0</p>
      <p className="text-sm text-muted-foreground mb-8">
        6698 Sayılı Kişisel Verilerin Korunması Kanunu ve ilgili mevzuat kapsamında hazırlanmıştır.
      </p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8 space-y-1">
        <p className="font-semibold">İşletme Sahibine Not — Üretime Geçmeden Önce Tamamlanması Gerekenler:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Vergi numarası ve vergi dairesi bilgileri eklenmelidir.</li>
          <li>MERSİS numarası ve ticaret sicil numarası eklenmelidir.</li>
          <li>Anlaşmalı iade kargo firması belirlenerek belgeye yansıtılmalıdır.</li>
          <li>Fiilen entegre edilen ödeme altyapısı (ödeme kuruluşu/banka) belirlendikten sonra ilgili bölüm güncellenmelidir.</li>
          <li>Bu belge hukuki danışmanlık alınarak nihai hâle getirilmelidir; bu metin taslak niteliğindedir.</li>
        </ul>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-3">1. Veri Sorumlusu</h2>
          <p>
            Bu Gizlilik Politikası, <strong>AKINEL OTO YEDEK PARÇA</strong> ticari unvanlı işletme
            tarafından işletilen{' '}
            <strong>https://akinelotoyedekparca.com.tr</strong> adresindeki web sitesine ilişkindir.
          </p>
          <div className="mt-3 rounded border p-3 space-y-0.5 text-xs bg-muted/40">
            <p><strong>İşletme Adı:</strong> AKINEL OTO YEDEK PARÇA</p>
            <p><strong>Adres:</strong> Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli, Türkiye</p>
            <p><strong>Telefon:</strong> +90 539 462 41 49</p>
            <p><strong>E-posta:</strong> info@akinelotoyedekparca.com.tr</p>
            <p className="text-amber-700"><strong>Vergi No / Vergi Dairesi:</strong> [İŞLETME SAHİBİ TARAFINDAN EKLENECEK]</p>
            <p className="text-amber-700"><strong>MERSİS No:</strong> [İŞLETME SAHİBİ TARAFINDAN EKLENECEK]</p>
          </div>
          <p className="mt-3">
            Kişisel verileriniz bakımından 6698 Sayılı Kişisel Verilerin Korunması Kanunu
            (&ldquo;KVKK&rdquo;) uyarınca veri sorumlusu sıfatını taşıyan bu işletme, söz konusu
            kanun kapsamındaki yükümlülüklerini yerine getirmeyi taahhüt eder. Bu Gizlilik
            Politikası ile KVKK&apos;nın 10. maddesi çerçevesinde hazırlanan{' '}
            <a href="/belgeler/kvkk-aydinlatma-metni" className="text-brand hover:underline">
              KVKK Aydınlatma Metni
            </a>{' '}
            birlikte okunmalıdır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">2. Hangi Kişisel Veriler İşlenmektedir?</h2>
          <p className="mb-3">
            Web sitemizi kullanmanız, üye olmanız, sipariş vermeniz veya bizimle iletişime
            geçmeniz durumunda aşağıdaki kişisel veri kategorileri işlenebilir:
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">2.1 Kimlik ve İletişim Bilgileri</h3>
              <p>
                Ad, soyad; e-posta adresi; telefon numarası; teslimat adresi (ilçe, şehir, posta
                kodu dahil). Bu bilgiler üyelik kaydı ve sipariş sürecinde tarafınızdan
                sağlanmaktadır.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">2.2 Araç Bilgileri (Garaj / Araç Seçici)</h3>
              <p>
                Sitenin araç uyumluluk özelliğini kullandığınızda seçtiğiniz araç markası, modeli,
                yılı ve motor kodu bilgileri. Bu bilgiler tarayıcının yerel depolama alanında
                (localStorage) saklanmakta; sunucuya kaydedilmesi durumunda hesabınızla
                ilişkilendirilmektedir.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">2.3 Sipariş ve İşlem Bilgileri</h3>
              <p>
                Sipariş numarası, sipariş edilen ürünler, miktarlar, birim ve toplam fiyatlar,
                ödeme yöntemi (kredi kartı, havale/EFT, kapıda ödeme). Kart numarası veya banka
                hesap bilgisi tarafımızca saklanmamaktadır; ödeme işlemleri bağımsız ödeme
                altyapısı üzerinden gerçekleştirilir.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">2.4 Teknik ve Log Verileri</h3>
              <p>
                IP adresi, tarayıcı türü ve sürümü, işletim sistemi, ziyaret edilen sayfalar,
                ziyaret süresi, oturum bilgileri. Bu veriler ağ altyapısı ve sunucu günlükleri
                aracılığıyla otomatik olarak kaydedilmektedir.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">2.5 Sepet / Oturum Bilgileri</h3>
              <p>
                Siteye giriş yapmadan sepete eklenen ürünleri takip etmek amacıyla tarayıcınıza
                bir oturum tanımlama bilgisi (<em>basket_session</em> çerezi) yerleştirilmektedir.
                Bu çerez yalnızca sepeti kimlik doğrulamasına gerek kalmaksızın hatırlamak için
                kullanılmakta olup sepet içeriğini ürün id ve miktarlarıyla birlikte sunucumuzda
                geçici olarak saklamaktadır.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">2.6 İletişim Formu Bilgileri</h3>
              <p>
                Müşteri hizmetleriyle e-posta, telefon veya WhatsApp aracılığıyla iletişime
                geçmeniz hâlinde ilettiğiniz bilgiler.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">2.7 Pazarlama Tercihleri</h3>
              <p>
                Ödeme adımında isteğe bağlı olarak verilen ticari elektronik ileti izni (e-posta,
                SMS vb. ile kampanya ve indirim bildirimleri). Bu onay, satın alma işleminin
                zorunlu koşulu değildir.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Sipariş ve teslimat süreçleri:</strong> Siparişin alınması, onaylanması,
              hazırlanması, kargoya verilmesi ve takibinin sağlanması.
            </li>
            <li>
              <strong>Fatura ve muhasebe:</strong> Yasal fatura düzenleme yükümlülüğünün yerine
              getirilmesi ve vergi mevzuatına uyumluluk.
            </li>
            <li>
              <strong>Müşteri hesabı yönetimi:</strong> Üyelik kaydının oluşturulması,
              güncellenmesi ve yönetilmesi.
            </li>
            <li>
              <strong>Araç uyumlu ürün önerisi:</strong> Seçtiğiniz araç bilgisine göre uyumlu
              yedek parçaların listelenmesi.
            </li>
            <li>
              <strong>Müşteri hizmetleri:</strong> Şikâyet, iade ve destek taleplerinizin
              yanıtlanması.
            </li>
            <li>
              <strong>Site güvenliği ve hata giderme:</strong> Yetkisiz erişim, dolandırıcılık ve
              sistem hatalarının tespiti ile engellenmesi.
            </li>
            <li>
              <strong>Yasal yükümlülükler:</strong> Tüketici mevzuatı, vergi hukuku ve diğer
              ilgili mevzuat kapsamındaki kayıt tutma ve raporlama yükümlülükleri.
            </li>
            <li>
              <strong>Ticari elektronik ileti:</strong> Yalnızca açık rızanızın bulunması hâlinde
              kampanya, indirim ve haber bildirimleri.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">4. İşlemenin Hukuki Dayanakları</h2>
          <p className="mb-3">
            Kişisel verileriniz KVKK&apos;nın 5. maddesi kapsamında aşağıdaki hukuki dayanaklar
            çerçevesinde işlenmektedir:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-border">
              <thead className="bg-muted">
                <tr>
                  <th className="border border-border px-3 py-2 text-left font-semibold">İşleme Faaliyeti</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Hukuki Dayanak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="border border-border px-3 py-2">Sipariş oluşturma, teslimat, müşteri hesabı</td>
                  <td className="border border-border px-3 py-2">Sözleşmenin kurulması veya ifası — m. 5/2-c</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Fatura düzenleme, yasal kayıt tutma, vergi mevzuatı</td>
                  <td className="border border-border px-3 py-2">Kanunlarda açıkça öngörülmüş olma — m. 5/2-ç</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Site güvenliği, log kayıtları, hata takibi</td>
                  <td className="border border-border px-3 py-2">Meşru menfaat — m. 5/2-f</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Araç uyumluluk önerisi, sepet oturumu</td>
                  <td className="border border-border px-3 py-2">Sözleşmenin ifası veya meşru menfaat — m. 5/2-c / 5/2-f</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Pazarlama iletişimi (e-posta, SMS kampanya)</td>
                  <td className="border border-border px-3 py-2">Açık rıza — m. 5/1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">4a. Üçüncü Taraf API Hizmetleri — VIN/Şasi Sorgulama</h2>
          <p className="mb-2">
            Web sitemizin VIN (araç kimlik numarası) sorgulama özelliği kullanıldığında, girilen
            VIN numarası ABD Ulusal Karayolu Trafik Güvenliği İdaresi&apos;nin (&ldquo;NHTSA&rdquo;)
            kamuya açık veri API&apos;sine iletilmektedir:{' '}
            <strong>vpic.nhtsa.dot.gov</strong>. Bu servis araç tipi, marka, model ve motor
            bilgilerini döndürmek amacıyla kullanılmaktadır.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>NHTSA, ABD federal hükümetine bağlı bir kuruluştur; verilen VIN numarası bu kuruluşun sunucularına iletilir.</li>
            <li>VIN numaranız sunucularımızda saklanmaz; yalnızca anlık araç bilgisi sorgusu için kullanılır.</li>
            <li>
              NHTSA&apos;nın gizlilik politikası için{' '}
              <a
                href="https://www.nhtsa.gov/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline"
              >
                nhtsa.gov/privacy-policy
              </a>{' '}
              adresini ziyaret edebilirsiniz.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">5. Kişisel Verilerin Aktarılması</h2>
          <p className="mb-3">
            Kişisel verileriniz KVKK&apos;nın 8. ve 9. maddeleri kapsamında aşağıdaki kategorilere
            aktarılabilir:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Kargo ve lojistik hizmet sağlayıcıları:</strong> Siparişinizin teslimatını
              gerçekleştirmek amacıyla ad-soyad, teslimat adresi ve telefon bilginiz. Kullandığımız
              kargo firmaları KVKK kapsamındaki veri güvenliği yükümlülüklerine tabidir.
            </li>
            <li>
              <strong>Ödeme altyapısı sağlayıcısı:</strong> Kredi kartı ile yapılan ödemelerde
              ödeme işlemini gerçekleştiren kuruluş. Kart bilgileriniz doğrudan bu kuruluşa iletilir;
              kart numarası sunucularımızda saklanmaz.
              <span className="text-amber-700 block mt-0.5">
                [Fiilen kullanılacak ödeme altyapısı belirlendikten sonra burası güncellenecektir.]
              </span>
            </li>
            <li>
              <strong>Yetkili kamu kurumları ve yargı mercileri:</strong> Yasal zorunluluk veya
              mahkeme kararı hâlinde ilgili mevzuat kapsamında.
            </li>
            <li>
              <strong>Muhasebe / mali müşavir:</strong> Fatura ve muhasebe kayıtlarının tutulması
              amacıyla.
            </li>
          </ul>
          <p className="mt-3">
            Verileriniz, bu amaçların dışında üçüncü kişilere satılmaz, kiralanmaz veya
            herhangi bir ticari amaçla devredilmez.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">6. Saklama Süreleri</h2>
          <p className="mb-2">
            Kişisel verileriniz, ilgili mevzuatta öngörülen süreler veya işleme amacının gerektirdiği
            süre boyunca saklanır; bu süreler geçtikten sonra silinir, yok edilir veya anonim hâle
            getirilir.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Sipariş ve fatura kayıtları: Vergi ve ticaret hukuku kapsamında en az 10 yıl.
            </li>
            <li>
              Üyelik bilgileri: Üyeliğin sona ermesinden itibaren yasal yükümlülük süresince,
              en fazla 10 yıl.
            </li>
            <li>
              Log ve teknik veriler: Güvenlik gerekliliklerine göre, genellikle 1–2 yıl.
            </li>
            <li>
              Oturum çerezi (sepet): Çerez oluşturulmasından itibaren 30 gün veya oturum
              kapatılmasına kadar.
            </li>
            <li>
              Pazarlama iletişim tercihleri: Rıza geri alınana veya üyelik sona erene kadar.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">7. Çerezler ve Yerel Depolama</h2>
          <p className="mb-3">
            Web sitemizde kullanılan tanımlama bilgileri (çerezler) ve tarayıcı depolama
            mekanizmaları aşağıda açıklanmaktadır:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-border">
              <thead className="bg-muted">
                <tr>
                  <th className="border border-border px-3 py-2 text-left font-semibold">İsim / Mekanizma</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Amaç</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Tür</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Süre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="border border-border px-3 py-2 font-mono">basket_session</td>
                  <td className="border border-border px-3 py-2">
                    Üye olmayan kullanıcıların sepetini oturum boyunca hatırlamak için benzersiz
                    oturum kimliği saklar. HttpOnly olduğundan JavaScript erişimi yoktur.
                  </td>
                  <td className="border border-border px-3 py-2">Zorunlu — 1. taraf çerez</td>
                  <td className="border border-border px-3 py-2">30 gün</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 font-mono">akinel-auth<br />(localStorage)</td>
                  <td className="border border-border px-3 py-2">
                    Giriş yapan üyelerin kimlik doğrulama bilgisini (erişim jetonu ve kullanıcı
                    bilgisi) tarayıcıda saklar. Sunucuyla yapılan her istekte kimlik
                    doğrulaması için kullanılır.
                  </td>
                  <td className="border border-border px-3 py-2">Zorunlu — 1. taraf yerel depolama</td>
                  <td className="border border-border px-3 py-2">Oturum boyunca / çıkış yapılana kadar</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 font-mono">vehicle-context<br />(localStorage)</td>
                  <td className="border border-border px-3 py-2">
                    Araç seçici üzerinden seçilen araç bilgisini (marka, model, motor) tarayıcıda
                    saklar; sayfa yenilenmesinde araç bağlamını korur.
                  </td>
                  <td className="border border-border px-3 py-2">İşlevsel — 1. taraf yerel depolama</td>
                  <td className="border border-border px-3 py-2">Kullanıcı silene veya tarayıcı temizlenene kadar</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Web sitemizde şu an itibarıyla Google Analytics, Meta Pixel veya benzeri üçüncü taraf
            analitik ya da reklam çerezleri kullanılmamaktadır. Bu durum değişirse politika
            güncellenerek bildirim yapılacaktır.
          </p>
          <p className="mt-2">
            Tarayıcı ayarlarınızdan çerezleri reddedebilir veya silebilirsiniz; ancak bu durumda
            sepet işlevselliği düzgün çalışmayabilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">8. Ticari Elektronik İletiler</h2>
          <p>
            Kampanya, indirim ve haber bildirimleri yalnızca ödeme adımında sunulan isteğe bağlı
            pazarlama onay kutucuğunu işaretleyen müşterilere gönderilir. Bu onay satın alma
            işleminin zorunlu koşulu değildir. Siparişe ilişkin zorunlu bildirimler (sipariş
            onayı, kargo takip bilgisi, iade güncellemesi) onay gerektirmeksizin iletilir;
            bu bildirimler ticari elektronik ileti niteliği taşımaz.
          </p>
          <p className="mt-2">
            Pazarlama iletişimini durdurmak için destek e-postamıza yazabilir veya bildirimlerdeki
            abonelik iptal bağlantısını kullanabilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">9. Güvenlik</h2>
          <p>
            Kişisel verilerinizin yetkisiz erişime, ifşaya, değiştirilmesine veya imhasına karşı
            korunması amacıyla teknik ve idari tedbirler uygulanmaktadır. Ödeme sayfası HTTPS
            protokolüyle şifrelenmiş bağlantı üzerinden çalışmaktadır. Sunucu kayıt verileri
            (log) güvenli ortamda saklanmakta ve yetkisiz erişime karşı korunmaktadır.
            Bununla birlikte internet ortamında %100 güvenlik sağlanamayacağını belirtmek
            gerekir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">10. Haklarınız</h2>
          <p className="mb-2">
            KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmiş ise buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmiş ise düzeltilmesini isteme</li>
            <li>Silinmesini veya yok edilmesini isteme</li>
            <li>Düzeltme veya silme işleminin aktarılan üçüncü kişilere bildirilmesini isteme</li>
            <li>
              Münhasıran otomatik sistemler vasıtasıyla analiz edilmesi sonucu aleyhinize bir
              sonucun ortaya çıkmasına itiraz etme
            </li>
            <li>Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
          </ul>
          <p className="mt-3">
            Taleplerinizi{' '}
            <strong>info@akinelotoyedekparca.com.tr</strong> adresine e-posta ile veya aşağıdaki
            adrese yazılı olarak iletebilirsiniz. Başvurular en geç 30 (otuz) gün içinde
            yanıtlanır.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli, Türkiye
          </p>
          <p className="mt-2">
            Ayrıntılı bilgi için{' '}
            <a href="/belgeler/kvkk-aydinlatma-metni" className="text-brand hover:underline">
              KVKK Aydınlatma Metni
            </a>
            &apos;ni inceleyiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">11. Bu Politikadaki Değişiklikler</h2>
          <p>
            Bu Gizlilik Politikası zaman zaman güncellenebilir. Önemli değişiklikler yapılması
            hâlinde site üzerinden duyuru yapılır ve politikanın üst kısmındaki güncelleme tarihi
            revize edilir. Değişiklikler yayımlandığı andan itibaren geçerli olur.
          </p>
        </section>

      </div>
    </div>
  );
}
