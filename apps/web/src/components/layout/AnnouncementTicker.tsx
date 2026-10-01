'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { BusinessSettings } from '@/lib/types';

// How many times we repeat items.
// 30 copies guarantees total width >> any viewport (even a single short item).
// Animation moves exactly 1 copy width (−100/30 %), then loops seamlessly.
const COPIES = 30;

export function AnnouncementTicker() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    api.business.settings()
      .then((d) => {
        const biz = d as BusinessSettings;
        if (biz.announcementBanner) {
          setItems(biz.announcementBanner.split('|').map(s => s.trim()).filter(Boolean));
        }
      })
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const repeated = Array.from({ length: COPIES }, () => items).flat();

  return (
    <div
      className="bg-brand text-white text-[11px] font-medium h-7 flex items-center overflow-hidden w-full"
      aria-label="Duyurular"
    >
      <div
        className="flex whitespace-nowrap shrink-0"
        style={{
          animation: 'akinel-ticker 30s linear infinite',
          willChange: 'transform',
        }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="px-8">{item}</span>
            <span className="text-white/50" aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes akinel-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-${(100 / COPIES).toFixed(6)}%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .akinel-ticker-track { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
