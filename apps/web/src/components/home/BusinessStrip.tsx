'use client';

import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import type { BusinessSettings } from '@/lib/types';
import { api } from '@/lib/api';

export function BusinessStrip() {
  const [biz, setBiz] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    api.business.settings()
      .then((d) => setBiz(d as BusinessSettings))
      .catch(() => {});
  }, []);

  const phone = biz?.phone ?? '+90 533 140 56 49';
  const email = biz?.email ?? 'info@aknmotors.com.tr';
  const location = biz ? `${biz.district} / ${biz.city}` : 'Darıca / Kocaeli';
  const mapsUrl = biz?.googleMapsUrl ?? 'https://maps.google.com/?q=Nenehatun+Fatih+Caddesi+No+81+41700+Darica+Kocaeli';

  const weekdayHour = biz?.workingHours.find(h => h.isOpen && h.dayOfWeek === 1);
  const hoursLabel = weekdayHour ? `Pzt – Cmt: ${weekdayHour.openTime} – ${weekdayHour.closeTime}` : 'Pzt – Cmt: 09:00 – 19:00';

  return (
    <div className="border-b bg-muted/40">
      <div className="container mx-auto px-4 max-w-7xl py-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin size={12} className="text-brand shrink-0" />
            {location}
          </span>
          <span className="hidden sm:block text-border">·</span>
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Phone size={12} className="text-brand shrink-0" />
            {phone}
          </a>
          <span className="hidden sm:block text-border">·</span>
          <a href={`mailto:${email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Mail size={12} className="text-brand shrink-0" />
            {email}
          </a>
          <span className="hidden sm:block text-border">·</span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-brand shrink-0" />
            {hoursLabel}
          </span>
          <span className="hidden sm:block text-border">·</span>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-brand font-medium hover:text-brand/80 transition-colors"
          >
            <ExternalLink size={11} />
            Yol Tarifi
          </a>
        </div>
      </div>
    </div>
  );
}
