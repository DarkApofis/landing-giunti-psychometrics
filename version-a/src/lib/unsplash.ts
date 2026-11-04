/**
 * Builds a stable Unsplash CDN URL. The query string is fixed so that
 * next.config.ts can allow exactly this pattern (images.remotePatterns.search).
 * next/image then resizes it to the widths declared in `sizes`.
 */
export const UNSPLASH_HOST = 'images.unsplash.com';
export const UNSPLASH_QUERY = '?fm=jpg&fit=crop&w=1200&h=800&q=80';

export function unsplashUrl(photoId: string): string {
  return `https://${UNSPLASH_HOST}/photo-${photoId}${UNSPLASH_QUERY}`;
}
