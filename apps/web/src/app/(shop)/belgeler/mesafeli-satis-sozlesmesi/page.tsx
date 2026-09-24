import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi | AKINEL OTO YEDEK PARÇA',
};

export default function MesafeliSatisSozlesmesiPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-2xl font-bold mb-2">Mesafeli Satış Sözleşmesi</h1>
      <p className="text-sm text-muted-foreground mb-8">6502 Sayılı TKHK ve Mesafeli Sözleşmeler Yönetmeliği Kapsamında</p>

      <div className="rounded-lg border bg-amber-50 border-amber-200 p-4 text-amber-800 text-xs mb-8">
        Bu belge taslak niteliğindedir. Satışa açılmadan önce hukuki danışmanlık alınarak işletmeye özgü bilgilerle (satıcı bilgileri, cayma süreci, iade adresi vb.) tamamlanmalı ve onaylanmalıdır.
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-foreground">

        <section>
          <h2 className="text-base font-semibold mb-2">Madde 1 — Taraflar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded border p-3">
              <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Satıcı</p>
              <p><strong>[İŞLETME ADI]</strong></p>
              <p>[ADRES]</p>
              <p>Tel: [TELEFON]</p>
              <p>E-posta: [E-POSTA]</p>
              <p>Vergi No: [VERGİ NO]</p>
            </div>
            <div className="rounded border p-3">
              <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Alıcı</p>
              <p>Sipariş sırasında girilen bilgiler geçerlidir.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Madde 2 — Sözleşmenin Konusu</h2>
          <p>Bu sözleşme, Alıcı&apos;nın Satıcı&apos;ya ait <em>akinel.com</em> adresindeki web sitesi üzerinden elektronik ortamda sipariş verdiği ürünün satışı ve teslimatına ilişkin tarafların hak ve yükümlülüklerini düzenler. Ürün bilgileri, fiyat ve miktarı sipariş onay e-postasında belirtilir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Madde 3 — Teslimat</h2>
          <p>Ürün, siparişin onaylanmasından itibaren [X] iş günü içinde kargoya verilir. Teslimat adresi yanlışsa oluşacak ek masraf Alıcı&apos;ya aittir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Madde 4 — Ödeme</h2>
          <p>Ödeme, sipariş anında kredi/banka kartı ile tahsil edilir. Taksit seçenekleri ödeme sayfasında gösterilir. Satıcı, 256-bit SSL şifrelemeli ödeme altyapısı kullanır.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Madde 5 — Cayma Hakkı</h2>
          <p>Alıcı, ürünü teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.</p>
          <p className="mt-2">Cayma bildirimi <strong>[E-POSTA ADRESİ]</strong> adresine veya posta yoluyla iletilmelidir. Cayma hakkının kullanılmasından itibaren 10 gün içinde ürün iade edilmelidir; iade kargo ücreti [Satıcı / Alıcı] tarafından karşılanır.</p>
          <p className="mt-2 font-medium">Aşağıdaki durumlarda cayma hakkı kullanılamaz:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Alıcı tarafından açılan veya kullanılan ürünler (hijyen ve güvenlik kaygısıyla)</li>
            <li>Özel sipariş/kişiye özel üretilen ürünler</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Madde 6 — Gizlilik</h2>
          <p>Alıcı&apos;nın kişisel verileri, <a href="/belgeler/gizlilik-politikasi" className="text-brand hover:underline">Gizlilik Politikası</a> ve <a href="/belgeler/kvkk-aydinlatma-metni" className="text-brand hover:underline">KVKK Aydınlatma Metni</a> kapsamında işlenir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Madde 7 — Uyuşmazlık Çözümü</h2>
          <p>Taraflar arasındaki uyuşmazlıklarda öncelikle Tüketici Hakem Heyetleri, sınırı aşan tutarlarda ise [İLGİLİ İL] Tüketici Mahkemeleri yetkilidir.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">Madde 8 — Yürürlük</h2>
          <p>Bu sözleşme, Alıcı&apos;nın sipariş onayını tamamladığı anda yürürlüğe girer. Alıcı, sipariş vermeden önce Ön Bilgilendirme Formu&apos;nu okuduğunu ve onayladığını kabul eder.</p>
        </section>

      </div>
    </div>
  );
}
