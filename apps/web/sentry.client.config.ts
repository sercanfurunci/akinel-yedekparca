import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
  enabled: process.env.NODE_ENV === 'production' && !!process.env.NEXT_PUBLIC_SENTRY_DSN,
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
