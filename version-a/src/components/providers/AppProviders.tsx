import type { ReactNode } from 'react';
import { AnnouncerProvider } from './Announcer';
import { CartProvider } from './CartProvider';
import { CatalogFiltersProvider } from './CatalogFiltersProvider';

/** All client providers in one place; Server Components passed as children stay on the server. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AnnouncerProvider>
      <CartProvider>
        <CatalogFiltersProvider>{children}</CatalogFiltersProvider>
      </CartProvider>
    </AnnouncerProvider>
  );
}
