/**
 * Contact form validation: pure functions, Italian messages, no dependencies.
 * Values are trimmed before checking; lengths count characters (code points), not UTF-16 units.
 */
import type { ContactErrors, ContactField, ContactValues } from '@/types/contact';

export const CONTACT_LIMITS = {
  nomeMin: 2,
  nomeMax: 80,
  emailMax: 254,
  messaggioMin: 10,
  messaggioMax: 2000,
} as const;

/** Visual (and focus) order of the fields. */
export const CONTACT_FIELDS: readonly ContactField[] = ['nome', 'email', 'messaggio'];

const length = (value: string) => [...value].length;

// Pragmatic address check (not full RFC 5322): dot-separated local part without leading,
// trailing or doubled dots; domain labels that do not start/end with "-"; alphabetic TLD ≥ 2.
const EMAIL =
  /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

export function isValidEmail(value: string): boolean {
  return value.length <= CONTACT_LIMITS.emailMax && EMAIL.test(value);
}

export function validateNome(raw: string): string | undefined {
  const value = raw.trim();
  if (value === '') return 'Inserisci il tuo nome.';
  if (length(value) < CONTACT_LIMITS.nomeMin) {
    return `Il nome deve contenere almeno ${CONTACT_LIMITS.nomeMin} caratteri.`;
  }
  if (length(value) > CONTACT_LIMITS.nomeMax) {
    return `Il nome può contenere al massimo ${CONTACT_LIMITS.nomeMax} caratteri.`;
  }
  return undefined;
}

export function validateEmail(raw: string): string | undefined {
  const value = raw.trim();
  if (value === '') return 'Inserisci il tuo indirizzo email.';
  if (!isValidEmail(value)) {
    return 'Inserisci un indirizzo email valido, ad esempio nome@dominio.it.';
  }
  return undefined;
}

export function validateMessaggio(raw: string): string | undefined {
  const value = raw.trim();
  if (value === '') return 'Scrivi il tuo messaggio.';
  const count = length(value);
  if (count < CONTACT_LIMITS.messaggioMin) {
    const missing = CONTACT_LIMITS.messaggioMin - count;
    return `Il messaggio deve contenere almeno ${CONTACT_LIMITS.messaggioMin} caratteri (${
      missing === 1 ? 'ne manca 1' : `ne mancano ${missing}`
    }).`;
  }
  if (count > CONTACT_LIMITS.messaggioMax) {
    return `Il messaggio può contenere al massimo ${CONTACT_LIMITS.messaggioMax} caratteri.`;
  }
  return undefined;
}

const VALIDATORS: Record<ContactField, (value: string) => string | undefined> = {
  nome: validateNome,
  email: validateEmail,
  messaggio: validateMessaggio,
};

export function validateField(field: ContactField, value: string): string | undefined {
  return VALIDATORS[field](value);
}

export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  for (const field of CONTACT_FIELDS) {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  }
  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return CONTACT_FIELDS.some((field) => errors[field] !== undefined);
}

export function firstInvalidField(errors: ContactErrors): ContactField | null {
  return CONTACT_FIELDS.find((field) => errors[field] !== undefined) ?? null;
}
