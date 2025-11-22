import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization for mobile
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 390, 430, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Enable React strict mode for better performance
  reactStrictMode: true,
  
  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'date-fns',
      'framer-motion',
    ],
  },
  
  // Turbopack configuration (Next.js 16+)
  // Turbopack automatically handles code splitting and optimization
  turbopack: {},
};

export default nextConfig;
