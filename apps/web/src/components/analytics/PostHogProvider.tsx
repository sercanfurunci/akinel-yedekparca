'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    posthog.capture('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      capture_pageview: false, // Tracked manually via PageViewTracker
      capture_pageleave: true,
      person_profiles: 'identified_only',
      // Autocapture disabled: avoids accidentally capturing form data (passwords, etc.)
      autocapture: false,
      loaded: (ph) => {
        if (process.env.NODE_ENV !== 'production') ph.debug();
      },
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense>
        <PageViewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
