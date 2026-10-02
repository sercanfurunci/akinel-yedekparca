import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? 'https://d2edbe55ee0e1b729c8eeacd9867f957@o4512186710622208.ingest.de.sentry.io/4512186719535184',
  environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'production',
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,
});
