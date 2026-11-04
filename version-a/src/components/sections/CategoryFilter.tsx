'use client';

import { Check } from 'lucide-react';
import { useEffect, useRef, type Ref } from 'react';
import { cn } from '@/lib/cn';
import type { Category, CategoryFilter as CategoryFilterValue } from '@/types/product';

interface CategoryFilterProps {
  label: string;
  allLabel: string;
  categories: readonly Category[];
  value: CategoryFilterValue;
  counts: Record<CategoryFilterValue, number>;
  onChange: (value: CategoryFilterValue) => void;
  /** Ref to the "Tutti" pill, used to restore focus after resetting the filters. */
  allRef?: Ref<HTMLButtonElement>;
}

/**
 * Category pills (DESIGN-SPEC §6.3).
 * Toggle buttons with aria-pressed inside a labelled group — not a tablist: pills filter one shared
 * list rather than switching between separate panels, and plain buttons keep Tab navigation familiar.
 * Mobile: one horizontal row that scrolls (full-bleed to the screen edges so a cut pill hints at
 * more content); vertical padding keeps the focus ring from being clipped; a focused pill is always
 * scrolled fully into view (no scroll-snap: it fought keyboard focus). ≥768px: pills wrap.
 */
export function CategoryFilter({
  label,
  allLabel,
  categories,
  value,
  counts,
  onChange,
  allRef,
}: CategoryFilterProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const options: ReadonlyArray<{ id: CategoryFilterValue; label: string }> = [
    { id: 'tutti', label: allLabel },
    ...categories,
  ];

  // Keep the active pill visible in the mobile scroller (e.g. after a deep link or a nav shortcut),
  // without touching the page's vertical scroll.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const active = scroller?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!scroller || !active || scroller.scrollWidth <= scroller.clientWidth) return;
    const left = active.offsetLeft - scroller.offsetLeft;
    const right = left + active.offsetWidth;
    if (left < scroller.scrollLeft || right > scroller.scrollLeft + scroller.clientWidth) {
      scroller.scrollTo({ left: Math.max(0, left - 16) });
    }
  }, [value]);

  return (
    <div
      ref={scrollerRef}
      role="group"
      aria-label={label}
      className="-mx-4 scroll-px-4 [scrollbar-width:thin] overflow-x-auto overscroll-x-contain px-4 py-1 md:mx-0 md:overflow-visible md:px-0"
    >
      <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
        {options.map((option) => {
          const pressed = option.id === value;
          return (
            <li key={option.id}>
              <button
                ref={option.id === 'tutti' ? allRef : undefined}
                type="button"
                aria-pressed={pressed}
                // Explicit name that contains the visible text "Tutti 12" in order (WCAG 2.5.3,
                // label-in-name); without it inline spans are joined as "Tutti12".
                aria-label={`${option.label} ${counts[option.id]} prodotti`}
                onClick={() => onChange(option.id)}
                // Audit fix: scroll-snap pulled keyboard-focused pills back off-screen on mobile.
                // Bring the focused pill fully into the scroller (scroll-padding is respected).
                onFocus={(event) =>
                  event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'nearest' })
                }
                className={cn(
                  'inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 font-display text-[0.9375rem] font-medium whitespace-nowrap',
                  'transition-colors duration-(--duration-fast) ease-out',
                  pressed
                    ? 'border-primary bg-primary text-white hover:bg-primary-hover'
                    : 'border-border-strong bg-surface text-ink hover:bg-primary-subtle',
                )}
              >
                {pressed && <Check aria-hidden="true" className="-ml-1 size-4" strokeWidth={2.5} />}
                {option.label}{' '}
                <span
                  aria-hidden="true"
                  className={cn(
                    'min-w-6 rounded-full px-1.5 text-center text-xs font-semibold tabular-nums',
                    pressed ? 'bg-white/20 text-white' : 'bg-primary-subtle text-ink',
                  )}
                >
                  {counts[option.id]}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
