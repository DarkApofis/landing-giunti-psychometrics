import { describe, expect, it } from 'vitest';
import {
  CONTACT_LIMITS,
  firstInvalidField,
  hasErrors,
  isValidEmail,
  validateContact,
  validateEmail,
  validateField,
  validateMessaggio,
  validateNome,
} from './validators';

describe('isValidEmail', () => {
  it.each([
    'a@b.it',
    'nome.cognome@studio-psicologia.it',
    'nome+tag@example.co.uk',
    'MARIO.ROSSI@EXAMPLE.COM',
  ])('accepts %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each([
    '',
    'mario',
    'mario@',
    '@example.it',
    'mario@example',
    'mario@example.i',
    'mario rossi@example.it',
    'mario@@example.it',
    'mario@.example.it',
    'mario@example..it',
    'mario.@example.it',
    '.mario@example.it',
  ])('rejects "%s"', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });

  it('rejects addresses longer than 254 characters', () => {
    expect(isValidEmail(`${'a'.repeat(250)}@b.it`)).toBe(false);
  });
});

describe('validateNome (required, ≥ 2 characters after trimming)', () => {
  it('requires a value', () => {
    expect(validateNome('')).toBe('Inserisci il tuo nome.');
    expect(validateNome('   ')).toBe('Inserisci il tuo nome.');
  });

  it('requires at least 2 characters, ignoring surrounding spaces', () => {
    expect(validateNome('A')).toBe('Il nome deve contenere almeno 2 caratteri.');
    expect(validateNome(' A ')).toBe('Il nome deve contenere almeno 2 caratteri.');
    expect(validateNome('Al')).toBeUndefined();
    expect(validateNome('Zoë')).toBeUndefined();
  });

  it('caps the length', () => {
    expect(validateNome('a'.repeat(CONTACT_LIMITS.nomeMax + 1))).toBe(
      `Il nome può contenere al massimo ${CONTACT_LIMITS.nomeMax} caratteri.`,
    );
  });
});

describe('validateEmail', () => {
  it('requires a value', () => {
    expect(validateEmail('')).toBe('Inserisci il tuo indirizzo email.');
  });

  it('explains the expected format', () => {
    expect(validateEmail('mario@example')).toBe(
      'Inserisci un indirizzo email valido, ad esempio nome@dominio.it.',
    );
  });

  it('trims before validating', () => {
    expect(validateEmail('  mario@example.it  ')).toBeUndefined();
  });
});

describe('validateMessaggio (required, ≥ 10 characters after trimming)', () => {
  it('requires a value', () => {
    expect(validateMessaggio('')).toBe('Scrivi il tuo messaggio.');
  });

  it('requires at least 10 characters and says how many are missing', () => {
    expect(validateMessaggio('Ciao!')).toBe(
      'Il messaggio deve contenere almeno 10 caratteri (ne mancano 5).',
    );
    expect(validateMessaggio('123456789 ')).toBe(
      'Il messaggio deve contenere almeno 10 caratteri (ne manca 1).',
    );
    expect(validateMessaggio('1234567890')).toBeUndefined();
  });

  it('counts characters, not UTF-16 code units', () => {
    expect(validateMessaggio('😀😀😀😀😀😀😀😀😀😀')).toBeUndefined(); // 10 emoji
    expect(validateMessaggio('😀😀😀😀😀😀😀😀😀')).toMatch(/ne manca 1/);
  });

  it('caps the length', () => {
    expect(validateMessaggio('a'.repeat(CONTACT_LIMITS.messaggioMax + 1))).toBe(
      `Il messaggio può contenere al massimo ${CONTACT_LIMITS.messaggioMax} caratteri.`,
    );
  });
});

describe('validateContact / validateField / helpers', () => {
  const valid = { nome: 'Giulia', email: 'giulia@example.it', messaggio: 'Vorrei informazioni.' };

  it('returns no errors for a valid form', () => {
    expect(validateContact(valid)).toEqual({});
    expect(hasErrors(validateContact(valid))).toBe(false);
  });

  it('returns one message per invalid field', () => {
    const errors = validateContact({ nome: '', email: 'x', messaggio: 'corto' });
    expect(Object.keys(errors)).toEqual(['nome', 'email', 'messaggio']);
    expect(hasErrors(errors)).toBe(true);
  });

  it('validates a single field by name', () => {
    expect(validateField('email', 'x')).toMatch(/indirizzo email valido/);
    expect(validateField('nome', 'Lu')).toBeUndefined();
  });

  it('finds the first invalid field in visual order', () => {
    expect(firstInvalidField({ messaggio: 'm', email: 'e' })).toBe('email');
    expect(firstInvalidField({ messaggio: 'm' })).toBe('messaggio');
    expect(firstInvalidField({})).toBeNull();
  });
});
