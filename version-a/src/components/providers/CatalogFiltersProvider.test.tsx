import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CatalogFiltersProvider, useCatalogFilters } from './CatalogFiltersProvider';

function Probe() {
  const { category, query, setCategory, setQuery } = useCatalogFilters();
  return (
    <>
      <output data-testid="state">{`${category}|${query}`}</output>
      <button type="button" onClick={() => setCategory('scuola-eta-evolutiva')}>
        category
      </button>
      <button type="button" onClick={() => setQuery('wisc')}>
        query
      </button>
    </>
  );
}

function renderAt(url: string) {
  window.history.replaceState(null, '', url);
  vi.mocked(usePathname).mockReturnValue(new URL(url, 'http://localhost').pathname);
  return render(
    <CatalogFiltersProvider>
      <Probe />
    </CatalogFiltersProvider>,
  );
}

const state = () => screen.getByTestId('state').textContent;

afterEach(() => {
  vi.mocked(usePathname).mockReturnValue('/');
  window.history.replaceState(null, '', '/');
});

describe('<CatalogFiltersProvider> URL sync', () => {
  it('reads the filters from the URL on the home and keeps unrelated parameters when writing', async () => {
    renderAt('/?utm_source=newsletter&categoria=lavoro-organizzazioni');
    expect(state()).toBe('lavoro-organizzazioni|');
    expect(window.location.search).toBe('?utm_source=newsletter&categoria=lavoro-organizzazioni');

    await userEvent.click(screen.getByRole('button', { name: 'category' }));
    expect(window.location.search).toBe('?utm_source=newsletter&categoria=scuola-eta-evolutiva');
  });

  it('does not rewrite the URL of other pages (there is no catalogue there)', async () => {
    renderAt('/faq');
    await userEvent.click(screen.getByRole('button', { name: 'query' }));
    expect(state()).toBe('tutti|wisc');
    expect(`${window.location.pathname}${window.location.search}`).toBe('/faq');
  });

  it('on a client navigation back to the home, the URL wins: grid and address bar agree', async () => {
    const view = renderAt('/faq');
    await userEvent.click(screen.getByRole('button', { name: 'query' }));

    act(() => window.history.pushState(null, '', '/'));
    vi.mocked(usePathname).mockReturnValue('/');
    view.rerender(
      <CatalogFiltersProvider>
        <Probe />
      </CatalogFiltersProvider>,
    );
    expect(state()).toBe('tutti|');
    expect(window.location.search).toBe('');
  });
});
