"use client";

// This "use client" boundary ensures sentry.client.config runs in the browser
import '../../sentry.client.config';

export function SentryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
