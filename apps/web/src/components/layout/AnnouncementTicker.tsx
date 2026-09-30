'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { BusinessSettings } from '@/lib/types';

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

  // Duplicate for seamless loop: animation goes 0 → -50% and loops
  const doubled = [...items, ...items];

  return (
    <div
      className="bg-brand text-white text-[11px] font-medium h-7 flex items-center"
      style={{ overflow: 'hidden', width: '100vw', maxWidth: '100%' }}
    >
      <div
        className="flex whitespace-nowrap shrink-0"
        style={{ animation: 'ticker-scroll 30s linear infinite', willChange: 'transform' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="px-8">{item}</span>
            <span className="text-white/50" aria-hidden="true">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-scroll { animation: none; }
        }
      `}</style>
    </div>
  );
}
