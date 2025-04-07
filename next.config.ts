import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Optimization configs */
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Remove optimizeCss to avoid critters issue
};

export default nextConfig;
