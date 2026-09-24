import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | AKİNEL OTO YEDEK PARÇA',
};

export default function GizlilikPolitikasiPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Gizlilik Politikası</h1>
      <p className="text-sm text-muted-foreground mb-8">Son güncelleme: [TARİH — yayına alınmadan önce güncellenecektir]</p>

      <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed text-foreground">

        <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs">
          Bu belge taslak niteliğindedir. Satışa açılmadan önce hukuki danışmanlık alınarak işletmeye özgü bilgilerle tamamlanacak ve onaylanacaktır. İşletme adı, adresi ve iletişim bilgileri gibi köşeli parantez içindeki alanlar doldurulmalıdır.
        </div>

        <section>
          <h2 className="text-base font-semibold mb-2">1. Veri Sorumlusu</h2>
          <p>
            Bu Gizlilik Politikası, [İŞLETME ADI], [ADRES], [VERGİ NO] tarafından işletilen <strong>AKİNEL OTO YEDEK PARÇA</strong> web sitesine (<em>akinel.com</em>) ilişkindir. Kişisel verileriniz bakımından veri sorumlusu sıfatını taşıyan şirketimiz, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki yükümlülüklerini yerine getirmeyi taahhüt eder.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Toplanan Kişisel Veriler</h2>
          <p>Sitemizi kullanmanız ve hizmetlerimizden faydalanmanız sürecinde aşağıdaki kişisel veriler işlenebilir:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Kimlik bilgileri:</strong> Ad, soyad</li>
            <li><strong>İletişim bilgileri:</strong> E-posta adresi, telefon numarası, teslimat adresi</li>
            <li><strong>Araç bilgileri:</strong> Marka, model, yıl, motor kodu (araç seçici özelliği için)</li>
            <li><strong>İşlem bilgileri:</strong> Sipariş geçmişi, ödeme yöntemi (kart numarası tarafımızca saklanmaz)</li>
            <li><strong>Teknik veriler:</strong> IP adresi, tarayıcı türü, ziyaret edilen sayfalar, oturum bilgileri</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. Kişisel Verilerin İşlenme Amaçları</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sipariş ve teslimat süreçlerinin yürütülmesi</li>
            <li>Müşteri hesabının oluşturulması ve yönetimi</li>
            <li>Araç uyumlu ürün önerisi sunulması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi (fatura, vergi, tüketici mevzuatı)</li>
            <li>Site güvenliği ve hata giderme</li>
            <li>Açık rızanız olması halinde ticari elektronik ileti gönderimi</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Hukuki Dayanak</h2>
          <p>Kişisel verileriniz; sözleşmenin ifası, yasal yükümlülük, meşru menfaat ve açık rıza hukuki dayanaklarına dayalı olarak KVKK'nın 5. maddesi çerçevesinde işlenmektedir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Verilerin Paylaşımı</h2>
          <p>Kişisel verileriniz; kargo ve lojistik hizmet sağlayıcıları, ödeme altyapısı sağlayıcıları, yasal zorunluluk halinde kamu kurumları ile paylaşılabilir. Verileriniz üçüncü kişilere satılmaz veya kiralanmaz.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. Saklama Süresi</h2>
          <p>Kişisel verileriniz, işleme amacı ortadan kalktıktan sonra ilgili mevzuatta öngörülen süreler boyunca saklanır; bu süre geçtikten sonra silinir, yok edilir veya anonim hâle getirilir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Haklarınız</h2>
          <p>KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>İşlenme amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içi/dışına aktarıldığı üçüncü kişileri öğrenme</li>
            <li>Eksik veya yanlış işlenmişse düzeltilmesini talep etme</li>
            <li>Silinmesini veya yok edilmesini talep etme</li>
            <li>İtiraz etme ve zararın giderilmesini talep etme</li>
          </ul>
          <p className="mt-2">Başvurularınızı <strong>[E-POSTA ADRESİ]</strong> adresine iletebilirsiniz.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">8. Çerezler</h2>
          <p>Sitemiz oturum ve tercih çerezleri kullanmaktadır. Tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı işlevler çalışmayabilir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">9. Değişiklikler</h2>
          <p>Bu politika zaman zaman güncellenebilir. Önemli değişikliklerde site üzerinden bilgilendirme yapılacaktır.</p>
        </section>

      </div>
    </div>
  );
}
