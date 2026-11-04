import { cacheLife } from 'next/cache';

/**
 * Current year without making the page dynamic. With Cache Components, reading the clock
 * in a Server Component must be cached or deferred: the prerendered value is reused and
 * revalidated daily (`cacheLife('days')`), so the footer rolls over on 1 January on its own.
 */
export async function CopyrightYear() {
  'use cache';
  cacheLife('days');
  return <>{new Date().getFullYear()}</>;
}
