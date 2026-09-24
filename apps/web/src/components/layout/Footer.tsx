'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';
import type { BusinessSettings } from '@/lib/types';

const DAY_NAMES = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

export function Footer() {
  const [biz, setBiz] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    api.business.settings().then(d => setBiz(d as BusinessSettings)).catch(() => {});
  }, []);

  const fullAddress = biz
    ? [biz.address, biz.district && biz.city ? `${biz.postalCode} ${biz.district}/${biz.city}` : biz.city].filter(Boolean).join(', ')
    : null;

  const weekdays = biz?.workingHours.filter(h => h.isOpen && h.dayOfWeek >= 1 && h.dayOfWeek <= 6) ?? [];
  const openLabel = weekdays.length > 0
    ? `Pzt - Cmt: ${weekdays[0].openTime} - ${weekdays[0].closeTime}`
    : null;
  const sunOpen = biz?.workingHours.find(h => h.dayOfWeek === 0)?.isOpen ?? false;

  return (
    <footer className="border-t mt-auto bg-muted/30">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3">
              <img src="/logo.png" alt="AKINEL OTO YEDEK PARÇA" className="h-10 w-auto rounded-md" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {biz?.shortDescription ?? 'Otomotiv yedek parçalarını araç, OEM numarası ve parça bilgisine göre kolayca bulun.'}
            </p>
          </div>

          {/* Column 2 — Hızlı Linkler */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link></li>
              <li><Link href="/products" className="hover:text-foreground transition-colors">Ürünler</Link></li>
              <li><Link href="/vehicle" className="hover:text-foreground transition-colors">Aracımı Seç</Link></li>
              <li><Link href="/vin" className="hover:text-foreground transition-colors">OEM Ara</Link></li>
              <li><Link href="/garage" className="hover:text-foreground transition-colors">Garajım</Link></li>
              <li><Link href="/about" className="hover:text-foreground transition-colors">Hakkımızda</Link></li>
            </ul>
          </div>

          {/* Column 3 — Müşteri */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Müşteri</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Giriş Yap</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">Kayıt Ol</Link></li>
              <li><Link href="/garage" className="hover:text-foreground transition-colors">Garajım</Link></li>
              <li><Link href="/account" className="hover:text-foreground transition-colors">Hesabım</Link></li>
              <li><Link href="/maintenance" className="hover:text-foreground transition-colors">Periyodik Bakım</Link></li>
            </ul>
          </div>

          {/* Column 4 — İletişim */}
          <div>
            <h3 className="font-semibold text-sm mb-4">İletişim</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground text-xs uppercase tracking-wide">AKN MOTORS Car Service</p>

              {fullAddress && (
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-brand" />
                  <span className="leading-snug">{fullAddress}</span>
                </div>
              )}

              {biz?.phone && (
                <a href={`tel:${biz.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Phone size={14} className="shrink-0 text-brand" />
                  {biz.phone}
                </a>
              )}

              {biz?.email && (
                <a href={`mailto:${biz.email}`} className="flex items-center gap-2 hover:text-foreground transition-colors">
                  <Mail size={14} className="shrink-0 text-brand" />
                  {biz.email}
                </a>
              )}

              {(openLabel || !sunOpen) && (
                <div className="flex items-start gap-2">
                  <Clock size={14} className="mt-0.5 shrink-0 text-brand" />
                  <div className="leading-snug">
                    {openLabel && <p>{openLabel}</p>}
                    {!sunOpen && <p>Pazar: Kapalı</p>}
                  </div>
                </div>
              )}

              {biz?.googleMapsUrl && (
                <a
                  href={biz.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand hover:text-brand/80 font-medium transition-colors"
                >
                  <ExternalLink size={13} />
                  Yol Tarifi Al
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} AKINEL OTO YEDEK PARÇA. Tüm hakları saklıdır.</span>
          <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
            <Link href="/belgeler/gizlilik-politikasi" className="hover:text-foreground transition-colors">Gizlilik Politikası</Link>
            <Link href="/belgeler/kvkk-aydinlatma-metni" className="hover:text-foreground transition-colors">KVKK</Link>
            <Link href="/belgeler/kullanim-kosullari" className="hover:text-foreground transition-colors">Kullanım Koşulları</Link>
            <Link href="/belgeler/mesafeli-satis-sozlesmesi" className="hover:text-foreground transition-colors">Mesafeli Satış Sözleşmesi</Link>
            <Link href="/belgeler/on-bilgilendirme-formu" className="hover:text-foreground transition-colors">Ön Bilgilendirme Formu</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
