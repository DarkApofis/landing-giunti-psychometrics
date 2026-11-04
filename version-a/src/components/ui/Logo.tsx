import Link from 'next/link';
import { site } from '@/data/site';
import { cn } from '@/lib/cn';

type LogoTone = 'default' | 'on-dark';

const TONES: Record<LogoTone, { text: string; accentText: string; tile: string; glyph: string }> = {
  default: {
    text: 'text-ink',
    accentText: 'text-primary',
    tile: 'var(--color-primary)',
    glyph: 'var(--color-white)',
  },
  // On ink: white tile + primary glyph; "Psychometrics" in primary-subtle (11.34:1).
  'on-dark': {
    text: 'text-white',
    accentText: 'text-primary-subtle',
    tile: 'var(--color-white)',
    glyph: 'var(--color-primary)',
  },
};

/** Monogram + wordmark. The accessible name comes from the visible text. */
export function Logo({ className, tone = 'default' }: { className?: string; tone?: LogoTone }) {
  const t = TONES[tone];
  const [first, ...rest] = site.name.split(' ');
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex min-h-11 items-center gap-2.5 rounded-sm font-display text-lg leading-none font-bold',
        t.text,
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="7" fill={t.tile} />
        <path
          d="M21.5 11.2A7 7 0 1 0 23 16h-6.5"
          fill="none"
          stroke={t.glyph}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24.5" cy="8.5" r="2.5" fill="var(--color-accent)" />
      </svg>
      <span>
        {first} <span className={cn('font-semibold', t.accentText)}>{rest.join(' ')}</span>
      </span>
    </Link>
  );
}
