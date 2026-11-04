/**
 * The views compared between A and B. Every view runs in a fresh browser context (no localStorage),
 * with animations off, reduced motion, a fixed clock and the pointer parked outside the page.
 * Selectors use roles, names and ids that both versions share (HANDOFF §4), never framework classes.
 *
 * kind:
 *   'page'     full-page capture
 *   'element'  full-page capture clipped to an element (sticky header stays at the top, no repaint issues)
 *   'viewport' what is on screen (modal dialogs: they live in the top layer at viewport size)
 */

export const WIDTHS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

const pill = (page, name) =>
  page.getByRole('group', { name: 'Filtra per categoria' }).getByRole('button', { name: new RegExp(`^${name} \\d+ prodott`) });

async function addCourses(page) {
  for (const name of [/^Aggiungi al carrello: Disturbi/, /^Aggiungi al carrello: Assessment/]) {
    await page.getByRole('button', { name }).click();
  }
  // Wait until the 2 s "Aggiunto" feedback is over, then add the second course again (quantity 2).
  await page.getByRole('button', { name: /^Aggiungi al carrello: Assessment/ }).waitFor({ timeout: 4000 });
  await page.getByRole('button', { name: /^Aggiungi al carrello: Assessment/ }).click();
  await page.getByRole('button', { name: /^Aggiungi al carrello: Assessment/ }).waitFor({ timeout: 4000 });
}

async function fillContact(page, { nome, email, messaggio }) {
  await page.getByRole('textbox', { name: /^Nome/ }).fill(nome);
  await page.getByRole('textbox', { name: /^Email/ }).fill(email);
  await page.getByRole('textbox', { name: /^Messaggio/ }).fill(messaggio);
}

export const VIEWS = [
  { id: 'page', label: 'Página completa', kind: 'page' },
  { id: 'header', label: 'Header', kind: 'element', target: 'header' },
  { id: 'hero', label: 'Hero', kind: 'element', target: 'section[aria-labelledby="hero-title"]' },
  { id: 'catalog-all', label: 'Catálogo — Tutti', kind: 'element', target: '#catalogo' },
  {
    id: 'catalog-category',
    label: 'Catálogo — Formazione',
    kind: 'element',
    target: '#catalogo',
    async prepare(page) {
      await pill(page, 'Formazione').click();
    },
  },
  {
    id: 'catalog-empty',
    label: 'Catálogo — sin resultados',
    kind: 'element',
    target: '#catalogo',
    async prepare(page) {
      await page.getByRole('searchbox', { name: 'Cerca nel catalogo' }).fill('zzz');
      await page.getByRole('heading', { name: 'Nessun prodotto trovato' }).waitFor();
    },
  },
  {
    id: 'dialog',
    label: 'Diálogo de ficha (NEURA-Q)',
    kind: 'viewport',
    async prepare(page) {
      await page.getByRole('button', { name: /^Scopri di più: NEURA-Q/ }).click();
      await page.getByRole('dialog', { name: /NEURA-Q/ }).waitFor();
    },
  },
  {
    id: 'cart-empty',
    label: 'Carrito vacío',
    kind: 'viewport',
    async prepare(page) {
      await page.getByRole('button', { name: /^Apri il carrello/ }).click();
      await page.getByRole('dialog', { name: /Il tuo carrello/ }).waitFor();
    },
  },
  {
    id: 'cart-items',
    label: 'Carrito con artículos',
    kind: 'viewport',
    async prepare(page) {
      await addCourses(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.getByRole('button', { name: /^Apri il carrello/ }).click();
      await page.getByRole('dialog', { name: /Il tuo carrello/ }).getByRole('listitem').first().waitFor();
    },
  },
  { id: 'form-empty', label: 'Formulario vacío', kind: 'element', target: '#contatti' },
  {
    id: 'form-errors',
    label: 'Formulario con errores',
    kind: 'element',
    target: '#contatti',
    async prepare(page) {
      await fillContact(page, { nome: 'G', email: 'giulia@example', messaggio: 'Ciao!' });
      await page.getByRole('button', { name: 'Invia messaggio' }).click();
      await page.locator('#contatti').getByRole('alert').waitFor();
    },
  },
  {
    id: 'form-success',
    label: 'Formulario — éxito',
    kind: 'element',
    target: '#contatti',
    async prepare(page) {
      await fillContact(page, { nome: 'Giulia', email: 'giulia@example.it', messaggio: 'Vorrei informazioni su NEURA-Q.' });
      await page.getByRole('button', { name: 'Invia messaggio' }).click();
      await page.getByRole('heading', { name: /Grazie!/ }).waitFor();
    },
  },
  { id: 'footer', label: 'Footer', kind: 'element', target: 'footer' },
];
