import { CircleAlert } from 'lucide-react';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FieldProps {
  id: string;
  label: string;
  /** Helper text, always visible and linked via aria-describedby. */
  hint?: string;
  /** Error message; when present the control is aria-invalid and the message is linked. */
  error?: string;
  required?: boolean;
  /**
   * From 640px, lay the field out on a 4-row subgrid (label / hint / control / error) of its
   * parent, so side-by-side fields keep their controls aligned even when only one has a hint.
   * The parent must be a grid with no row gap.
   */
  subgrid?: boolean;
}

/**
 * DESIGN-SPEC §6.6: visible label above, required marker with sr-only text, 44px controls,
 * 16px text (no iOS zoom). Error state = danger border + 1px ring (simulated 2px border without
 * changing the box size) and a message with icon right below the control.
 */
const controlBase =
  'block w-full rounded-sm border bg-surface px-3.5 text-base text-ink transition-[border-color,box-shadow] duration-(--duration-fast) placeholder:text-ink-muted read-only:bg-canvas';
const controlState = (invalid: boolean) =>
  invalid
    ? 'border-danger ring-1 ring-danger'
    : 'border-border-strong hover:border-ink focus-visible:border-primary';

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  subgrid,
  children,
}: FieldProps & { children: ReactNode }) {
  return (
    <div className={cn(subgrid && 'sm:row-span-4 sm:grid sm:grid-rows-subgrid')}>
      <label htmlFor={id} className="row-start-1 block font-display text-sm font-semibold text-ink">
        {label}
        {required && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (obbligatorio)</span>
          </>
        )}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="row-start-2 mt-1 text-sm text-ink-muted">
          {hint}
        </p>
      )}
      <div className="row-start-3 mt-1.5">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          className="row-start-4 mt-1.5 flex items-start gap-1.5 text-sm text-danger"
        >
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

type TextFieldProps = FieldProps & Omit<ComponentPropsWithRef<'input'>, 'id' | 'required'>;

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  subgrid,
  className,
  ...input
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
      subgrid={subgrid}
    >
      <input
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(controlBase, 'h-11', controlState(Boolean(error)), className)}
        {...input}
      />
    </FieldShell>
  );
}

type TextAreaProps = FieldProps & Omit<ComponentPropsWithRef<'textarea'>, 'id' | 'required'>;

export function TextArea({
  id,
  label,
  hint,
  error,
  required,
  className,
  ...textarea
}: TextAreaProps) {
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={required}>
      <textarea
        id={id}
        aria-required={required || undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={cn(
          controlBase,
          'min-h-36 resize-y py-2.5 leading-normal',
          controlState(Boolean(error)),
          className,
        )}
        {...textarea}
      />
    </FieldShell>
  );
}
