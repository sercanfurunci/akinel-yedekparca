import posthog from 'posthog-js';

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? 'phc_sh2NfoVJFKxNGUkXK8NLGja62V7UWyj9U3T4hwCZCDJq';
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';
const missingVariable = !key
  ? 'NEXT_PUBLIC_POSTHOG_KEY'
  : !host
    ? 'NEXT_PUBLIC_POSTHOG_HOST'
    : null;

if (key && host) {
  posthog.init(key, {
    api_host: host,
    defaults: '2026-05-30',
    capture_pageview: false,
    capture_pageleave: true,
    capture_exceptions: true,
    autocapture: false,
    person_profiles: 'identified_only',
    logs: {
      serviceName: 'akinel-web',
      environment: process.env.NODE_ENV,
    },
    debug: process.env.NODE_ENV === 'development',
  });
}
