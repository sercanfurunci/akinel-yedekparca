import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      isDev ? "img-src 'self' data: blob: https: http://localhost:5100" : "img-src 'self' data: blob: https:",
      "font-src 'self'",
      isDev
        ? "connect-src 'self' http://localhost:5100 ws://localhost:3000 https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://*.posthog.com"
        : "connect-src 'self' https://akinelotoyedekparca-api.railway.app https://*.railway.app https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://*.posthog.com",
      "worker-src 'self' blob: data:",
      "frame-src https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  staticPageGenerationTimeout: 300,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: false,
    ...(isDev && { dangerouslyAllowLocalIP: true } as object),
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "5100", pathname: "/**" },
      { protocol: "https", hostname: "akinelotoyedekparca-api.railway.app", pathname: "/**" },
      { protocol: "https", hostname: "*.railway.app", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: !process.env.CI,
  // Source map upload requires SENTRY_AUTH_TOKEN + SENTRY_ORG + SENTRY_PROJECT
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  // Tunnel Sentry requests through /monitoring to avoid ad blockers
  tunnelRoute: "/monitoring",
});
