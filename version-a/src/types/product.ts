/**
 * Catalogue domain types. Product is a discriminated union on `type`:
 * tests carry an age range, courses carry a start date.
 */

export const CATEGORY_IDS = [
  'clinica-neuropsicologia',
  'scuola-eta-evolutiva',
  'lavoro-organizzazioni',
  'formazione',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface Category {
  id: CategoryId;
  /** Visible label, e.g. "Clinica e Neuropsicologia". */
  label: string;
}

/** Active catalogue filter: one category or all of them. */
export type CategoryFilter = CategoryId | 'tutti';

export type TestFormat = 'Cartaceo' | 'Digitale';
export type CourseFormat = 'Corso online' | 'In presenza';
export type ProductFormat = TestFormat | CourseFormat;

/** Professional qualification required to purchase a test (A = lowest, C = highest). */
export type Qualification = 'A' | 'B' | 'C';

export interface AgeRange {
  min: number;
  /** `null` = open-ended upper bound ("18+ anni"). */
  max: number | null;
  unit: 'anni' | 'mesi';
}

export interface ProductImage {
  /** Absolute Unsplash URL (allowed via images.remotePatterns in next.config.ts). */
  src: string;
  /** Italian description of the scene, never "immagine di…". */
  alt: string;
}

interface ProductBase {
  id: string;
  slug: string;
  name: string;
  /** One short sentence shown on the card. */
  description: string;
  category: CategoryId;
  /** Euros, VAT included. */
  originalPrice: number;
  /** Euros, VAT included. `null` = no discount, only `originalPrice` is shown. */
  discountPrice: number | null;
  image: ProductImage;
}

export interface TestProduct extends ProductBase {
  type: 'test';
  format: TestFormat;
  author: string;
  ageRange: AgeRange;
  qualification: Qualification;
  /** Approximate administration time in minutes. */
  administrationMinutes: number;
}

export interface CourseProduct extends ProductBase {
  type: 'corso';
  format: CourseFormat;
  /** Docente. */
  instructor: string;
  /** ISO date without time (YYYY-MM-DD) to avoid timezone shifts. */
  startDate: string;
  durationHours: number;
  /** Italian CME credits (ECM); `null` when the course is not accredited. */
  ecmCredits: number | null;
  /** City for in-person courses, `null` for online ones. */
  location: string | null;
}

export type Product = TestProduct | CourseProduct;
