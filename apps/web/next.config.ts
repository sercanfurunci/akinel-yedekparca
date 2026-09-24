import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  staticPageGenerationTimeout: 300,
};

export default nextConfig;
