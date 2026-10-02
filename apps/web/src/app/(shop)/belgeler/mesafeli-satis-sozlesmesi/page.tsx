import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'Mesafeli Satış Sözleşmesi | AKINEL OTO YEDEK PARÇA' },
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Mesafeli Satış Sözleşmesi</h1>
      <p className="text-sm text-muted-foreground mb-2">Son güncelleme: 1 Ekim 2026 — Sürüm 1.0</p>
      <p className="text-sm text-muted-foreground mb-8">
        6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
        kapsamında düzenlenmiştir.
      </p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8 space-y-1">
        <p className="font-semibold">İşletme Sahibine Not — Üretime Geçmeden Önce Tamamlanması Gerekenler:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>
            <strong>Vergi numarası ve vergi dairesi</strong> bilgileri eklenmelidir (fatura düzenleme için zorunludur).
          </li>
          <li>
            <strong>Anlaşmalı iade kargo firması:</strong> Mesafeli Sözleşmeler Yönetmeliği gereğince
            iade sürecinde kullanılacak kargo firması belirlenerek Madde 7.4&apos;teki ilgili alana
            yazılmalıdır. Bu firmayı belirtmeden sözleşmeyi yayınlamak yasal eksiklik oluşturur.
          </li>
          <li>
            <strong>Tahmini teslimat süresi:</strong> Ürün hazırlık ve kargo sürelerine göre belirlenerek
            Madde 5.2&apos;deki alana girilmelidir.
          </li>
          <li>
            <strong>Kredi kartı ödeme altyapısı:</strong> Fiilen entegre edilecek ödeme kuruluşu
            belirlendikten sonra Madde 4.1 güncellenmelidir.
          </li>
          <li>Bu belge hukuki danışmanlık alınarak nihai hâle getirilmelidir; bu metin taslak niteliğindedir.</li>
        </ul>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 1 — Taraflar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded border p-3 space-y-1 text-xs">
              <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Satıcı</p>
              <p><strong>Ticari Unvan:</strong> AKINEL OTO YEDEK PARÇA</p>
              <p><strong>Adres:</strong> Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli, Türkiye</p>
              <p><strong>Telefon:</strong> +90 539 462 41 49</p>
              <p><strong>E-posta:</strong> info@akinelotoyedekparca.com.tr</p>
              <p className="text-amber-700">
                <strong>Vergi No / Dairesi:</strong> [İŞLETME SAHİBİ TARAFINDAN EKLENECEK]
              </p>
            </div>
            <div className="rounded border p-3 space-y-1 text-xs">
              <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Alıcı (Tüketici)</p>
              <p>Sipariş sırasında girilen ad-soyad, e-posta, telefon ve teslimat adresi bilgileri geçerlidir.</p>
              <p className="mt-1 text-muted-foreground">
                Bu bilgiler sipariş onay e-postasında ve hesabınızın sipariş sayfasında yer almaktadır.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 2 — Sözleşmenin Konusu ve Kapsamı</h2>
          <p>
            Bu Mesafeli Satış Sözleşmesi (&ldquo;Sözleşme&rdquo;), Alıcı&apos;nın Satıcı&apos;ya
            ait <strong>https://akinelotoyedekparca.com.tr</strong> adresindeki web sitesi üzerinden
            elektronik ortamda sipariş verdiği otomotiv yedek parçasının/parçalarının satışına ve
            teslimatına ilişkin tarafların hak ve yükümlülüklerini 6502 Sayılı Tüketicinin
            Korunması Hakkında Kanun (&ldquo;TKHK&rdquo;) ve Mesafeli Sözleşmeler Yönetmeliği
            kapsamında düzenler.
          </p>
          <p className="mt-2">
            Sözleşme konusu ürünlerin temel özellikleri, adedi, KDV dahil fiyatı ve kargo bilgileri
            sipariş onay e-postasında ve{' '}
            <a href="/belgeler/on-bilgilendirme-formu" className="text-brand hover:underline">
              Ön Bilgilendirme Formu
            </a>
            &apos;nda yer almaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 3 — Ön Bilgilendirme</h2>
          <p>
            Alıcı, sipariş adımında{' '}
            <a href="/belgeler/on-bilgilendirme-formu" className="text-brand hover:underline">
              Ön Bilgilendirme Formu
            </a>
            &apos;nu okuduğunu ve onayladığını beyan etmektedir. Ön bilgilendirme, bu sözleşmenin
            ayrılmaz bir parçasını oluşturur.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 4 — Ödeme</h2>

          <h3 className="font-medium mt-3 mb-1">4.1 Ödeme Yöntemleri</h3>
          <p>Alıcı aşağıdaki ödeme yöntemlerinden birini seçebilir:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Kredi / Banka Kartı:</strong> Ödeme, sipariş sırasında güvenli HTTPS
              bağlantısı üzerinden tahsil edilir. Kart bilgileri Satıcı sunucularında saklanmaz.
              <span className="text-amber-700 block mt-0.5 text-xs">
                [Entegre edilecek ödeme altyapısı belirlendikten sonra bu alan güncellenecektir.]
              </span>
            </li>
            <li>
              <strong>Banka Havalesi / EFT:</strong> Sipariş onayından sonra gönderilecek
              e-postada hesap bilgileri paylaşılır. Ödeme alındıktan sonra sipariş onaylanır.
            </li>
            <li>
              <strong>Kapıda Ödeme:</strong> Teslimat sırasında nakit veya POS cihazıyla
              ödeme yapılır.
            </li>
          </ul>

          <h3 className="font-medium mt-3 mb-1">4.2 Fiyat ve Vergiler</h3>
          <p>
            Tüm fiyatlar Türk lirası cinsinden ve KDV dahil olarak gösterilir. Kargo ücreti
            ayrıca belirtilir; ücretsiz kargo eşiği uygulanıyorsa sipariş özeti sayfasında
            gösterilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 5 — Teslimat</h2>

          <h3 className="font-medium mt-3 mb-1">5.1 Teslimat Süresi</h3>
          <p>
            Ürün, siparişin onaylanmasından (ödemenin tahsili veya EFT&apos;nin alınmasından)
            itibaren en geç <strong>30 (otuz) gün</strong> içinde teslim edilir.
          </p>
          <div className="mt-2 rounded border-l-4 border-amber-400 pl-3 py-1 text-xs text-amber-700 bg-amber-50">
            Tahmini teslimat süresi: [İŞLETME SAHİBİ TARAFINDAN EKLENECEK — örn. 2–5 iş günü].
            Bu bilgi Ön Bilgilendirme Formu&apos;nda ve sipariş onay e-postasında da gösterilecektir.
          </div>

          <h3 className="font-medium mt-3 mb-1">5.2 Teslimat Koşulları</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Teslimat yalnızca Türkiye&apos;deki adreslere yapılmaktadır.</li>
            <li>
              Teslimat adresi yanlış veya eksik girilmişse oluşan ek nakliye maliyeti Alıcı&apos;ya
              aittir.
            </li>
            <li>
              Kargo takip numarası sipariş kargoya verildikten sonra e-posta ile iletilir.
            </li>
          </ul>

          <h3 className="font-medium mt-3 mb-1">5.3 Teslimat Süresinin Aşılması</h3>
          <p>
            Öngörülemeyen durumlarda teslimat gecikmesi yaşanması hâlinde Alıcı derhal
            bilgilendirilir. Alıcı, bildirimden itibaren ek bir süre tanıyabilir; bu süre
            içinde de teslimat gerçekleşmezse sözleşmeyi feshedebilir. Fesih hâlinde ödenen
            tutar 14 (on dört) gün içinde iade edilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 6 — Satıcı ve Alıcı Yükümlülükleri</h2>

          <h3 className="font-medium mt-3 mb-1">6.1 Satıcı Yükümlülükleri</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sipariş onayı ile birlikte Alıcı&apos;ya onay e-postası göndermek.</li>
            <li>Ürünü ayıpsız, eksiksiz ve sipariş bilgileriyle uyumlu şekilde teslim etmek.</li>
            <li>Cayma hakkı kullanımı hâlinde ürün bedelini mevzuatta öngörülen sürede iade etmek.</li>
            <li>Tüketici mevzuatı kapsamındaki bilgi ve destek yükümlülüklerini yerine getirmek.</li>
          </ul>

          <h3 className="font-medium mt-3 mb-1">6.2 Alıcı Yükümlülükleri</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Doğru ve güncel sipariş ve teslimat bilgisi sağlamak.</li>
            <li>Ödeme yükümlülüğünü yerine getirmek.</li>
            <li>Cayma hakkı kullanılması hâlinde ürünü 10 (on) gün içinde iade etmek.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 7 — Cayma Hakkı</h2>

          <h3 className="font-medium mt-3 mb-1">7.1 Cayma Süresi</h3>
          <p>
            Alıcı, ürünü teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong>{' '}
            içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden
            cayma hakkına sahiptir.
          </p>

          <h3 className="font-medium mt-3 mb-1">7.2 Cayma Bildiriminin Yapılması</h3>
          <p>
            Cayma hakkını kullanmak için 14 günlük süre dolmadan aşağıdaki kanallardan biri
            aracılığıyla Satıcı&apos;ya açık bir beyanda bulunulması yeterlidir:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>E-posta:</strong>{' '}
              <a href="mailto:info@akinelotoyedekparca.com.tr" className="text-brand hover:underline">
                info@akinelotoyedekparca.com.tr
              </a>{' '}
              (konu: &ldquo;Cayma Hakkı Bildirimi — Sipariş No: [Sipariş Numaranız]&rdquo;)
            </li>
            <li>
              <strong>Yazılı posta:</strong> Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli
            </li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Siteye üye girişi ile verilen siparişlerde online iade talebi özelliği henüz
            uygulamada mevcut değildir; lütfen yukarıdaki kanalları kullanınız.
          </p>

          <h3 className="font-medium mt-3 mb-1">7.3 Ürünün İadesi</h3>
          <p>
            Cayma bildiriminin ardından Alıcı, ürünü <strong>10 (on) gün</strong> içinde
            iade etmek zorundadır. Ürün, orijinal ambalajı ve varsa aksesuarlarıyla eksiksiz
            iade edilmelidir.
          </p>

          <h3 className="font-medium mt-3 mb-1">7.4 İade Kargo Firması ve Masrafları</h3>
          <div className="rounded border-l-4 border-amber-400 pl-3 py-2 text-amber-700 bg-amber-50 text-xs mt-2">
            <p className="font-semibold">İŞLETME SAHİBİNE NOT:</p>
            <p className="mt-0.5">
              Mesafeli Sözleşmeler Yönetmeliği gereğince Satıcının, Ön Bilgilendirme Formu ve
              Mesafeli Satış Sözleşmesi&apos;nde anlaşmalı iade kargo firmasını açıkça belirtmesi
              zorunludur. Kargo firması henüz belirlenmemiş olduğundan aşağıdaki metin
              tamamlanmadan bu belge yayınlanmamalıdır.
            </p>
          </div>
          <p className="mt-3">
            Satıcı&apos;nın iade için anlaşmalı kargo firması:{' '}
            <strong className="text-amber-700">[ANLAŞMALI KARGO FİRMASI — İŞLETME SAHİBİ TARAFINDAN EKLENECEK]</strong>
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Alıcı iade gönderimini yukarıda belirtilen anlaşmalı kargo firmasıyla yaparsa
              iade kargo ücreti <strong>Satıcı</strong> tarafından karşılanır.
            </li>
            <li>
              Alıcı farklı bir kargo firması kullanırsa, anlaşmalı kargo firması ücreti ile
              seçilen firmanın ücreti arasındaki fark <strong>Alıcı</strong>&apos;ya aittir.
            </li>
            <li>
              Anlaşmalı kargo firmasının Alıcı&apos;nın bulunduğu yerde şubesi veya
              teslim/teslim al noktası bulunmaması hâlinde iade kargo ücreti <strong>Satıcı</strong>{' '}
              tarafından karşılanır.
            </li>
          </ul>

          <h3 className="font-medium mt-3 mb-1">7.5 İadede Ürünün Durumu</h3>
          <p>
            Cayma hakkı kapsamında iade edilen ürünlerde Alıcı, olağan kullanım nedeniyle
            oluşan değer kayıplarından sorumlu tutulmaz. Ancak ürünün mutat kullanım dışında
            kullanılmasından kaynaklanan değer azalması Alıcı&apos;ya yansıtılabilir.
          </p>

          <h3 className="font-medium mt-3 mb-1">7.6 İade Ödemesi</h3>
          <p>
            Satıcı, cayma bildiriminin ulaşmasından sonra ürünü teslim aldığında veya iade
            gönderiminin yapıldığına dair kanıt sunulduğunda (hangisi önce gerçekleşirse)
            en geç <strong>14 (on dört) gün</strong> içinde tahsil ettiği tüm tutarı (varsa
            standart kargo ücreti dahil) Alıcı&apos;nın ödeme yöntemiyle iade eder.
          </p>
          <p className="mt-2">
            Havale/EFT ile yapılan ödemeler, Alıcı&apos;nın iade için bildireceği IBAN&apos;a
            aktarılır.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 8 — Cayma Hakkının İstisnaları</h2>
          <p>
            Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi kapsamında aşağıdaki durumlarda
            cayma hakkı kullanılamaz:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              Tüketicinin istekleri veya açıkça kişisel ihtiyaçları doğrultusunda hazırlanan,
              standart üretim dışında özelleştirilen ürünler.
            </li>
            <li>
              Teslimden sonra başka ürünlerle karışması nedeniyle ayrıştırılması mümkün olmayan
              ürünler.
            </li>
          </ul>
          <p className="mt-2">
            Standart (seri üretim) otomotiv yedek parçaları, olağan cayma hakkı kapsamındadır.
            Parçanın araçta kullanılmış olması hâlinde ürünün değer kaybı yukarıdaki Madde
            7.5 kapsamında değerlendirilir; bu durum cayma hakkını tek başına ortadan kaldırmaz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 9 — Ayıplı Mal ve Garanti</h2>
          <p>
            TKHK&apos;nın 8–11. maddeleri kapsamında Alıcı, teslim tarihinden itibaren
            <strong> 2 (iki) yıl</strong> boyunca ayıplı mala ilişkin yasal haklarını
            kullanabilir:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Sözleşmeden dönme (bedel iadesi),</li>
            <li>Ayıpsız misliyle değiştirme,</li>
            <li>Ücretsiz onarım,</li>
            <li>Bedelden indirim.</li>
          </ul>
          <p className="mt-2">
            Teslimden itibaren ilk 6 ay içinde ortaya çıkan ayıplar aksi ispatlanmadıkça
            teslim anında mevcut sayılır.
          </p>
          <p className="mt-2">
            Ürünün araç uyumsuzluğundan kaynaklanan arızası, ürünün ayıplı olduğu anlamına
            gelmez. Uyumsuzluk iddiaları Madde 6 (Kullanım Koşulları Madde 10) kapsamında
            değerlendirilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 10 — Mücbir Sebep</h2>
          <p>
            Deprem, sel, salgın hastalık, grev, hükümet kararları veya benzeri kontrol dışı
            olaylar nedeniyle yükümlülüklerin yerine getirilmesi engellenirse, etkilenen taraf
            diğer tarafı derhal bilgilendirir. Mücbir sebep süresi boyunca yükümlülükler
            askıya alınır. 30 günü aşması hâlinde taraflar sözleşmeyi feshedebilir; ödenen
            tutar iade edilir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 11 — Kişisel Verilerin Korunması</h2>
          <p>
            Alıcı&apos;nın kişisel verileri KVKK kapsamında işlenmektedir. Ayrıntılar için:
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
          <h2 className="text-base font-semibold mb-3">Madde 12 — Uyuşmazlık Çözümü</h2>
          <p>
            Bu Sözleşme Türk hukukuna tabidir. Taraflar arasında doğabilecek uyuşmazlıklarda
            öncelikle Tüketici Hakem Heyetlerine başvurulabilir. Tüketici Hakem Heyeti&apos;nin
            parasal yetki sınırını aşan tutarlarda Tüketici Mahkemeleri yetkilidir. Yetki
            sınırı tutarları Ticaret Bakanlığı tarafından her yıl güncellenmektedir; güncel
            değerler için ilgili resmi duyurular esas alınır.
          </p>
          <p className="mt-2">
            Şikâyetlerinizi ayrıca{' '}
            <a href="mailto:info@akinelotoyedekparca.com.tr" className="text-brand hover:underline">
              info@akinelotoyedekparca.com.tr
            </a>{' '}
            adresine de iletebilirsiniz.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">Madde 13 — Sözleşmenin Yürürlüğe Girmesi</h2>
          <p>
            Bu Sözleşme, Alıcı&apos;nın sipariş onayını tamamladığı (ödeme/onay adımındaki
            zorunlu onay kutucuklarını işaretleyip siparişi onayladığı) anda yürürlüğe girer.
            Onay zaman damgası sipariş kaydına işlenir.
          </p>
        </section>

      </div>
    </div>
  );
}
