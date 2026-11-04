import { UserRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { mainNav } from '@/data/navigation';
import { CartButton } from './CartButton';
import { MainNav } from './MainNav';
import { MobileMenu } from './MobileMenu';
import { SearchBox } from './SearchBox';

/**
 * Sticky header (DESIGN-SPEC §6.8). Server Component: only SearchBox and MobileMenu are client islands.
 * Fixed row heights (64px, 72px ≥1024; search on a second 56px row < 768) → no layout shift.
 *
 *  < 768   : [logo ····· cart · menu]  /  [search ············]
 *  768–1023: [logo · search ····· Accedi · cart · menu]
 *  ≥ 1024  : [logo · nav ···· search · Accedi · cart]
 */
export function Header() {
  return (
    // Sticky only on viewports ≥ 30rem tall: at 400% zoom (≈320×256 CSS px) or in phone landscape
    // a sticky header would cover up to half the screen (audit finding, WCAG 1.4.10 reflow).
    <header className="relative top-0 z-40 border-b border-border bg-surface [@media(min-height:30rem)]:sticky">
      {/* The sticky <header> is the containing block of the mobile menu panel (full width). */}
      <div className="container-page flex flex-wrap items-center gap-x-3 md:flex-nowrap lg:gap-x-6">
        <div className="flex h-16 shrink-0 items-center lg:h-18">
          <Logo />
        </div>

        <MainNav items={mainNav} className="hidden lg:block" />

        <SearchBox className="order-last w-full pb-3 md:order-none md:ml-auto md:max-w-md md:flex-1 md:pb-0 lg:max-w-xs" />

        <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0">
          {/* Visibility lives on a wrapper: overriding Button's own `inline-flex` with `hidden`
              is order-dependent in the generated CSS (and lost: Accedi showed at 375px). */}
          <div className="hidden md:block">
            <Button variant="secondary">
              <UserRound aria-hidden="true" className="size-5" />
              Accedi
            </Button>
          </div>
          <CartButton />
          <MobileMenu items={mainNav} className="lg:hidden" />
        </div>
      </div>
    </header>
  );
}
