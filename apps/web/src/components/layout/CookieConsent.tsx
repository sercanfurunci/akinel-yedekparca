'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'cookie-consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const necessary = () => {
    localStorage.setItem(STORAGE_KEY, 'necessary');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 backdrop-blur-sm shadow-lg',
        'px-4 py-4 md:px-6',
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Text */}
        <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
          Size daha iyi hizmet sunabilmek için çerezler kullanıyoruz. Detaylar için{' '}
          <Link
            href="/belgeler/gizlilik-politikasi"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            Gizlilik Politikamızı
          </Link>{' '}
          ve{' '}
          <Link
            href="/belgeler/kvkk"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            KVKK Aydınlatma Metnini
          </Link>{' '}
          inceleyebilirsiniz.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={necessary}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
          >
            Yalnızca Zorunlu
          </button>
          <button
            onClick={accept}
            className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"
          >
            Tümünü Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
