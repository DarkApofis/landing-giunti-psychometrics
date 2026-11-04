'use client';

import { Menu, UserRound, X } from 'lucide-react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { NavItem } from '@/data/navigation';
import { cn } from '@/lib/cn';
import { CatalogLink } from './CatalogLink';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled])';
const DESKTOP_QUERY = '(min-width: 64rem)';

/**
 * Hamburger menu for < 1024px (DESIGN-SPEC §6.8).
 * - aria-expanded / aria-controls on the toggle
 * - Esc closes and returns focus to the toggle
 * - simple focus trap: Tab cycles between the toggle and the panel's controls
 * - click on the backdrop closes; the page behind does not scroll while open
 */
export function MobileMenu({
  items,
  className,
}: {
  items: readonly NavItem[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!panel || !toggle) return;

    panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== 'Tab' || !panel || !toggle) return;

      const focusables = [toggle, ...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first?.focus();
      } else if (!focusables.includes(active as HTMLElement)) {
        // Focus escaped (e.g. after a click elsewhere): bring it back inside.
        event.preventDefault();
        first?.focus();
      }
    }

    const desktop = window.matchMedia(DESKTOP_QUERY);
    function handleBreakpoint(event: MediaQueryListEvent) {
      if (event.matches) setOpen(false);
    }

    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    document.addEventListener('keydown', handleKeyDown);
    desktop.addEventListener('change', handleBreakpoint);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      desktop.removeEventListener('change', handleBreakpoint);
      root.style.overflow = previousOverflow;
    };
  }, [open, close]);

  return (
    <div className={className}>
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Chiudi il menu' : 'Apri il menu'}
        onClick={() => (open ? close(false) : setOpen(true))}
        className="grid size-11 cursor-pointer place-items-center rounded-md text-ink transition-colors duration-(--duration-fast) hover:bg-primary-subtle"
      >
        {open ? (
          <X aria-hidden="true" className="size-6" />
        ) : (
          <Menu aria-hidden="true" className="size-6" />
        )}
      </button>

      <div id={panelId} hidden={!open} className="absolute inset-x-0 top-full">
        {/* Backdrop: dims the page, click closes. Decorative for assistive tech. */}
        <div
          aria-hidden="true"
          onClick={() => close(false)}
          className="absolute inset-x-0 top-0 h-dvh bg-backdrop"
        />
        <div
          ref={panelRef}
          className={cn(
            'relative border-b border-border bg-surface shadow-overlay',
            'transition-[opacity,translate] duration-(--duration-enter) ease-(--ease-standard)',
            'starting:-translate-y-2 starting:opacity-0',
          )}
        >
          <nav aria-label="Navigazione principale" className="container-page py-3">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.label}>
                  <CatalogLink
                    href={item.href}
                    category={item.category}
                    onNavigate={() => close(false)}
                    className="flex min-h-12 items-center rounded-md px-3 font-display text-lg font-medium text-ink transition-colors duration-(--duration-fast) hover:bg-primary-subtle hover:text-primary"
                  >
                    {item.label}
                  </CatalogLink>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-border pt-4 md:hidden">
              <Button variant="secondary" className="w-full">
                <UserRound aria-hidden="true" className="size-5" />
                Accedi
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
