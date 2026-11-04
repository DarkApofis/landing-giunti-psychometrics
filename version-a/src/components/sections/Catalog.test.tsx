import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ImgHTMLAttributes } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBox } from '@/components/layout/SearchBox';
import { AppProviders } from '@/components/providers/AppProviders';
import { products } from '@/data/products';
import { CatalogSection } from './CatalogSection';

// Each ProductCard renders exactly one <Image>: counting mock renders = counting card renders.
const imageRenders = vi.hoisted(() => ({ count: 0 }));
vi.mock('next/image', () => ({
  default: ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => {
    imageRenders.count += 1;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={String(src)} alt={alt} />;
  },
}));

function setup() {
  const user = userEvent.setup();
  render(
    <AppProviders>
      <SearchBox />
      <CatalogSection />
    </AppProviders>,
  );
  return {
    user,
    search: screen.getByRole('searchbox', { name: 'Cerca nel catalogo' }),
    pill: (name: RegExp) =>
      within(screen.getByRole('group', { name: 'Filtra per categoria' })).getByRole('button', {
        name,
      }),
    cards: () => screen.queryAllByRole('article'),
  };
}

beforeEach(() => {
  imageRenders.count = 0;
  window.history.replaceState(null, '', '/');
});

describe('<Catalog>', () => {
  it('shows every product with "Tutti" pressed by default', () => {
    const { pill, cards } = setup();
    expect(cards()).toHaveLength(products.length);
    expect(pill(/^Tutti/)).toHaveAttribute('aria-pressed', 'true');
    // Visible counter (the polite live region holds the same text, announced later).
    expect(
      screen.getByText(`${products.length} prodotti trovati`, { selector: '[aria-hidden="true"]' }),
    ).toBeVisible();
  });

  it('filters by category and updates pressed state, counter and URL', async () => {
    const { user, pill, cards } = setup();
    await user.click(pill(/^Formazione/));
    expect(pill(/^Formazione/)).toHaveAttribute('aria-pressed', 'true');
    expect(pill(/^Tutti/)).toHaveAttribute('aria-pressed', 'false');
    expect(cards()).toHaveLength(4);
    expect(screen.getByText('4 prodotti trovati')).toBeInTheDocument();
    expect(window.location.search).toBe('?categoria=formazione');
  });

  it('combines category + accent/case-insensitive search', async () => {
    const { user, search, pill, cards } = setup();
    await user.click(pill(/^Formazione/));
    await user.type(search, 'ATTENTIO');
    expect(cards()).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Somministrare e interpretare ATTENTIO-R',
    );
    expect(screen.getByText('1 prodotto trovato')).toBeInTheDocument();

    await user.clear(search);
    await user.click(pill(/^Scuola ed Età evolutiva/));
    await user.type(search, 'eta'); // matches "età scolare" without the accent
    expect(cards().map((c) => within(c).getByRole('heading').textContent)).toEqual([
      'ATTENTIO-R — Attenzione e controllo esecutivo in età scolare',
    ]);
  });

  it('pill counts reflect the current search', async () => {
    const { user, search, pill } = setup();
    await user.type(search, 'attentio');
    expect(pill(/^Tutti/)).toHaveAccessibleName('Tutti 2 prodotti');
    expect(pill(/^Lavoro e Organizzazioni/)).toHaveAccessibleName(
      'Lavoro e Organizzazioni 0 prodotti',
    );
  });

  it('shows a friendly empty state and resets everything, moving focus to "Tutti"', async () => {
    const { user, search, pill, cards } = setup();
    await user.click(pill(/^Lavoro e Organizzazioni/));
    await user.type(search, 'zzz');
    expect(cards()).toHaveLength(0);
    expect(screen.getByRole('heading', { name: 'Nessun prodotto trovato' })).toBeInTheDocument();
    expect(
      screen.getByText(/Nessun risultato per «zzz» in Lavoro e Organizzazioni/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Azzera filtri' }));
    expect(cards()).toHaveLength(products.length);
    expect(search).toHaveValue('');
    expect(pill(/^Tutti/)).toHaveAttribute('aria-pressed', 'true');
    expect(pill(/^Tutti/)).toHaveFocus();
    expect(window.location.search).toBe('');
  });

  it('announces the result count politely, after typing pauses', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { user, search } = setup();
    const live = screen
      .getAllByRole('status')
      .find(
        (el) => el.getAttribute('aria-live') === 'polite' && el.textContent?.includes('trovat'),
      );
    expect(live).toBeDefined();
    await user.type(search, 'neura');
    expect(live).toHaveTextContent(`${products.length} prodotti trovati`); // not yet
    await act(() => vi.advanceTimersByTimeAsync(450));
    expect(live).toHaveTextContent('1 prodotto trovato');
    vi.useRealTimers();
  });

  it('gives every action button a unique accessible name', () => {
    setup();
    const names = screen
      .getAllByRole('button', { name: /^(Scopri di più|Aggiungi al carrello):/ })
      .map((b) => b.getAttribute('aria-label'));
    expect(names).toHaveLength(products.length);
    expect(new Set(names).size).toBe(products.length);
  });

  it('tests open the details dialog; courses add to the cart with feedback', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /^Scopri di più: NEURA-Q/ }));
    const dialog = screen.getByRole('dialog', { name: /NEURA-Q/ });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByText('Qualifica C')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Chiudi' }));
    expect(dialog).not.toHaveAttribute('open');

    const add = screen.getByRole('button', { name: /^Aggiungi al carrello: Somministrare/ });
    await user.click(add);
    expect(add).toHaveAccessibleName(/^Aggiunto al carrello: Somministrare/);
  });

  it('does not re-render cards that stay visible while typing (memo is effective)', async () => {
    const { user, search } = setup();
    expect(imageRenders.count).toBe(products.length); // initial render

    imageRenders.count = 0;
    await user.type(search, ' '); // blank query → same 12 products, new filter state
    expect(imageRenders.count).toBe(0);

    await user.type(search, 'attentio'); // 12 → 2 visible: survivors keep their props
    expect(imageRenders.count).toBe(0);
  });
});
