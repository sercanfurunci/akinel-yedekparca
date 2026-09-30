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

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div className="bg-brand text-white text-[11px] font-medium overflow-hidden h-7 flex items-center">
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{ animation: 'ticker 30s linear infinite' }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="px-8">{item}</span>
            <span className="text-white/50">✦</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
