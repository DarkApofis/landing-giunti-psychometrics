'use client';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { resultsLabel } from '@/lib/catalog';

const ANNOUNCE_DELAY_MS = 400;

/**
 * Result counter. The visible text updates instantly (hidden from AT to avoid a duplicate);
 * the polite live region waits until typing pauses so screen readers are not flooded
 * on every keystroke.
 */
export function ResultsStatus({ count }: { count: number }) {
  const announced = useDebouncedValue(resultsLabel(count), ANNOUNCE_DELAY_MS);

  return (
    <>
      <p aria-hidden="true" className="font-display text-sm font-semibold text-ink-muted">
        {resultsLabel(count)}
      </p>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announced}
      </p>
    </>
  );
}
