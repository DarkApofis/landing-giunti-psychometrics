import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ImgHTMLAttributes } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { CatalogSection } from '@/components/sections/CatalogSection';
import { STORAGE_KEY } from '@/lib/cart';
import { CartButton } from './CartButton';
import { CartDrawer } from './CartDrawer';

vi.mock('next/image', () => ({
  default: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => {
    // Test double for next/image (jsdom has no image optimiser).
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={String(src)} alt={alt} />;
  },
}));

function setup() {
  const user = userEvent.setup();
  render(
    <AppProviders>
      <CartButton />
      <CatalogSection />
      <CartDrawer />
    </AppProviders>,
  );
  const cartButton = () => screen.getByRole('button', { name: /^Apri il carrello/ });
  const addCourse = (name: RegExp) =>
    user.click(
      screen.getByRole('button', {
        name: new RegExp(`^Aggiun(?:gi|to) al carrello: ${name.source}`),
      }),
    );
  const drawer = () => screen.getByRole('dialog', { name: /Il tuo carrello/, hidden: true });
  const countLive = () =>
    screen
      .getAllByRole('status')
      .find((el) => /articol/.test(el.textContent ?? '') || el.textContent === '')!;
  return { user, cartButton, addCourse, drawer, countLive };
}

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe('cart: header indicator', () => {
  it('starts empty and announces the new count politely after adding', async () => {
    const { cartButton, addCourse } = setup();
    expect(cartButton()).toHaveAccessibleName('Apri il carrello, nessun articolo');

    await addCourse(/Somministrare/);
    expect(cartButton()).toHaveAccessibleName('Apri il carrello, 1 articolo nel carrello');
    const live = screen
      .getAllByRole('status')
      .find(
        (el) =>
          el.getAttribute('aria-live') === 'polite' && el.textContent === '1 articolo nel carrello',
      );
    expect(live).toBeDefined();
  });

  it('tests (Scopri di più) cannot be added: their dialog routes to the contact form', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /^Scopri di più: NEURA-Q/ }));
    const dialog = screen.getByRole('dialog', { name: /NEURA-Q/ });
    expect(within(dialog).queryByRole('button', { name: /Aggiungi al carrello/ })).toBeNull();
    expect(within(dialog).getByRole('link', { name: 'Richiedi informazioni' })).toHaveAttribute(
      'href',
      '#contatti',
    );
  });
});

describe('cart: drawer', () => {
  it('lists lines with quantities and an Italian subtotal computed in cents', async () => {
    const { user, cartButton, addCourse, drawer } = setup();
    await addCourse(/Disturbi specifici/); // 382,50 €
    await addCourse(/Disturbi specifici/);
    await addCourse(/Somministrare/); // 120,00 €
    await user.click(cartButton());

    const d = drawer();
    expect(d).toHaveAttribute('open');
    expect(d).toHaveAttribute('aria-modal', 'true');
    expect(within(d).getAllByRole('listitem')).toHaveLength(2);
    expect(within(d).getByRole('group', { name: /Quantità di Disturbi/ })).toHaveTextContent('2');
    // 2 × 382,50 + 120,00 = 885,00 €; savings 2 × 67,50 = 135,00 €
    expect(within(d).getByText('Subtotale').nextSibling).toHaveTextContent('885,00 €');
    expect(within(d).getByText('Risparmi').nextSibling).toHaveTextContent('135,00 €');

    await user.click(
      within(d).getByRole('button', { name: /^Aumenta la quantità di Somministrare/ }),
    );
    expect(within(d).getByText('Subtotale').nextSibling).toHaveTextContent('1.005,00 €');
  });

  it('minus is aria-disabled at quantity 1 (keeps focus) and does not go below 1', async () => {
    const { user, cartButton, addCourse, drawer } = setup();
    await addCourse(/Somministrare/);
    await user.click(cartButton());
    const minus = within(drawer()).getByRole('button', { name: /^Diminuisci la quantità/ });
    expect(minus).toHaveAttribute('aria-disabled', 'true');
    await user.click(minus);
    expect(within(drawer()).getByRole('group', { name: /Quantità di/ })).toHaveTextContent('1');
  });

  it('removing a line moves focus to the next one; removing the last focuses the empty-state action', async () => {
    const { user, cartButton, addCourse, drawer } = setup();
    await addCourse(/Disturbi specifici/);
    await addCourse(/Somministrare/);
    await user.click(cartButton());

    await user.click(within(drawer()).getByRole('button', { name: /^Rimuovi Disturbi/ }));
    expect(within(drawer()).getByRole('button', { name: /^Rimuovi Somministrare/ })).toHaveFocus();

    await user.click(within(drawer()).getByRole('button', { name: /^Rimuovi Somministrare/ }));
    expect(within(drawer()).getByText('Il carrello è vuoto')).toBeInTheDocument();
    expect(within(drawer()).getByRole('link', { name: 'Scopri i corsi' })).toHaveFocus();
  });

  it('"Svuota il carrello" empties it; "Procedi all’ordine" is visual only', async () => {
    const { user, cartButton, addCourse, drawer } = setup();
    await addCourse(/Somministrare/);
    await user.click(cartButton());
    const checkout = within(drawer()).getByRole('button', { name: 'Procedi all’ordine' });
    expect(checkout).toHaveAttribute('type', 'button');
    expect(checkout).toHaveAccessibleDescription('Demo: l’ordine non viene inviato.');
    await user.click(checkout); // nothing happens
    expect(within(drawer()).getAllByRole('listitem')).toHaveLength(1);

    await user.click(within(drawer()).getByRole('button', { name: 'Svuota il carrello' }));
    expect(within(drawer()).getByText('Il carrello è vuoto')).toBeInTheDocument();
    expect(cartButton()).toHaveAccessibleName('Apri il carrello, nessun articolo');
  });

  it('closes with the close button and returns focus to the cart button', async () => {
    const { user, cartButton, drawer } = setup();
    await user.click(cartButton());
    await user.click(within(drawer()).getByRole('button', { name: 'Chiudi il carrello' }));
    // Closed dialogs are hidden from the accessibility tree: look it up by id.
    expect(document.getElementById('cart-drawer')).not.toHaveAttribute('open');
    expect(cartButton()).toHaveFocus();
  });
});

