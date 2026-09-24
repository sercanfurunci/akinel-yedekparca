import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | Akinel Yedek Parça',
};

export default function KvkkAydinlatmaMetniPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">KVKK Aydınlatma Metni</h1>
      <p className="text-sm text-muted-foreground mb-8">
        6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni — Son güncelleme: [TARİH]
      </p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8">
        Bu belge taslak niteliğindedir. Satışa açılmadan önce hukuki danışmanlık alınarak köşeli parantez içindeki alanlar tamamlanmalı ve onaylanmalıdır.
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-2">Veri Sorumlusu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu (&ldquo;KVKK&rdquo;) uyarınca, kişisel verileriniz veri sorumlusu sıfatıyla <strong>[İŞLETME ADI]</strong> ([VERGİ DAİRESİ] — [VERGİ NO]) tarafından aşağıda açıklanan kapsamda işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">1. İşlenen Kişisel Veriler ve İşleme Amaçları</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-border">
              <thead className="bg-muted">
                <tr>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Veri Kategorisi</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">İşleme Amacı</th>
                  <th className="border border-border px-3 py-2 text-left font-semibold">Hukuki Dayanak</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-3 py-2">Kimlik (ad, soyad)</td>
                  <td className="border border-border px-3 py-2">Sipariş ve fatura düzenleme, müşteri kaydı</td>
                  <td className="border border-border px-3 py-2">Sözleşmenin ifası (m. 5/2-c)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">İletişim (e-posta, telefon, adres)</td>
                  <td className="border border-border px-3 py-2">Sipariş bildirimi, teslimat, destek</td>
                  <td className="border border-border px-3 py-2">Sözleşmenin ifası (m. 5/2-c)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Araç bilgileri</td>
                  <td className="border border-border px-3 py-2">Araç uyumlu parça önerisi</td>
                  <td className="border border-border px-3 py-2">Meşru menfaat (m. 5/2-f)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">İşlem / sipariş geçmişi</td>
                  <td className="border border-border px-3 py-2">Hizmet yönetimi, yasal kayıt tutma</td>
                  <td className="border border-border px-3 py-2">Yasal yükümlülük (m. 5/2-ç)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Log / teknik veriler (IP, tarayıcı)</td>
                  <td className="border border-border px-3 py-2">Güvenlik, hata giderme</td>
                  <td className="border border-border px-3 py-2">Meşru menfaat (m. 5/2-f)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Pazarlama tercihleri</td>
                  <td className="border border-border px-3 py-2">Ticari elektronik ileti</td>
                  <td className="border border-border px-3 py-2">Açık rıza (m. 5/1)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Kişisel Verilerin Aktarılması</h2>
          <p>Kişisel verileriniz; sipariş teslimatı için kargo firmalarına, ödeme işlemleri için ödeme altyapısı sağlayıcılarına ve yasal zorunluluk halinde yetkili kamu kurumlarına KVKK'nın 8. ve 9. maddeleri çerçevesinde aktarılabilir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. Kişisel Veri Toplamanın Yöntemi</h2>
          <p>Kişisel verileriniz; web sitesi üzerinden doldurduğunuz formlar, sipariş süreçleri ve çerezler aracılığıyla elektronik ortamda toplanmaktadır.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. KVKK Kapsamındaki Haklarınız</h2>
          <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenmişse buna ilişkin bilgi talep etme</li>
            <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
            <li>Silinmesini veya yok edilmesini isteme</li>
            <li>Yapılan işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
            <li>Münhasıran otomatik sistemler vasıtasıyla analiz edilmesi sonucu aleyhinize bir sonuç doğmasına itiraz etme</li>
            <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Başvuru Yöntemi</h2>
          <p>
            Haklarınıza ilişkin başvurularınızı <strong>[E-POSTA ADRESİ]</strong> adresine veya <strong>[POSTA ADRESİ]</strong> adresine yazılı olarak iletebilirsiniz. Başvurular en geç 30 (otuz) gün içinde ücretsiz olarak sonuçlandırılır.
          </p>
        </section>

      </div>
    </div>
  );
}
