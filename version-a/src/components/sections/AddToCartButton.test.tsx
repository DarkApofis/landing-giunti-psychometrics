import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { AppProviders } from '@/components/providers/AppProviders';
import { MAX_QUANTITY, STORAGE_KEY } from '@/lib/cart';
import { AddToCartButton } from './AddToCartButton';

const ID = 'corso-valutazione-adulto';
const NAME = 'Valutazione neuropsicologica dell’adulto: dalla teoria alla pratica';

function setup(quantity?: number) {
  if (quantity !== undefined) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, items: [{ productId: ID, quantity }] }),
    );
  }
  render(
    <AppProviders>
      <AddToCartButton productId={ID} productName={NAME} />
    </AppProviders>,
  );
  return {
    user: userEvent.setup(),
    button: screen.getByRole('button', { name: /Aggiungi al carrello/ }),
  };
}

afterEach(() => localStorage.clear());

describe('<AddToCartButton>', () => {
  it('confirms a real addition', async () => {
    const { user, button } = setup();
    await user.click(button);
    expect(button).toHaveAccessibleName(`Aggiunto al carrello: ${NAME}`);
    expect(await screen.findByText(`${NAME} aggiunto al carrello`)).toBeInTheDocument();
  });

  it(`at the maximum (${MAX_QUANTITY}) says so instead of claiming it was added`, async () => {
    const { user, button } = setup(MAX_QUANTITY);
    await screen.findByRole('button', { name: /Aggiungi al carrello/ }); // after hydration
    await user.click(button);

    expect(button).toHaveAccessibleName(`Quantità massima raggiunta: ${NAME}`);
    expect(
      await screen.findByText(`${NAME}: quantità massima (${MAX_QUANTITY}) già nel carrello`),
    ).toBeInTheDocument();
    expect(screen.queryByText(`${NAME} aggiunto al carrello`)).toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}').items).toEqual([
      { productId: ID, quantity: MAX_QUANTITY },
    ]);
  });
});
