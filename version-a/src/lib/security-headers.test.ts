import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('security headers (next.config.ts)', () => {
  it('apply to every route and close framing, plugins, <base> and form targets', async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    expect(rules).toHaveLength(1);
    const [rule] = rules;
    expect(rule?.source).toBe('/:path*');

    const headers = Object.fromEntries((rule?.headers ?? []).map((h) => [h.key, h.value]));
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    const csp = headers['Content-Security-Policy'] ?? '';
    for (const directive of [
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ]) {
      expect(csp).toContain(directive);
    }
    expect(csp).not.toContain('unsafe-eval'); // tests run outside development
  });

  it('does not advertise the framework', () => {
    expect(nextConfig.poweredByHeader).toBe(false);
  });
});
