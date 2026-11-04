'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QuantityStepperProps {
  value: number;
  min?: number;
  max: number;
  /** Product name, used to make every control's accessible name unique. */
  itemName: string;
  onChange: (value: number) => void;
}

const stepButton =
  'grid size-11 cursor-pointer place-items-center text-ink transition-colors duration-(--duration-fast) hover:bg-primary-subtle aria-disabled:cursor-not-allowed aria-disabled:text-ink-muted aria-disabled:hover:bg-transparent';

/**
 * − value + with 44px targets. Limits use aria-disabled (not `disabled`): a button that becomes
 * disabled while focused would drop keyboard focus to <body>.
 */
export function QuantityStepper({ value, min = 1, max, itemName, onChange }: QuantityStepperProps) {
  const atMin = value <= min;
  const atMax = value >= max;
  return (
    <div
      role="group"
      aria-label={`Quantità di ${itemName}`}
      className="inline-flex items-center rounded-md border border-border-strong bg-surface"
    >
      <button
        type="button"
        aria-label={`Diminuisci la quantità di ${itemName}`}
        aria-disabled={atMin || undefined}
        onClick={() => !atMin && onChange(value - 1)}
        className={cn(stepButton, 'rounded-l-md')}
      >
        <Minus aria-hidden="true" className="size-4" />
      </button>
      <output
        aria-label={`Quantità: ${value}`}
        className="min-w-8 text-center font-display font-semibold text-ink tabular-nums"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={`Aumenta la quantità di ${itemName}`}
        aria-disabled={atMax || undefined}
        onClick={() => !atMax && onChange(value + 1)}
        className={cn(stepButton, 'rounded-r-md')}
      >
        <Plus aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
