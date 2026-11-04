import type { NextConfig } from 'next';
import { UNSPLASH_HOST, UNSPLASH_QUERY } from './src/lib/unsplash';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // Only the exact Unsplash URLs built by src/lib/unsplash.ts are allowed (same path prefix and query).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: UNSPLASH_HOST,
        port: '',
        pathname: '/photo-*',
        search: UNSPLASH_QUERY,
      },
    ],
  },
};

export default nextConfig;
