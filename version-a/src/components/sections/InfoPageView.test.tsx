import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Footer } from '@/components/layout/Footer';
import { MainNav } from '@/components/layout/MainNav';
import { AppProviders } from '@/components/providers/AppProviders';
import { footerColumns, legalLinks } from '@/data/footer';
import { mainNav } from '@/data/navigation';
import { findInfoPage, infoPages } from '@/data/pages';
import { InfoPageView } from './InfoPageView';

// Async Server Component ('use cache'): React Testing Library cannot render it.
vi.mock('@/components/layout/CopyrightYear', () => ({ CopyrightYear: () => '2026' }));

function renderPage(slug: string) {
  vi.mocked(usePathname).mockReturnValue(`/${slug}`);
  const page = findInfoPage(slug);
  if (!page) throw new Error(`No page ${slug}`);
  render(
    <AppProviders>
      <MainNav items={mainNav} />
      <InfoPageView page={page} />
      <Footer />
    </AppProviders>,
  );
  return page;
}

beforeEach(() => {
  vi.mocked(usePathname).mockReturnValue('/');
});

describe('institutional pages (footer "Azienda", "Assistenza" and legal links)', () => {
  it('every page link of the footer has a page of its section, and every page is linked', () => {
    const linked = [
      ...footerColumns
        .filter((column) => column.title === 'Azienda' || column.title === 'Assistenza')
        .flatMap((column) =>
          column.links.map((link) => ({ href: link.href, section: column.title })),
        ),
      ...legalLinks.map((link) => ({ href: link.href, section: 'Note legali' })),
    ].filter(({ href }) => href.startsWith('/'));

    expect(linked.map(({ href }) => href).sort()).toEqual(
      infoPages.map((page) => `/${page.slug}`).sort(),
    );
    for (const { href, section } of linked) {
      expect(findInfoPage(href.slice(1))?.section).toBe(section);
    }
  });

  it('renders one h1, the breadcrumb and the demo notice', () => {
    const page = renderPage('chi-siamo');

    expect(screen.getByRole('heading', { level: 1, name: page.title })).toBeInTheDocument();
    const breadcrumb = screen.getByRole('navigation', { name: 'Percorso di navigazione' });
    expect(within(breadcrumb).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
    expect(within(breadcrumb).getByText('Chi siamo')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText(/Contenuto dimostrativo/)).toBeInTheDocument();
    for (const block of page.blocks) {
      expect(screen.getByRole('heading', { level: 2, name: block.heading })).toBeInTheDocument();
    }
  });

  it('marks the current page in the section navigation', () => {
    renderPage('faq');

    const nav = screen.getByRole('navigation', { name: 'In questa sezione: Assistenza' });
    expect(within(nav).getByRole('link', { name: 'Domande frequenti' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(nav).getByRole('link', { name: 'Spedizioni e resi' })).not.toHaveAttribute(
      'aria-current',
    );
    // "Contattaci" is the contact form of the home.
    expect(within(nav).getByRole('link', { name: 'Contattaci' })).toHaveAttribute(
      'href',
      '/#contatti',
    );
  });

  it('FAQ answers expand natively', async () => {
    const user = userEvent.setup();
    renderPage('faq');

    const question = screen.getByText('Quali metodi di pagamento accettate?');
    const details = question.closest('details');
    expect(details).not.toHaveAttribute('open');
    await user.click(question);
    expect(details).toHaveAttribute('open');
  });

  it('header and footer links to home sections point to the home, with the category', () => {
    renderPage('qualifiche');

    const header = screen.getByRole('navigation', { name: 'Navigazione principale' });
    expect(within(header).getByRole('link', { name: 'Formazione' })).toHaveAttribute(
      'href',
      '/?categoria=formazione#catalogo',
    );
    expect(within(header).getByRole('link', { name: 'Test' })).toHaveAttribute(
      'href',
      '/#catalogo',
    );
    // The footer is on every page: "Risorse" stays an in-page anchor.
    expect(within(header).getByRole('link', { name: 'Risorse' })).toHaveAttribute(
      'href',
      '#risorse',
    );

    const explore = screen.getByRole('navigation', { name: 'Esplora' });
    expect(within(explore).getByRole('link', { name: 'Scuola ed Età evolutiva' })).toHaveAttribute(
      'href',
      '/?categoria=scuola-eta-evolutiva#catalogo',
    );
    const cta = screen.getByRole('heading', { name: 'Non hai trovato quello che cercavi?' })
      .parentElement as HTMLElement;
    expect(within(cta).getByRole('link', { name: 'Contattaci' })).toHaveAttribute(
      'href',
      '/#contatti',
    );
  });

  it('legal pages use their own notice and list the other legal pages', () => {
    renderPage('cookie');

    expect(screen.getByText(/non ha valore legale/)).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'In questa sezione: Note legali' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/privacy', '/cookie', '/termini']);
    expect(within(nav).getByRole('link', { name: 'Cookie' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
