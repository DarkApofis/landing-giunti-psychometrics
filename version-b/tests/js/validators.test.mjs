// Same cases as version-a/src/lib/validators.test.ts, against resources/js/lib/validators.js.
// Messages and limits as delivered by the page configuration (lang/it/ui.php → contact.validation,
// content.json → validation.limits); tests/Unit/UiStringsTest.php pins the PHP side to HANDOFF §6.2.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { loadScripts } from './load.mjs';

const MESSAGES = {
  nome: {
    required: 'Inserisci il tuo nome.',
    min: 'Il nome deve contenere almeno :min caratteri.',
    max: 'Il nome può contenere al massimo :max caratteri.',
  },
  email: {
    required: 'Inserisci il tuo indirizzo email.',
    invalid: 'Inserisci un indirizzo email valido, ad esempio nome@dominio.it.',
  },
  messaggio: {
    required: 'Scrivi il tuo messaggio.',
    min: 'Il messaggio deve contenere almeno :min caratteri (:missing).',
    missing_one: 'ne manca 1',
    missing_many: 'ne mancano :count',
    max: 'Il messaggio può contenere al massimo :max caratteri.',
  },
};
const LIMITS = JSON.parse(readFileSync(new URL('../../resources/data/content.json', import.meta.url), 'utf8')).validation.limits;

const lib = loadScripts('lib/validators.js').GP.lib.validators;
const v = lib.create(MESSAGES, LIMITS);
const plain = (value) => JSON.parse(JSON.stringify(value));

describe('limits come from content.json', () => {
  it('are 2–80 / 254 / 10–2000', () => {
    assert.deepEqual(LIMITS, { nomeMin: 2, nomeMax: 80, emailMax: 254, messaggioMin: 10, messaggioMax: 2000 });
  });
});

describe('isValidEmail', () => {
  for (const email of ['a@b.it', 'nome.cognome@studio-psicologia.it', 'nome+tag@example.co.uk', 'MARIO.ROSSI@EXAMPLE.COM']) {
    it(`accepts ${email}`, () => assert.equal(v.isValidEmail(email), true));
  }

  for (const email of ['', 'mario', 'mario@', '@example.it', 'mario@example', 'mario@example.i', 'mario rossi@example.it',
    'mario@@example.it', 'mario@.example.it', 'mario@example..it', 'mario.@example.it', '.mario@example.it']) {
    it(`rejects "${email}"`, () => assert.equal(v.isValidEmail(email), false));
  }

  it('rejects addresses longer than 254 characters', () => {
    assert.equal(v.isValidEmail(`${'a'.repeat(250)}@b.it`), false);
  });
});

describe('validateNome', () => {
  it('requires a value', () => {
    assert.equal(v.validateNome(''), 'Inserisci il tuo nome.');
    assert.equal(v.validateNome('   '), 'Inserisci il tuo nome.');
  });

  it('requires at least 2 characters, ignoring surrounding spaces', () => {
    assert.equal(v.validateNome('A'), 'Il nome deve contenere almeno 2 caratteri.');
    assert.equal(v.validateNome(' A '), 'Il nome deve contenere almeno 2 caratteri.');
    assert.equal(v.validateNome('Al'), undefined);
    assert.equal(v.validateNome('Zoë'), undefined);
  });

  it('caps the length', () => {
    assert.equal(v.validateNome('a'.repeat(81)), 'Il nome può contenere al massimo 80 caratteri.');
  });
});

describe('validateEmail', () => {
  it('requires a value', () => assert.equal(v.validateEmail(''), 'Inserisci il tuo indirizzo email.'));
  it('explains the expected format', () => {
    assert.equal(v.validateEmail('mario@example'), 'Inserisci un indirizzo email valido, ad esempio nome@dominio.it.');
  });
  it('trims before validating', () => assert.equal(v.validateEmail('  mario@example.it  '), undefined));
});

describe('validateMessaggio', () => {
  it('requires a value', () => assert.equal(v.validateMessaggio(''), 'Scrivi il tuo messaggio.'));

  it('requires at least 10 characters and says how many are missing', () => {
    assert.equal(v.validateMessaggio('Ciao!'), 'Il messaggio deve contenere almeno 10 caratteri (ne mancano 5).');
    assert.equal(v.validateMessaggio('123456789 '), 'Il messaggio deve contenere almeno 10 caratteri (ne manca 1).');
    assert.equal(v.validateMessaggio('1234567890'), undefined);
  });

  it('counts characters, not UTF-16 code units', () => {
    assert.equal(v.validateMessaggio('😀😀😀😀😀😀😀😀😀😀'), undefined);
    assert.match(v.validateMessaggio('😀😀😀😀😀😀😀😀😀'), /ne manca 1/);
  });

  it('caps the length', () => {
    assert.equal(v.validateMessaggio('a'.repeat(2001)), 'Il messaggio può contenere al massimo 2000 caratteri.');
  });
});

describe('validateContact / validateField / helpers', () => {
  const valid = { nome: 'Giulia', email: 'giulia@example.it', messaggio: 'Vorrei informazioni.' };

  it('returns no errors for a valid form', () => {
    assert.deepEqual(plain(v.validateContact(valid)), {});
    assert.equal(lib.hasErrors(v.validateContact(valid)), false);
  });

  it('returns one message per invalid field', () => {
    const errors = v.validateContact({ nome: '', email: 'x', messaggio: 'corto' });
    assert.deepEqual(plain(Object.keys(errors)), ['nome', 'email', 'messaggio']);
    assert.equal(lib.hasErrors(errors), true);
  });

  it('validates a single field by name', () => {
    assert.match(v.validateField('email', 'x'), /indirizzo email valido/);
    assert.equal(v.validateField('nome', 'Lu'), undefined);
  });

  it('finds the first invalid field in visual order', () => {
    assert.equal(lib.firstInvalidField({ messaggio: 'm', email: 'e' }), 'email');
    assert.equal(lib.firstInvalidField({ messaggio: 'm' }), 'messaggio');
    assert.equal(lib.firstInvalidField({}), null);
  });
});
