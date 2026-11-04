import Link from 'next/link';
import { site } from '@/data/site';
import { cn } from '@/lib/cn';

/** Monogram + wordmark. The accessible name comes from the visible text. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'inline-flex min-h-11 items-center gap-2.5 rounded-sm font-display text-lg leading-none font-bold text-ink',
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="7" fill="var(--color-primary)" />
        <path
          d="M21.5 11.2A7 7 0 1 0 23 16h-6.5"
          fill="none"
          stroke="var(--color-white)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24.5" cy="8.5" r="2.5" fill="var(--color-accent)" />
      </svg>
      <span>
        {site.name.split(' ')[0]}{' '}
        <span className="font-semibold text-primary">
          {site.name.split(' ').slice(1).join(' ')}
        </span>
      </span>
    </Link>
  );
}
