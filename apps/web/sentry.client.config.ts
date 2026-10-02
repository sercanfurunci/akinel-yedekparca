import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? 'https://d2edbe55ee0e1b729c8eeacd9867f957@o4512186710622208.ingest.de.sentry.io/4512186719535184';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'production',
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  ignoreErrors: [
    'AbortError',
    'Network request failed',
    'Failed to fetch',
    /^ResizeObserver loop/,
    'Non-Error promise rejection',
  ],
  beforeSend(event: Sentry.ErrorEvent) {
    // Strip auth headers from captured requests — never send tokens to Sentry
    if (event.request?.headers) {
      delete (event.request.headers as Record<string, unknown>)['Authorization'];
      delete (event.request.headers as Record<string, unknown>)['Cookie'];
    }
    return event;
  },
});
