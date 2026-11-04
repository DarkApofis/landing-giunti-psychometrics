import { expect, test, type Page } from '@playwright/test';

/**
 * Every message of HANDOFF §6.2, triggered in the browser through the real form: visible under the
 * field, linked by aria-describedby (hint + error), aria-invalid set, and the summary count.
 */
const field = (page: Page, name: 'Nome' | 'Email' | 'Messaggio') =>
  page.getByRole('textbox', { name: new RegExp(`^${name}`) });
const submit = (page: Page) => page.getByRole('button', { name: 'Invia messaggio' });
const alert = (page: Page) => page.locator('#contatti').getByRole('alert');

const CASES: Array<[label: string, nome: string, email: string, messaggio: string, field: 'Nome' | 'Email' | 'Messaggio', message: string]> = [
  ['nome empty', '', 'a@b.it', '1234567890', 'Nome', 'Inserisci il tuo nome.'],
  ['nome blank (trimmed)', '   ', 'a@b.it', '1234567890', 'Nome', 'Inserisci il tuo nome.'],
  ['nome too short', 'A', 'a@b.it', '1234567890', 'Nome', 'Il nome deve contenere almeno 2 caratteri.'],
  ['email empty', 'Giulia', '', '1234567890', 'Email', 'Inserisci il tuo indirizzo email.'],
  ['email invalid', 'Giulia', 'mario@example', '1234567890', 'Email', 'Inserisci un indirizzo email valido, ad esempio nome@dominio.it.'],
  ['message empty', 'Giulia', 'a@b.it', '', 'Messaggio', 'Scrivi il tuo messaggio.'],
  ['message missing 5', 'Giulia', 'a@b.it', 'Ciao!', 'Messaggio', 'Il messaggio deve contenere almeno 10 caratteri (ne mancano 5).'],
  ['message missing 1', 'Giulia', 'a@b.it', '123456789 ', 'Messaggio', 'Il messaggio deve contenere almeno 10 caratteri (ne manca 1).'],
  ['message 9 emoji (characters, not UTF-16 units)', 'Giulia', 'a@b.it', '😀😀😀😀😀😀😀😀😀', 'Messaggio', 'Il messaggio deve contenere almeno 10 caratteri (ne manca 1).'],
];

for (const [label, nome, email, messaggio, invalid, message] of CASES) {
  test(`message: ${label}`, async ({ page }) => {
    await page.goto('/#contatti');
    await field(page, 'Nome').fill(nome);
    await field(page, 'Email').fill(email);
    await field(page, 'Messaggio').fill(messaggio);
    await submit(page).click();

    await expect(alert(page)).toHaveText('Il modulo contiene 1 errore: correggi il campo evidenziato.');
    await expect(field(page, invalid)).toBeFocused();
    await expect(field(page, invalid)).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#contatti').getByText(message, { exact: true })).toBeVisible();
    const description = invalid === 'Nome' ? message : new RegExp(`${message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
    await expect(field(page, invalid)).toHaveAccessibleDescription(description);
  });
}

test('the max-length messages are enforced even if maxlength is bypassed', async ({ page }) => {
  await page.goto('/#contatti');
  // maxlength stops typing; remove it to prove the validator itself enforces the limits.
  await page.evaluate(() => document.querySelectorAll('#contatti [maxlength]').forEach((el) => el.removeAttribute('maxlength')));
  await field(page, 'Nome').fill('a'.repeat(81));
  await field(page, 'Email').fill('giulia@example.it');
  await field(page, 'Messaggio').fill('a'.repeat(2001));
  await submit(page).click();
  await expect(alert(page)).toHaveText('Il modulo contiene 2 errori: correggi i campi evidenziati.');
  await expect(page.getByText('Il nome può contenere al massimo 80 caratteri.')).toBeVisible();
  await expect(page.getByText('Il messaggio può contenere al massimo 2000 caratteri.')).toBeVisible();
});

test('no validation while leaving a field before the first submit', async ({ page }) => {
  await page.goto('/#contatti');
  await field(page, 'Nome').fill('A');
  await field(page, 'Email').focus();
  await expect(field(page, 'Nome')).not.toHaveAttribute('aria-invalid');
  await expect(page.locator('#contact-nome-error')).toBeHidden();
});

test('sending: fields are readonly and the button keeps focus with aria-disabled', async ({ page }) => {
  await page.goto('/#contatti');
  await field(page, 'Nome').fill('Giulia');
  await field(page, 'Email').fill('giulia@example.it');
  await field(page, 'Messaggio').fill('Vorrei informazioni.');
  await submit(page).focus();
  await page.keyboard.press('Enter');
  const sending = page.getByRole('button', { name: 'Invio in corso…' });
  await expect(sending).toHaveAttribute('aria-disabled', 'true');
  await expect(sending).not.toHaveAttribute('disabled');
  await expect(sending).toBeFocused();
  await expect(field(page, 'Nome')).toHaveAttribute('readonly', '');
  await expect(page.getByRole('heading', { name: 'Grazie! Il tuo messaggio è stato inviato.' })).toBeFocused();
});
