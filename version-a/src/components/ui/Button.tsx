import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant =
  'primary' | 'secondary' | 'ghost' | 'ghost-danger' | 'on-dark' | 'on-dark-outline';
export type ButtonSize = 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type AsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps> & { href?: undefined };
type AsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps> & { href: string };

/**
 * Renders an `<a>` when `href` is given, otherwise a `<button>` (type="button" by default).
 * `className` is for layout additions (width, margins). Do not override `display`, padding or colours
 * through it: there is no class merging, so conflicting utilities depend on CSS order — wrap instead.
 */
export type ButtonProps = AsButton | AsLink;

// DESIGN-SPEC §6.1 — min 44px target, Figtree 600, colour-only transitions.
const base =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md font-display font-semibold whitespace-nowrap transition-colors duration-(--duration-fast) ease-out select-none disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'border border-primary bg-surface text-primary hover:bg-primary-subtle active:border-primary-active',
  ghost: 'text-ink hover:bg-primary-subtle',
  // Destructive ghost action ("Svuota il carrello"). A variant, not `className="text-danger"`:
  // without class merging, text-danger lost to the ghost variant's text-ink (found by docs/PARITY.md).
  'ghost-danger': 'text-danger hover:bg-primary-subtle',
  'on-dark': 'bg-white text-ink hover:bg-canvas active:bg-primary-subtle',
  'on-dark-outline': 'border border-white/60 text-white hover:border-white hover:bg-white/10',
};

const sizes: Record<ButtonSize, string> = {
  md: 'px-5 text-base',
  lg: 'min-h-12 px-6 text-lg',
};

/** Button look for elements that cannot use <Button> (e.g. client links with their own handlers). */
export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', className, children, ...rest } = props;
  const classes = buttonClasses(variant, size, className);

  if (rest.href !== undefined) {
    return (
      <a {...(rest as ComponentPropsWithoutRef<'a'>)} className={classes}>
        {children}
      </a>
    );
  }

  const { type = 'button', ...buttonRest } = rest as ComponentPropsWithoutRef<'button'>;
  return (
    <button type={type} {...buttonRest} className={classes}>
      {children}
    </button>
  );
}