describe('cart: persistence', () => {
  it('persists to localStorage and restores on the next mount without announcing', async () => {
    const first = setup();
    await first.addCourse(/Somministrare/);
    await first.addCourse(/Somministrare/);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual({
      version: 1,
      items: [{ productId: 'corso-attentio-r', quantity: 2 }],
    });

    document.body.innerHTML = '';
    const second = setup();
    expect(second.cartButton()).toHaveAccessibleName('Apri il carrello, 2 articoli nel carrello');
    const announced = screen
      .getAllByRole('status')
      .filter((el) => el.getAttribute('aria-live') === 'polite')
      .map((el) => el.textContent);
    expect(announced).not.toContain('2 articoli nel carrello'); // restoring is not a change
  });

  it('ignores corrupted storage', () => {
    window.localStorage.setItem(STORAGE_KEY, '{oops');
    const { cartButton } = setup();
    expect(cartButton()).toHaveAccessibleName('Apri il carrello, nessun articolo');
  });

  it('keeps working in memory when localStorage throws (blocked / quota exceeded)', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('blocked', 'SecurityError');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    const { cartButton, addCourse } = setup();
    await addCourse(/Somministrare/);
    expect(setItem).toHaveBeenCalled();
    expect(cartButton()).toHaveAccessibleName('Apri il carrello, 1 articolo nel carrello');
  });
});

describe('cart: cross-tab sync', () => {
  it('updates when another tab writes the cart', () => {
    const { cartButton } = setup();
    act(() => {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, items: [{ productId: 'corso-dsa', quantity: 3 }] }),
      );
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    });
    expect(cartButton()).toHaveAccessibleName('Apri il carrello, 3 articoli nel carrello');
  });

  it('empties when another tab clears the whole storage (storage event with key null)', async () => {
    const { cartButton, addCourse } = setup();
    await addCourse(/Somministrare/);
    act(() => {
      window.localStorage.clear();
      window.dispatchEvent(new StorageEvent('storage', { key: null }));
    });
    expect(cartButton()).toHaveAccessibleName('Apri il carrello, nessun articolo');
  });

  it('still persists local changes after a no-op change from another tab', async () => {
    const { addCourse } = setup();
    act(() => {
      window.localStorage.removeItem(STORAGE_KEY); // empty → empty: no state change in this tab
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
    });
    await addCourse(/Somministrare/);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}').items).toHaveLength(1);
  });
});
