import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  staticPageGenerationTimeout: 120,
  experimental: {
    staticGenerationRetryCount: 0,
  },
};

export default nextConfig;
