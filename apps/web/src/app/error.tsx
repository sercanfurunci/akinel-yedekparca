'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-md">
      <h2 className="text-xl font-semibold mb-2">Bir şeyler ters gitti</h2>
      <p className="text-muted-foreground mb-6">
        Sayfa yüklenirken beklenmedik bir hata oluştu.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
