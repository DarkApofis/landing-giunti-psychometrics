import { RotateCcw, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { catalogCopy } from '@/data/catalog';

interface EmptyStateProps {
  query: string;
  categoryLabel: string | null;
  onReset: () => void;
}

/** Friendly dead-end recovery: says what was searched and offers one clear way back. */
export function EmptyState({ query, categoryLabel, onReset }: EmptyStateProps) {
  const trimmed = query.trim();
  const context = [
    trimmed !== '' ? `per «${trimmed}»` : null,
    categoryLabel !== null ? `in ${categoryLabel}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface px-6 py-12 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary-subtle text-primary">
        <SearchX aria-hidden="true" className="size-7" />
      </span>
      <h3 className="mt-4 text-xl font-semibold text-ink">{catalogCopy.empty.title}</h3>
      <p className="mx-auto mt-2 max-w-md text-ink-muted">
        {context !== '' && <>Nessun risultato {context}. </>}
        {catalogCopy.empty.hint}
      </p>
      <Button onClick={onReset} className="mt-6">
        <RotateCcw aria-hidden="true" className="size-5" />
        {catalogCopy.empty.reset}
      </Button>
    </div>
  );
}
