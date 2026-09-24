import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import type { BusinessSettings } from '@/lib/types';

export const metadata: Metadata = { title: 'İletişim' };

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

  const phone = biz?.phone ?? '+90 533 140 56 49';
  const email = biz?.email ?? 'info@aknmotors.com.tr';
  const mapsUrl = biz?.googleMapsUrl ?? 'https://maps.google.com/?q=Nenehatun+Fatih+Caddesi+No+81+41700+Darica+Kocaeli';
  const embedUrl = biz?.googleMapsEmbedUrl ?? 'https://maps.google.com/maps?q=Nenehatun+Fatih+Caddesi+No+81+41700+Darica+Kocaeli&output=embed&hl=tr';

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
              <h2 className="text-lg font-bold">AKN MOTORS Car Service</h2>
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
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-brand hover:text-brand/80 transition-colors">
                    {phone}
                  </a>
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
            title="AKN MOTORS Car Service harita"
          />
        </div>
      </div>
    </div>
  );
}
