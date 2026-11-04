import { products } from './products';

/** Hero copy (original Italian text, not taken from the reference site). */
export const hero = {
  eyebrow: 'Catalogo 2026/27',
  title: 'Test psicologici e formazione per chi lavora con le persone',
  lead: 'Strumenti di valutazione standardizzati, questionari digitali e corsi accreditati ECM per psicologi, neuropsichiatri, insegnanti e professionisti delle risorse umane.',
  primaryCta: 'Esplora il catalogo',
  secondaryCta: 'Scopri la formazione',
} as const;

const tests = products.filter((p) => p.type === 'test');
const courses = products.filter((p) => p.type === 'corso');
const ecmCredits = courses.reduce((sum, c) => sum + (c.ecmCredits ?? 0), 0);

/** Key figures derived from the catalogue data (never hard-coded). */
export const heroStats: ReadonlyArray<{ value: number; label: string }> = [
  { value: tests.length, label: 'test e questionari' },
  { value: courses.length, label: 'corsi in calendario' },
  { value: ecmCredits, label: 'crediti ECM disponibili' },
];
