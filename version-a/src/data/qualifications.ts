import type { Qualification } from '@/types/product';

/** Who may purchase a test at each qualification level (fictional policy, Italian copy). */
export const qualifications: Record<Qualification, { label: string; description: string }> = {
  A: {
    label: 'Qualifica A',
    description:
      'Utilizzabile da insegnanti, educatori e professionisti HR formati all’uso dello strumento.',
  },
  B: {
    label: 'Qualifica B',
    description:
      'Riservato a laureati in psicologia, medicina o scienze dell’educazione con formazione in psicometria.',
  },
  C: {
    label: 'Qualifica C',
    description: 'Riservato a psicologi e medici abilitati all’esercizio della professione.',
  },
};
