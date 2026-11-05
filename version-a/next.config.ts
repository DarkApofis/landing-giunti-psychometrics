import type { NextConfig } from 'next';
import { UNSPLASH_HOST, UNSPLASH_QUERY } from './src/lib/unsplash';

/**
 * Security headers for every route. Next.js inlines its own bootstrap scripts, and nonces would make
 * every page dynamic (no static prerender), so the CSP does not restrict scripts; it closes what does
 * not depend on them: framing, plugins, <base> hijacking, form targets and foreign connections.
 * React needs eval only in development. HSTS is added by Vercel.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://${UNSPLASH_HOST}`,
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
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
