import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | AKINEL OTO YEDEK PARÇA',
};

export default function KvkkAydinlatmaMetniPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">KVKK Aydınlatma Metni</h1>
      <p className="text-sm text-muted-foreground mb-2">
        6698 Sayılı Kişisel Verilerin Korunması Kanunu Madde 10 Kapsamında Aydınlatma Metni
      </p>
      <p className="text-sm text-muted-foreground mb-8">Son güncelleme: 1 Ekim 2026 — Sürüm 1.0</p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8 space-y-1">
        <p className="font-semibold">İşletme Sahibine Not — Üretime Geçmeden Önce Tamamlanması Gerekenler:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Vergi numarası ve vergi dairesi bilgileri eklenmelidir.</li>
          <li>MERSİS numarası ve ticaret sicil numarası eklenmelidir.</li>
          <li>Fiilen kullanılan ödeme altyapısı/kargo firmaları belirlendikten sonra aktarım bölümleri güncellenmelidir.</li>
          <li>KVKK kapsamında Kişisel Veri İşleme Envanteri (VERBİS) yükümlülüğü değerlendirilmelidir.</li>
          <li>Bu belge hukuki danışmanlık alınarak nihai hâle getirilmelidir; bu metin taslak niteliğindedir.</li>
        </ul>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-3">Veri Sorumlusu Kimliği ve İletişim Bilgileri</h2>
          <p className="mb-3">
            6698 Sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca kişisel
            verileriniz, aşağıda kimlik ve iletişim bilgileri verilen veri sorumlusu tarafından
            işlenmektedir:
          </p>
          <div className="rounded border p-3 space-y-0.5 text-xs bg-muted/40">
            <p><strong>Ticari Unvan:</strong> AKINEL OTO YEDEK PARÇA</p>
            <p><strong>Adres:</strong> Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli, Türkiye</p>
            <p><strong>Telefon:</strong> +90 539 462 41 49</p>
            <p><strong>E-posta:</strong> info@akinelotoyedekparca.com.tr</p>
            <p className="text-amber-700"><strong>Vergi No / Vergi Dairesi:</strong> [İŞLETME SAHİBİ TARAFINDAN EKLENECEK]</p>
            <p className="text-amber-700"><strong>MERSİS No:</strong> [İŞLETME SAHİBİ TARAFINDAN EKLENECEK]</p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">1. İşlenen Kişisel Veri Kategorileri, Amaçları ve Hukuki Dayanakları</h2>
          <p className="mb-3">
            Aşağıdaki tablo, hangi kişisel veri kategorilerinin, hangi amaçla ve hangi hukuki
            dayanak kapsamında işlendiğini göstermektedir. KVKK&apos;nın 5. maddesinde yer alan
            hukuki dayanak kodları şu anlama gelir:
          </p>
          <ul className="list-disc pl-5 mb-3 space-y-0.5 text-xs text-muted-foreground">
            <li><strong>m. 5/2-c —</strong> Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olma</li>
            <li><strong>m. 5/2-ç —</strong> Veri sorumlusunun hukuki yükümlülüğünü yerine getirmesi</li>
            <li><strong>m. 5/2-f —</strong> İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaat</li>
            <li><strong>m. 5/1 —</strong> İlgili kişinin açık rızası</li>
          </ul>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-border">
              <thead className="bg-muted">
                <tr>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Veri Kategorisi</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">İçerdiği Veriler</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">İşleme Amacı</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Hukuki Dayanak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="border border-border px-3 py-2 align-top font-medium">Kimlik</td>
                  <td className="border border-border px-3 py-2 align-top">Ad, soyad</td>
                  <td className="border border-border px-3 py-2 align-top">Sipariş oluşturma, fatura düzenleme, müşteri kaydı, kargo teslimi</td>
                  <td className="border border-border px-3 py-2 align-top">m. 5/2-c (sözleşme ifası), m. 5/2-ç (yasal yükümlülük)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 align-top font-medium">İletişim</td>
                  <td className="border border-border px-3 py-2 align-top">E-posta, telefon numarası, teslimat adresi</td>
                  <td className="border border-border px-3 py-2 align-top">Sipariş bildirimi, kargo takip bilgisi iletimi, müşteri desteği, fatura adresi</td>
                  <td className="border border-border px-3 py-2 align-top">m. 5/2-c (sözleşme ifası)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 align-top font-medium">Araç bilgileri</td>
                  <td className="border border-border px-3 py-2 align-top">Araç markası, modeli, yılı, motor kodu (garaj/araç seçici)</td>
                  <td className="border border-border px-3 py-2 align-top">Araç uyumlu parça listeleme ve önerisi</td>
                  <td className="border border-border px-3 py-2 align-top">m. 5/2-c (hizmet ifası) / m. 5/2-f (meşru menfaat)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 align-top font-medium">İşlem / sipariş</td>
                  <td className="border border-border px-3 py-2 align-top">Sipariş numarası, ürün bilgileri, miktarlar, fiyat, ödeme yöntemi, kargo notu, yasal onay zaman damgası</td>
                  <td className="border border-border px-3 py-2 align-top">Sipariş yönetimi, muhasebe ve fatura kaydı, mesafeli satış mevzuatı kapsamındaki yükümlülükler, uyuşmazlık kaydı</td>
                  <td className="border border-border px-3 py-2 align-top">m. 5/2-c (sözleşme ifası), m. 5/2-ç (yasal yükümlülük)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 align-top font-medium">Teknik / log verileri</td>
                  <td className="border border-border px-3 py-2 align-top">IP adresi, tarayıcı türü, işletim sistemi, ziyaret zamanı, sayfa log kayıtları</td>
                  <td className="border border-border px-3 py-2 align-top">Site güvenliğinin sağlanması, yetkisiz erişimin tespiti, hata giderme</td>
                  <td className="border border-border px-3 py-2 align-top">m. 5/2-f (meşru menfaat)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 align-top font-medium">Sepet / oturum</td>
                  <td className="border border-border px-3 py-2 align-top">Anonim oturum kimliği (<em>basket_session</em> çerezi) ve sepetin ürün/miktar içeriği</td>
                  <td className="border border-border px-3 py-2 align-top">Üye olmayan kullanıcıların sepetini taşıma</td>
                  <td className="border border-border px-3 py-2 align-top">m. 5/2-f (meşru menfaat — zorunlu teknik işlev)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2 align-top font-medium">Pazarlama tercihleri</td>
                  <td className="border border-border px-3 py-2 align-top">Ticari elektronik ileti onayı ve zaman damgası</td>
                  <td className="border border-border px-3 py-2 align-top">Kampanya, indirim ve haber bildirimleri (yalnızca onay veren kullanıcılara)</td>
                  <td className="border border-border px-3 py-2 align-top">m. 5/1 (açık rıza)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">2. Kişisel Verilerin Toplanma Yöntemi</h2>
          <p>
            Kişisel verileriniz aşağıdaki yöntemler aracılığıyla elektronik ortamda toplanmaktadır:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Web sitesi üzerindeki üyelik kayıt formu</li>
            <li>Sipariş ve ödeme formu (ödeme adımında girilen bilgiler)</li>
            <li>Araç seçici ve garaj özelliği</li>
            <li>Tarayıcı çerezi (<em>basket_session</em>) ve tarayıcı yerel depolaması</li>
            <li>Sunucu ve uygulama log kayıtları (otomatik teknik veri)</li>
            <li>E-posta, telefon ve WhatsApp aracılığıyla müşteri iletişimi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">3. Kişisel Verilerin Aktarıldığı Kişi ve Kurum Kategorileri</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">3.1 Yurt İçi Aktarımlar</h3>
              <p>Kişisel verileriniz, KVKK&apos;nın 8. maddesi kapsamında aşağıdaki alıcı kategorilerine aktarılabilir:</p>
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-xs border-collapse border border-border">
                  <thead className="bg-muted">
                    <tr>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Alıcı Kategorisi</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Aktarılan Veri</th>
                      <th className="border border-border px-3 py-2 text-left font-semibold">Aktarım Amacı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="border border-border px-3 py-2">Kargo / lojistik firması</td>
                      <td className="border border-border px-3 py-2">Ad-soyad, telefon, teslimat adresi, sipariş bilgisi</td>
                      <td className="border border-border px-3 py-2">Teslimatın gerçekleştirilmesi</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">Ödeme altyapısı sağlayıcısı</td>
                      <td className="border border-border px-3 py-2">Ad-soyad, sipariş tutarı, ödeme yöntemi</td>
                      <td className="border border-border px-3 py-2">Ödeme işleminin gerçekleştirilmesi</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">Muhasebe / mali müşavir</td>
                      <td className="border border-border px-3 py-2">Fatura bilgileri (ad-soyad, adres, sipariş tutarı)</td>
                      <td className="border border-border px-3 py-2">Muhasebe ve vergi yükümlülükleri</td>
                    </tr>
                    <tr>
                      <td className="border border-border px-3 py-2">Yetkili kamu kurumları ve yargı mercileri</td>
                      <td className="border border-border px-3 py-2">Talep edilen veri</td>
                      <td className="border border-border px-3 py-2">Yasal zorunluluk ve mahkeme kararları</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-1">3.2 Yurt Dışı Aktarımlar</h3>
              <p>
                Şu an itibarıyla kişisel verileriniz yurt dışına aktarılmamaktadır. Gelecekte
                bir yurt dışı aktarım gerçekleşmesi hâlinde KVKK&apos;nın 9. maddesi kapsamındaki
                koşullar sağlanacak ve bu metin güncellenecektir.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">4. Verilerin Saklanma Süreleri</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-border">
              <thead className="bg-muted">
                <tr>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Veri / Kayıt Türü</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Saklama Süresi</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Dayanak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="border border-border px-3 py-2">Sipariş, fatura ve muhasebe kayıtları</td>
                  <td className="border border-border px-3 py-2">En az 10 yıl</td>
                  <td className="border border-border px-3 py-2">Vergi Usul Kanunu, Türk Ticaret Kanunu</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Üyelik ve iletişim bilgileri</td>
                  <td className="border border-border px-3 py-2">Üyelik sona erene kadar + yasal süre (en fazla 10 yıl)</td>
                  <td className="border border-border px-3 py-2">Sözleşme ifası, ticaret hukuku</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Yasal onay (cayma, mesafeli satış)</td>
                  <td className="border border-border px-3 py-2">En az 3 yıl</td>
                  <td className="border border-border px-3 py-2">6502 TKHK, Mesafeli Sözleşmeler Yönetmeliği</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Log ve teknik veriler</td>
                  <td className="border border-border px-3 py-2">1–2 yıl</td>
                  <td className="border border-border px-3 py-2">5651 Sayılı Kanun ve ilgili tebliğler</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Oturum çerezi (basket_session)</td>
                  <td className="border border-border px-3 py-2">30 gün (çerez ömrü)</td>
                  <td className="border border-border px-3 py-2">Teknik gereklilik</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Pazarlama onayı ve tercihleri</td>
                  <td className="border border-border px-3 py-2">Rıza geri alınana kadar</td>
                  <td className="border border-border px-3 py-2">6563 Sayılı Kanun</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">5. KVKK Kapsamındaki Haklarınız</h2>
          <p className="mb-2">
            KVKK&apos;nın 11. maddesi uyarınca kişisel verilerinize ilişkin aşağıdaki haklara sahipsiniz:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>KVKK&apos;nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
            <li>
              Düzeltme veya silme işlemlerinin, kişisel verilerinizin aktarıldığı üçüncü kişilere
              bildirilmesini isteme
            </li>
            <li>
              İşlenen verilerinizin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi
              suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
            </li>
            <li>
              Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız
              hâlinde zararın giderilmesini talep etme
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-3">6. Haklarınızı Nasıl Kullanabilirsiniz?</h2>
          <p>
            Yukarıdaki haklarınıza ilişkin başvurularınızı aşağıdaki kanallardan biri
            aracılığıyla iletebilirsiniz:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>E-posta:</strong>{' '}
              <a href="mailto:info@akinelotoyedekparca.com.tr" className="text-brand hover:underline">
                info@akinelotoyedekparca.com.tr
              </a>{' '}
              (konu satırında &ldquo;KVKK Başvurusu&rdquo; yazılması önerilir)
            </li>
            <li>
              <strong>Yazılı posta:</strong> Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca / Kocaeli,
              Türkiye (zarfın üzerine &ldquo;KVKK Başvurusu&rdquo; yazılması önerilir)
            </li>
          </ul>
          <p className="mt-3">
            Başvurularınız, kimliğinizin teyit edilmesinin ardından en geç <strong>30 (otuz) gün</strong>{' '}
            içinde ücretsiz olarak sonuçlandırılır. Talebin ayrıca bir maliyet gerektirmesi
            hâlinde Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret
            talep edilebilir.
          </p>
          <p className="mt-2">
            Başvurunuzun reddedilmesi, verilen cevabın yetersiz bulunması veya süresinde
            yanıt alınamaması hâlinde Kişisel Verileri Koruma Kurulu&apos;na şikâyette
            bulunma hakkınız saklıdır.
          </p>
        </section>

      </div>
    </div>
  );
}
