import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { contactCopy } from '@/data/contact';
import { ContactForm } from './ContactForm';

function setup() {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<ContactForm />);
  return {
    user,
    nome: screen.getByRole('textbox', { name: /^Nome/ }),
    email: screen.getByRole('textbox', { name: /^Email/ }),
    messaggio: screen.getByRole('textbox', { name: /^Messaggio/ }),
    submit: () => screen.getByRole('button', { name: /Invia messaggio|Invio in corso/ }),
  };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('<ContactForm>', () => {
  it('uses noValidate and labelled, required controls', () => {
    const { nome, email, messaggio } = setup();
    expect(screen.getByRole('form')).toHaveAttribute('novalidate');
    for (const field of [nome, email, messaggio]) {
      expect(field).toHaveAttribute('aria-required', 'true');
      expect(field).not.toHaveAttribute('aria-invalid');
    }
    expect(email).toHaveAccessibleDescription('Ti risponderemo a questo indirizzo.');
  });

  it('does not show errors before the first submit (no premature validation on blur)', async () => {
    const { user, nome, email } = setup();
    await user.click(nome);
    await user.tab();
    await user.type(email, 'x');
    await user.tab();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(email).not.toHaveAttribute('aria-invalid');
  });

  it('on submit with errors: marks every invalid field, links the message and focuses the first', async () => {
    const { user, nome, email, messaggio, submit } = setup();
    await user.type(email, 'mario@example');
    await user.click(submit());

    expect(nome).toHaveFocus();
    expect(nome).toHaveAttribute('aria-invalid', 'true');
    expect(nome).toHaveAccessibleDescription('Inserisci il tuo nome.');
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(
      'Ti risponderemo a questo indirizzo. Inserisci un indirizzo email valido, ad esempio nome@dominio.it.',
    );
    expect(messaggio).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Il modulo contiene 3 errori: correggi i campi evidenziati.',
    );
  });

  it('focuses the first invalid field in visual order (not always "Nome")', async () => {
    const { user, nome, email, submit } = setup();
    await user.type(nome, 'Giulia');
    await user.click(submit());
    expect(email).toHaveFocus();
  });

  it('after the first error, re-validates while typing and on blur', async () => {
    const { user, nome, messaggio, submit } = setup();
    await user.click(submit());
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.type(nome, 'G');
    expect(nome).toHaveAccessibleDescription('Il nome deve contenere almeno 2 caratteri.');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(); // summary hides once the user acts
    await user.type(nome, 'i');
    expect(nome).not.toHaveAttribute('aria-invalid');

    await user.type(messaggio, 'Ciao');
    await user.tab();
    expect(messaggio).toHaveAccessibleDescription(
      'Almeno 10 caratteri. Il messaggio deve contenere almeno 10 caratteri (ne mancano 6).',
    );
  });

  it('simulates sending, ignores double submit, then shows success and focuses it', async () => {
    const { user, nome, email, messaggio, submit } = setup();
    await user.type(nome, '  Giulia ');
    await user.type(email, 'giulia@example.it');
    await user.type(messaggio, 'Vorrei informazioni su NEURA-Q.');
    await user.click(submit());

    expect(submit()).toHaveAccessibleName(contactCopy.submitting);
    expect(submit()).toHaveAttribute('aria-disabled', 'true');
    expect(nome).toHaveAttribute('readonly');
    await user.click(submit()); // ignored

    await act(() => vi.advanceTimersByTimeAsync(contactCopy.submitDelayMs));
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Grazie! Il tuo messaggio è stato inviato.');
    expect(status).toHaveTextContent('Giulia, ti risponderemo al più presto.');
    expect(screen.getByRole('heading', { name: contactCopy.success.title })).toHaveFocus();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  it('"Invia un altro messaggio" restores an empty form with focus on "Nome"', async () => {
    const { user, nome, email, messaggio, submit } = setup();
    await user.type(nome, 'Giulia');
    await user.type(email, 'giulia@example.it');
    await user.type(messaggio, 'Vorrei informazioni.');
    await user.click(submit());
    await act(() => vi.advanceTimersByTimeAsync(contactCopy.submitDelayMs));

    await user.click(screen.getByRole('button', { name: contactCopy.success.again }));
    const fresh = screen.getByRole('textbox', { name: /^Nome/ });
    expect(fresh).toHaveValue('');
    expect(fresh).toHaveFocus();
    expect(screen.getByRole('textbox', { name: /^Messaggio/ })).toHaveValue('');
  });
});
