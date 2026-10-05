import type { Metadata } from 'next';
import { MapPin, Phone, Mail, Clock, ExternalLink, Star } from 'lucide-react';
import type { BusinessSettings } from '@/lib/types';

export const metadata: Metadata = {
  title: 'İletişim — Darıca Kocaeli Yedek Parça',
  description: 'Akinel Oto Yedek Parça iletişim. Osmangazi Mh. Tuzla Cd. No:238/B, Darıca/Kocaeli. Gebze, Tuzla, Pendik, İzmit ve çevre ilçelere hizmet. Tel: +90 539 462 41 49.',
  keywords: ['akinel iletişim', 'darıca yedek parça telefon', 'kocaeli oto yedek parça adres', 'gebze yedek parça', 'tuzla yedek parça'],
  alternates: { canonical: '/contact' },
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
    : 'Osmangazi Mh. Tuzla Cd. No:238/B, 41700 Darıca/Kocaeli, Türkiye';

  const phone = biz?.phone ?? '+90 539 462 41 49';
  const phone2 = biz?.phone2;
  const email = biz?.email ?? 'info@akinelotoyedekparca.com.tr';
  const REVIEWS_URL = 'https://www.google.com/maps/search/AKINEL+OTO+YEDEK+PAR%C3%87A+Dar%C4%B1ca+Kocaeli/@40.7793666,29.3758179,17z';
  const DIRECTIONS_URL = 'https://www.google.com/maps/dir//AKINEL+OTO+YEDEK+PAR%C3%87A,+Osman+Gazi,+Tuzla+Cd.+No:238%2FB,+41700+Dar%C4%B1ca%2FKocaeli/@40.7793666,29.3758179,17z';
  const mapsUrl = biz?.googleMapsUrl || DIRECTIONS_URL;
  const reviewsUrl = biz?.googleMapsUrl || REVIEWS_URL;
  const embedUrl = biz?.googleMapsEmbedUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.211392343826!2d29.37324297745954!3d40.77936657138359!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cadfa5b24995a1%3A0xc7de0d66a28e88a9!2sAKINEL%20OTO%20YEDEK%20PAR%C3%87A!5e0!3m2!1str!2str!4v1790785274428!5m2!1str!2str';

  const openDays = biz?.workingHours.filter(h => h.isOpen) ?? [];
  const weekdayHours = openDays.find(h => h.dayOfWeek === 1);
  const sundayClosed = !(biz?.workingHours.find(h => h.dayOfWeek === 0)?.isOpen ?? false);

  return (
    <div className="container mx-auto px-4 max-w-6xl py-12">
      <h1 className="text-3xl font-bold mb-2">İletişim</h1>
      <p className="text-muted-foreground mb-10">Bize ulaşın, size yardımcı olalım.</p>

      {/* Contact info row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0 mt-0.5">
            <MapPin size={16} />
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-0.5">Adres</p>
            <p className="text-muted-foreground leading-snug">{fullAddress}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0 mt-0.5">
            <Phone size={16} />
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-0.5">Telefon</p>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-brand hover:text-brand/80 transition-colors block">{phone}</a>
            {phone2 && <a href={`tel:${phone2.replace(/\s/g, '')}`} className="text-brand hover:text-brand/80 transition-colors block mt-0.5">{phone2}</a>}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0 mt-0.5">
            <Mail size={16} />
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-0.5">E-posta</p>
            <a href={`mailto:${email}`} className="text-brand hover:text-brand/80 transition-colors break-all">{email}</a>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0 mt-0.5">
            <Clock size={16} />
          </div>
          <div className="text-sm">
            <p className="font-semibold mb-0.5">Çalışma Saatleri</p>
            <div className="text-muted-foreground space-y-0.5">
              {biz?.workingHours.length ? (
                <>
                  {weekdayHours && <p>Pzt – Cmt: {weekdayHours.openTime} – {weekdayHours.closeTime}</p>}
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

      {/* Map + Reviews row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map — takes 2/3 */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border bg-card" style={{ minHeight: '420px' }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ minHeight: '420px', border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="AKINEL OTO YEDEK PARÇA harita"
          />
        </div>

        {/* Reviews + actions — takes 1/3 */}
        <div className="flex flex-col gap-4">
          {/* Google reviews card */}
          <a
            href={reviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border bg-card p-6 flex flex-col gap-3 hover:border-brand/50 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-semibold text-sm">Google Yorumları</span>
              <ExternalLink size={12} className="text-muted-foreground ml-auto group-hover:text-brand transition-colors" />
            </div>
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm font-bold ml-1">5.0</span>
            </div>
            <p className="text-xs text-muted-foreground">Google Haritalar&apos;daki müşteri yorumlarını görüntüleyin ve yorum bırakın.</p>
          </a>

          {/* Directions button */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border bg-brand text-brand-foreground p-5 flex items-center gap-3 hover:bg-brand/90 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <p className="font-semibold text-sm">Yol Tarifi Al</p>
              <p className="text-xs text-brand-foreground/70 mt-0.5">Google Maps&apos;te aç</p>
            </div>
            <ExternalLink size={14} className="ml-auto opacity-70" />
          </a>

          {/* Call button */}
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="rounded-xl border bg-card p-5 flex items-center gap-3 hover:border-brand/50 hover:shadow-sm transition-all"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-muted text-brand shrink-0">
              <Phone size={18} />
            </div>
            <div>
              <p className="font-semibold text-sm">Telefonla Ara</p>
              <p className="text-xs text-muted-foreground mt-0.5">{phone}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
