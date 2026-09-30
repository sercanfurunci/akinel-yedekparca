import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import type { BusinessSettings } from '@/lib/types';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'AKINEL Oto Yedek Parça iletişim bilgileri. Nenehatun, Fatih Cd. No:81, Darıca / Kocaeli. Tel: +90 539 462 41 49. Yol tarifi ve çalışma saatleri.',
};

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

async function getBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';
    const res = await fetch(`${base}/api/business/settings`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const biz = await getBusinessSettings();

  const fullAddress = biz
    ? [biz.address, biz.district && biz.city ? `${biz.postalCode} ${biz.district}/${biz.city}` : biz.city, biz.country].filter(Boolean).join(', ')
    : 'Nenehatun, Fatih Cd. No:81, 41700 Darıca/Kocaeli, Türkiye';

  const phone = biz?.phone ?? '+90 539 462 41 49';
  const phone2 = biz?.phone2;
  const email = biz?.email ?? 'info@akinelotoyedekparca.com.tr';
  const mapsUrl = biz?.googleMapsUrl ?? 'https://www.google.com/maps/dir//AKINEL+OTO+YEDEK+PAR%C3%87A,+Osman+Gazi,+Tuzla+Cd.+No:238%2FB,+41700+Dar%C4%B1ca%2FKocaeli/@40.7793666,29.3758179,17z';
  const embedUrl = biz?.googleMapsEmbedUrl ?? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.211392343826!2d29.37324297745954!3d40.77936657138359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cadfa5b24995a1%3A0xc7de0d66a28e88a9!2sAKINEL%20OTO%20YEDEK%20PAR%C3%87A!5e0!3m2!1str!2str!4v1790785274428!5m2!1str!2str';

  const openDays = biz?.workingHours.filter(h => h.isOpen) ?? [];
  const weekdayHours = openDays.find(h => h.dayOfWeek === 1);
  const sundayClosed = !(biz?.workingHours.find(h => h.dayOfWeek === 0)?.isOpen ?? false);

  return (
    <div className="container mx-auto px-4 max-w-5xl py-12">
      <h1 className="text-3xl font-bold mb-2">İletişim</h1>
      <p className="text-muted-foreground mb-10">Bize ulaşın, size yardımcı olalım.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left — contact info */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Hizmet Noktamız</p>
              <h2 className="text-lg font-bold">AKINEL OTO YEDEK PARÇA</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Adres</p>
                  <p className="text-muted-foreground leading-snug">{fullAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">Telefon</p>
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-brand hover:text-brand/80 transition-colors block">
                    {phone}
                  </a>
                  {phone2 && (
                    <a href={`tel:${phone2.replace(/\s/g, '')}`} className="text-brand hover:text-brand/80 transition-colors block mt-0.5">
                      {phone2}
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-0.5">E-posta</p>
                  <a href={`mailto:${email}`} className="text-brand hover:text-brand/80 transition-colors">
                    {email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Çalışma Saatleri</p>
                  <div className="text-muted-foreground space-y-0.5">
                    {biz?.workingHours.length ? (
                      <>
                        {weekdayHours && (
                          <p>Pzt – Cmt: {weekdayHours.openTime} – {weekdayHours.closeTime}</p>
                        )}
                        {sundayClosed && <p>Pazar: Kapalı</p>}
                      </>
                    ) : (
                      <>
                        <p>Pzt – Cmt: 09:00 – 19:00</p>
                        <p>Pazar: Kapalı</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-brand text-brand-foreground px-4 py-2 text-sm font-medium hover:bg-brand/90 transition-colors"
              >
                <ExternalLink size={14} />
                Yol Tarifi Al
              </a>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Phone size={14} />
                Telefonla Ara
              </a>
            </div>
          </div>
        </div>

        {/* Right — map */}
        <div className="rounded-xl overflow-hidden border bg-card min-h-72">
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ minHeight: '320px', border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="AKINEL OTO YEDEK PARÇA harita"
          />
        </div>
      </div>
    </div>
  );
}
