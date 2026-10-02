import type { NextConfig } from "next";

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      isDev ? "img-src 'self' data: blob: https: http://localhost:5100" : "img-src 'self' data: blob: https:",
      "font-src 'self'",
      isDev
        ? "connect-src 'self' http://localhost:5100 ws://localhost:3000"
        : "connect-src 'self' https://akinelotoyedekparca-api.railway.app https://*.railway.app",
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
    // Allow the image optimizer to fetch from localhost (dev only — local IP blocked by default)
    dangerouslyAllowSVG: false,
    ...(isDev && { dangerouslyAllowLocalIP: true } as object),
    remotePatterns: [
      // Dev API — product/category/hero images come from here
      { protocol: "http", hostname: "localhost", port: "5100", pathname: "/**" },
      // Prod API
      { protocol: "https", hostname: "akinelotoyedekparca-api.railway.app", pathname: "/**" },
      // Future Railway subdomains
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

export default nextConfig;
