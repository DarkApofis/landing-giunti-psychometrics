# Plan de implementación — version-a (Next.js)

Basado en [DESIGN-SPEC.md](DESIGN-SPEC.md) y el contexto maestro. Supuestos en [ASSUMPTIONS.md](ASSUMPTIONS.md),
mejoras en [IMPROVEMENTS.md](IMPROVEMENTS.md).

Versiones estables verificadas en npm (2026-11-03): `next` 16.4.5 · `tailwindcss` 4.3.4 · `lucide-react` 1.67.0 ·
`vitest` 5.1.0 · `@playwright/test` 1.64.1.

**Reglas de ejecución**
- Cada tarea cabe en ≤ 15 min y termina con su criterio de “hecho” **ejecutado** y un commit (Conventional Commits, en inglés, sin trailers de co-autoría).
- Si un criterio falla, se marca ✗ en la columna Estado con el motivo, y no se pasa a la siguiente tarea hasta corregirlo.
- Comandos (desde `/version-a`): `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` · `npm run e2e` · `npm run check:tokens`.
- `verify` = `lint && typecheck && test && build` (script agregado).

---

## 0. Progreso y revisiones

**Revisión del 2026-11-03 (prompt de scaffold del usuario), que prevalece sobre lo que dice más abajo:**
- Sin `/shared`: los tokens van en `version-a/src/styles/tokens.css` y los datos en `src/data/products.ts` (ASSUMPTIONS A5, A20).
- Imágenes remotas de Unsplash con `remotePatterns` (A4) → desaparecen las tareas 2.9 (descarga a WebP) y `sync-shared.mjs`.
- `formatPrice` con `Intl` + `useGrouping: 'always'` (A17) → el riesgo R2 queda mitigado con tests y una comprobación en Chrome.
- Tipos definitivos en `src/types/product.ts`: precios en euros (`originalPrice`, `discountPrice | null`), `type: 'test' | 'corso'`,
  formatos con su etiqueta italiana, y campos extra M9. El borrador del §3 queda como referencia histórica.
- Categorías: Clinica e Neuropsicologia · Scuola ed Età evolutiva · Lavoro e Organizzazioni · Formazione.

| Hecho | Tarea | Evidencia |
|---|---|---|
| ✓ | 0.1 Monorepo + git | commit `8174c52` |
| ✓ | 0.2 Next.js 16.4.5 (create-next-app 16.4.5), Node 24.16.0 / npm 11.13.0, `engines` + `.nvmrc` | commit `2fb77dc`; `next build` en verde |
| ✓ | 0.3 tsconfig `strict` + `noUncheckedIndexedAccess` + `noImplicitOverride`; Prettier | commit `a564a3f`; `tsc --noEmit` exit 0 |
| ✓ | 0.5 Vitest 5 + RTL + jsdom | 46 tests en verde |
| ✓ | 1.1–1.5 Tokens, `--color-*: initial`, `check:tokens` (probado también en negativo), globals, fuentes, `lang="it"`, metadata SEO, favicon SVG | commit `aff7c94`; CSS generado inspeccionado; fuentes precargadas por la cabecera `Link` |
| ✓ | 2.1 Tipos | `tsc` en verde |
| ✓ | 2.2–2.3 `format.ts` (TDD: en rojo → en verde) | 18 tests |
| ✓ | 2.5–2.6 `search.ts`, `catalog.ts` (TDD) | 18 tests |
| ✓ | 2.8/2.10 Datos (12 productos) + test de integridad y lista negra | 8 tests |
| ✓ | 0.6 Playwright + axe-core (`npm run e2e`, `npm run e2e:screenshots`) | 22 e2e + 6 capturas en verde |
| ✓ | 1.5 Skip link + landmarks (`header`/`main#main`/`footer`) | e2e “skip link…”, “landmarks…” |
| ✓ | 3.1 `Button` (5 variantes, `href` → `<a>`), 3.6 `Logo` | e2e + revisión visual |
| ✓ | 4.3 `CatalogFiltersProvider` (sin URL todavía; la sincronización va con 5.10) | e2e del buscador |
| ✓ | 5.1–5.3 Header, MainNav, SearchBox, MobileMenu | e2e de teclado, de trampa de foco y de alturas por breakpoint; capturas 375/768/1280 |
| ✓ | 5.6 Hero + HeroIllustration | capturas; axe sin violaciones |
| ☐ | 2.4 validación, 2.7 carrito, 3.2–3.5, 4.1–4.2, 5.4–5.5, 5.7–5.14, fase 6 | pendiente |

---

## 1. Árbol de carpetas final

```
landing-giunti-psychometrics/
├─ README.md                      # índice del monorepo
├─ .gitignore · .gitattributes (eol=lf) · .editorconfig
├─ docs/
│  ├─ DESIGN-SPEC.md · PLAN.md · ASSUMPTIONS.md · IMPROVEMENTS.md · CREDITS.md
│  ├─ screenshots/version-a/      # capturas 375/768/1280 + estados
│  └─ lighthouse/version-a/       # informes HTML/JSON
├─ version-a/
│  ├─ README.md
│  ├─ package.json · tsconfig.json · next.config.ts · eslint.config.mjs · .prettierrc
│  ├─ vitest.config.ts · vitest.setup.ts · playwright.config.ts
│  ├─ .nvmrc · .prettierrc.json
│  ├─ scripts/
│  │  └─ check-tokens.mjs         # falla si hay hex/rgb sueltos fuera de los archivos de tokens
│  ├─ e2e/
│  │  ├─ catalog.spec.ts · cart.spec.ts · contact.spec.ts · keyboard.spec.ts
│  │  ├─ a11y.spec.ts             # axe-core
│  │  └─ screenshots.spec.ts      # 375 / 768 / 1280
│  └─ src/
│     ├─ app/
│     │  ├─ layout.tsx · page.tsx · globals.css · icon.svg · not-found.tsx
│     ├─ components/
│     │  ├─ ui/                   # piezas atómicas reutilizables
│     │  │  ├─ Button.tsx · IconButton.tsx · FormatBadge.tsx · DiscountChip.tsx · Price.tsx
│     │  │  ├─ TextField.tsx · TextArea.tsx · QuantityStepper.tsx · Logo.tsx · SocialIcon.tsx
│     │  ├─ layout/               # chrome global
│     │  │  ├─ SkipLink.tsx · Header.tsx · MainNav.tsx · MobileMenu.tsx · SearchBox.tsx
│     │  │  ├─ CartButton.tsx · CartDrawer.tsx · CartLine.tsx · Footer.tsx
│     │  ├─ sections/             # bloques de página
│     │  │  ├─ Hero.tsx · HeroIllustration.tsx
│     │  │  ├─ Catalog.tsx · CategoryFilter.tsx · ResultsStatus.tsx · ProductGrid.tsx
│     │  │  ├─ ProductCard.tsx · AddToCartButton.tsx · EmptyState.tsx
│     │  │  └─ ContactSection.tsx · ContactForm.tsx · ContactSuccess.tsx
│     │  └─ providers/            # contextos cliente (ver ASSUMPTIONS A15)
│     │     ├─ AppProviders.tsx · CartProvider.tsx · CatalogFiltersProvider.tsx · Announcer.tsx
│     ├─ styles/
│     │  └─ tokens.css            # @theme de Tailwind 4 (colores, tipografía, radios, sombras, movimiento)
│     ├─ data/
│     │  ├─ products.ts (+ .test.ts)  # catálogo ficticio tipado + test de integridad
│     │  ├─ categories.ts · formats.ts · navigation.ts · footer.ts · site.ts · contact.ts
│     ├─ lib/
│     │  ├─ format.ts (+ .test.ts)      # precio, fecha, rango de edad, % descuento
│     │  ├─ validation.ts (+ .test.ts)  # reglas del formulario
│     │  ├─ search.ts (+ .test.ts)      # normalización + matching
│     │  ├─ catalog.ts (+ .test.ts)     # filtro combinado + conteos
│     │  ├─ cart.ts (+ .test.ts)        # reducer + totales
│     │  └─ storage.ts                  # localStorage seguro (try/catch, versión de esquema)
│     ├─ hooks/
│     │  └─ useDebouncedValue.ts · useHydrated.ts
│     └─ types/
│        └─ product.ts · cart.ts · contact.ts
└─ version-b/                     # Laravel (fase posterior)
```

Los tests unitarios van junto al archivo (`*.test.ts[x]`). Los e2e van en `e2e/`.

---

## 2. Server vs Client

Criterio: **Server por defecto**. `"use client"` solo donde hay estado, efectos, APIs del navegador
(localStorage, `<dialog>.showModal`, `history`) o handlers. Los Server Components pueden renderizar islas cliente como hijas.

| Componente | Tipo | Por qué |
|---|---|---|
| `app/layout.tsx`, `app/page.tsx` | Server | Composición, metadata y fuentes; sin estado |
| `SkipLink`, `Logo`, `MainNav` (escritorio), `Footer`, `SocialIcon` | Server | Markup estático |
| `Hero`, `HeroIllustration` | Server | Estático; el CTA es un `<a href="#catalogo">` (el scroll suave lo hace CSS) |
| `Button`, `FormatBadge`, `DiscountChip`, `Price`, `TextField`, `TextArea` | Server-compatibles (sin hooks) | Presentacionales; se usan desde ambos lados |
| `ContactSection` | Server | Texto e información de contacto; envuelve a `ContactForm` |
| `AppProviders` → `CartProvider`, `CatalogFiltersProvider`, `Announcer` | **Client** | Context + estado + localStorage |
| `SearchBox` | **Client** | Input controlado conectado al estado de filtros |
| `MobileMenu` | **Client** | Estado abierto/cerrado, Esc, `aria-expanded` |
| `CartButton` | **Client** | Lee el contador del carrito (después de hidratar) |
| `CartDrawer`, `CartLine`, `QuantityStepper` | **Client** | `<dialog>.showModal()`, foco, mutaciones del carrito |
| `Catalog`, `CategoryFilter`, `ResultsStatus`, `ProductGrid`, `EmptyState` | **Client** | Filtran según el estado compartido; sincronizan `?categoria=` |
| `ProductCard` | Client (por herencia) | Lo renderiza `ProductGrid`, que es cliente; no tiene hooks propios, así que sigue siendo puro |
| `AddToCartButton` | **Client** | Handler + estado efímero “Aggiunto ✓” |
| `ContactForm`, `ContactSuccess` | **Client** | Estado del formulario, validación, gestión del foco |

Nota: aunque `Catalog` es cliente, **se renderiza en el servidor (SSR)** con el estado inicial
(“Tutti”, búsqueda vacía). El HTML ya trae las 12 cards y las imágenes con su espacio reservado, así que no depende de JS para pintarse.

---

## 3. Tipos principales (borrador)

```ts
// types/product.ts
export type CategoryId =
  | 'valutazione-cognitiva'
  | 'eta-evolutiva'
  | 'clinica-personalita'
  | 'formazione';

export interface Category {
  id: CategoryId;
  label: string;        // "Valutazione cognitiva"
  description?: string;
}

/** Filtro activo: una categoría o todas. */
export type CategoryFilter = CategoryId | 'tutti';

export type TestFormat = 'cartaceo' | 'digitale';
export type CourseFormat = 'corso-online' | 'in-presenza';
export type ProductFormat = TestFormat | CourseFormat;

export interface ProductImage {
  src: string;          // "/images/products/neura-q.webp"
  alt: string;          // descripción de la escena, en italiano
  width: number;
  height: number;
  credit: { author: string; url: string };
}

/** Importes siempre en céntimos (enteros) → sin errores de coma flotante. */
export interface Pricing {
  listCents: number;          // precio original
  saleCents?: number;         // precio con descuento; ausente = sin descuento
}

interface ProductBase {
  id: string;                 // "neura-q"
  name: string;               // "NEURA-Q — Batteria di valutazione neurocognitiva"
  summary: string;            // 1 frase (descripción corta)
  category: CategoryId;
  image: ProductImage;
  pricing: Pricing;
}

export interface TestProduct extends ProductBase {
  kind: 'test';
  format: TestFormat;
  author: string;                                   // "Laura Bettini"
  ageRange: { min: number; max: number | null; unit: 'anni' | 'mesi' }; // max null = "18+ anni"
}

export interface CourseProduct extends ProductBase {
  kind: 'course';
  format: CourseFormat;
  instructor: string;
  startDate: string;          // ISO "2027-01-12" (sin hora → sin problemas de huso horario)
  durationHours: number;
}

export type Product = TestProduct | CourseProduct;  // unión discriminada por `kind`
```

```ts
// types/contact.ts
export type ContactField = 'nome' | 'email' | 'messaggio';
export type ContactValues = Record<ContactField, string>;
export type ContactErrors = Partial<Record<ContactField, string>>;

export type ContactFormState =
  | {
      status: 'editing';
      values: ContactValues;
      errors: ContactErrors;
      /** después del primer submit fallido, se revalida en cada cambio o al salir del campo */
      submitAttempted: boolean;
    }
  | { status: 'submitting'; values: ContactValues }      // ~600 ms simulados (no hay backend)
  | { status: 'success'; submittedName: string };
```

```ts
// types/cart.ts
export interface CartItem { productId: string; quantity: number }
export interface CartState { items: CartItem[]; version: 1 }  // la versión permite migrar lo guardado en localStorage
export type CartAction =
  | { type: 'add'; productId: string }
  | { type: 'increment' | 'decrement' | 'remove'; productId: string }
  | { type: 'clear' }
  | { type: 'hydrate'; state: CartState };
```

El carrito guarda **solo ids y cantidades**. Precio, nombre e imagen se resuelven contra `products`, así que no hay datos obsoletos en localStorage.

---

## 4. Filtrado combinado y normalización de búsqueda

### 4.1 Normalización (`lib/search.ts`)

```ts
export function normalize(input: string): string {
  return input
    .normalize('NFD')                 // "età" → "eta" + diacrítico combinante
    .replace(/\p{Diacritic}/gu, '')   // quita los acentos
    .toLocaleLowerCase('it-IT')
    .replace(/[^\p{L}\p{N}]+/gu, ' ') // guiones, puntuación y "—" → espacio
    .trim()
    .replace(/\s+/g, ' ');
}
```

Matching (`matchesQuery(name, query)`):
1. `q = normalize(query)`; si está vacío → coincide todo.
2. Tokens de `q` separados por espacios. **Todos** tienen que aparecer como subcadena de `normalize(name)` (AND, en cualquier orden).
3. Además, se acepta la forma compacta sin espacios: `"neuraq"` coincide con `"NEURA-Q"`.

Ejemplos que serán tests: `"NEURA"`, `"neura-q"`, `"neura q"` y `"neuraq"` → NEURA-Q. `"eta"` → “Età…”. `"  "` → todos. `"valutazione cognitiva"` → solo los nombres que contienen las dos palabras.

La clave normalizada de cada producto se calcula **una sola vez** (`searchKey` memoizada al cargar los datos), no en cada pulsación de tecla.

### 4.2 Filtro combinado (`lib/catalog.ts`)

```ts
filterProducts(products, { category, query }) =
  products.filter(p =>
    (category === 'tutti' || p.category === category) && matchesQuery(p.searchKey, query))
```

- Función **pura y determinista**: conserva el orden original y no tiene efectos secundarios. Es fácil de testear y de portar a PHP/JS en version-b.
- `countByCategory(products, query)` devuelve los conteos de cada pill **con la búsqueda actual aplicada** (“Clinica (2)”). Una pill con 0 sigue siendo seleccionable y muestra el estado vacío.
- Al cambiar la categoría **no** se borra la búsqueda, y al revés tampoco: se combinan con AND.
- “Azzera filtri” resetea las dos cosas.

### 4.3 Estado y sincronización

- `CatalogFiltersProvider` (context) guarda `{ category, query }` y lo comparten `SearchBox` (en el header) y `Catalog` (en main).
- El filtrado es inmediato (12 elementos, sin coste). Solo el **anuncio** `aria-live` lleva un debounce de 400 ms, para que el lector de pantalla no lea cada tecla.
- URL: `?categoria=<id>` (y `?q=` con debounce) mediante `history.replaceState`. No hay navegación de Next, ni recarga, ni ida y vuelta al servidor.
  Los enlaces “Test” y “Formazione” del nav ponen la categoría y hacen scroll a `#catalogo`.
- Estado inicial: el SSR siempre renderiza “Tutti”. Después de hidratar se leen los parámetros de la URL (ver el riesgo R4).
- Enter en el buscador → scroll a `#catalogo` y foco en el contador de resultados.

---

## 5. Tareas

Leyenda: **H** = criterio de hecho (el comando o la comprobación concreta).

### Fase 0 — Base

| # | Tarea | H | Estado |
|---|---|---|---|
| 0.1 | `git init` en la raíz; `.gitignore`, `.gitattributes` (eol=lf), `.editorconfig`, `README.md` raíz (esqueleto); commit de `/docs` | `git log --oneline` muestra 1 commit; `git status` limpio | ☐ |
| 0.2 | `npx create-next-app@16.4.5 version-a` (TS, App Router, Tailwind, ESLint, `src/`, alias `@/*`) | `npm run build` termina con exit 0 | ☐ |
| 0.3 | tsconfig: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`. Scripts `typecheck`, `lint`, `verify`. Prettier + `prettier-plugin-tailwindcss` | `npm run typecheck && npm run lint` en verde | ☐ |
| 0.4 | Limpiar la plantilla (page/layout mínimos, borrar los assets de demo); crear las carpetas del árbol §1 | `build` en verde; árbol coincide con §1 | ☐ |
| 0.5 | Vitest + RTL + jsdom + `vitest.setup.ts` (jest-dom, mock de `HTMLDialogElement.showModal`); test de humo | `npm test` → 1 test pasa | ☐ |
| 0.6 | Playwright (chromium) con `webServer: next start`, @axe-core/playwright; spec de humo (la página carga, title correcto) | `npm run e2e` → 1 test pasa | ☐ |

### Fase 1 — Tokens y base visual

| # | Tarea | H | Estado |
|---|---|---|---|
| 1.1 | `shared/tokens.css`: `@theme` con `--color-*: initial` (anula la paleta por defecto de Tailwind) y todos los tokens de DESIGN-SPEC §1–5 | archivo revisado contra la spec, token por token | ☐ |
| 1.2 | Importarlo desde `globals.css` (`@import "../../../shared/tokens.css"`). Si Turbopack lo rechaza → `turbopack.root`; si no, copia en `predev`/`prebuild` | `build` en verde; una clase `bg-primary` renderiza `#1B4F8A` (comprobado en el CSS generado) | ☐ |
| 1.3 | `scripts/check-tokens.mjs` + script `check:tokens`: falla si encuentra `#[0-9a-f]{3,8}` o `rgb(` en `src/components` o `src/app/*.tsx` | el script pasa; un hex de prueba lo hace fallar (prueba manual y luego se revierte) | ☐ |
| 1.4 | `globals.css`: body (canvas / ink / Noto), `:focus-visible`, `.on-dark` para el foco blanco, `prefers-reduced-motion`, `scroll-behavior: smooth` + `scroll-padding-top` (altura del header), utilidad `container-page` | página de prueba revisada a 1280 (foco con Tab visible) | ☐ |
| 1.5 | `layout.tsx`: `lang="it"`, Figtree + Noto Sans (`next/font/google`, variables CSS), metadata (title, description, OG, `viewport.themeColor`), `SkipLink` | el HTML de `build` contiene `lang="it"`, `<a href="#main"` y `<link rel="preload"` de fuente | ☐ |

### Fase 2 — Dominio y lógica (TDD: test rojo → verde)

| # | Tarea | H | Estado |
|---|---|---|---|
| 2.1 | `types/product.ts`, `types/cart.ts`, `types/contact.ts` (§3) | `typecheck` en verde | ☐ |
| 2.2 | `lib/format.ts → formatPrice(cents)`, **implementación determinista** (no Intl, ver R2): `125000` → `"1.250,00 €"` | tests: 0, 990, 125000, 100000000; el espacio es U+00A0 | ☐ |
| 2.3 | `formatDate(iso)` → `"12 gen 2027"` con una tabla fija de meses; `formatAgeRange` → `"6–16 anni"`, `"18+ anni"`, `"0–42 mesi"`; `discountPercent` (redondeado) | tests en verde | ☐ |
| 2.4 | `lib/validation.ts`: `validateContact(values) → ContactErrors`; nome ≥ 2 tras `trim`, email con regex pragmática (`x@y.z`, sin espacios), messaggio ≥ 10; mensajes en italiano | tests: casos límite (1/2 chars, `" a "`, `a@b`, `a@b.it`, 9/10 chars) | ☐ |
| 2.5 | `lib/search.ts`: `normalize`, `matchesQuery` (§4.1) | tests: todos los ejemplos de §4.1 | ☐ |
| 2.6 | `lib/catalog.ts`: `filterProducts`, `countByCategory` (§4.2) | tests: categoría sola, búsqueda sola, ambas, sin resultados, el orden se conserva | ☐ |
| 2.7 | `lib/cart.ts`: `cartReducer` + `cartTotals(items, products)` → `{ count, subtotalCents, savingsCents }`; ignora ids desconocidos | tests: add duplicado → qty 2; decrement a 0 → elimina; hidrata ignorando ids inválidos | ☐ |
| 2.8 | `shared/data/products.json`: 12 productos ficticios: 8 tests repartidos en las 3 categorías de test (3/3/2) y 4 cursos en Formazione (2 online, 2 en presencia); los 4 formatos; 3 sin descuento | revisión: siglas inventadas | ☐ |
| 2.9 | Imágenes: 12 fotos de Unsplash → WebP 1200×800 (`sharp`, una sola vez, script en el scratchpad) en `shared/images/products/`; `docs/CREDITS.md` | cada archivo < 150 KB; existen las 12 entradas en CREDITS | ☐ |
| 2.10 | `data/products.ts` (import JSON + `satisfies` / validación en runtime ligera) y `data/categories.ts`, `formats.ts`, `navigation.ts`, `footer.ts`, `site.ts` | test: ids únicos, cada categoría ≥ 1, cada imagen existe en disco, **lista negra de nombres reales** (WISC, MMPI, Raven, Bayley, WAIS, Conners, Vineland…) sin coincidencias | ☐ |

### Fase 3 — Componentes UI

| # | Tarea | H | Estado |
|---|---|---|---|
| 3.1 | `ui/Button` + `ui/IconButton` (variantes, `href` → `<a>`, `aria-label` obligatorio por tipo en IconButton) | test: rol y variante; TS falla sin `aria-label` en IconButton | ☐ |
| 3.2 | `ui/FormatBadge` (icono + texto + tinta) y `ui/DiscountChip` | test: icono con `aria-hidden`, texto visible; el chip lleva `aria-label` “Sconto del 20%” | ☐ |
| 3.3 | `ui/Price` (final + `<s>` original + textos sr-only; sin descuento → un precio) | tests de los dos casos | ☐ |
| 3.4 | `ui/TextField` + `ui/TextArea` (label, required, error, `aria-invalid`, `aria-describedby`) | test: con error → atributos correctos y mensaje enlazado por id | ☐ |
| 3.5 | `ui/QuantityStepper` (−/+ de 44 px, `aria-label` con el nombre del producto, cantidad en `<output>`) | test | ☐ |
| 3.6 | `ui/Logo` (SVG + wordmark) y `ui/SocialIcon` (4 SVG) | render revisado; `aria-label` en los enlaces | ☐ |

### Fase 4 — Providers

| # | Tarea | H | Estado |
|---|---|---|---|
| 4.1 | `lib/storage.ts` + `CartProvider` (reducer, hidratación tras el mount, persistencia, `useCart()`) | test: persiste y restaura; con JSON corrupto empieza vacío | ☐ |
| 4.2 | `Announcer` (región `aria-live="polite"` única + `announce(msg)`) | test: el mensaje aparece en la región | ☐ |
| 4.3 | `CatalogFiltersProvider` (`{ category, query }`, `setCategory`, `setQuery`, `reset`, sincronización con la URL tras hidratar) | test: cambia el estado; `replaceState` llamado con `?categoria=` | ☐ |
| 4.4 | `AppProviders` montado en `layout.tsx` | `build` en verde, sin warnings de hidratación en la consola (e2e lee la consola) | ☐ |

### Fase 5 — Secciones

| # | Tarea | H | Estado |
|---|---|---|---|
| 5.1 | `Header` + `MainNav` (escritorio) + botón Accedi (sin acción) | visual a 1280 | ☐ |
| 5.2 | `SearchBox` (label sr-only, limpiar, Enter → scroll) conectado al provider | test: al escribir llama a `setQuery`; el botón X limpia | ☐ |
| 5.3 | `MobileMenu` (< 1024: `aria-expanded`, Esc, cierre al navegar) | e2e a 375: abre, recorre con Tab, Esc cierra y el foco vuelve | ☐ |
| 5.4 | `CartButton` (contador, `aria-label` dinámico) | test: “Carrello, 3 articoli” | ☐ |
| 5.5 | `CartDrawer` + `CartLine` (vacío, líneas, subtotal, ahorro, CTA demo, retorno del foco, bloqueo del scroll) | e2e: añadir 2 → abrir → +1 → subtotal correcto → Esc → foco en CartButton | ☐ |
| 5.6 | `Hero` + `HeroIllustration` (gradiente, CTA a `#catalogo`, enlace a Formazione) | visual a 375/1280; Tab muestra el foco blanco | ☐ |
| 5.7 | `ProductCard` + `AddToCartButton` (estado “Aggiunto ✓” 2 s + anuncio) | test de componente: test vs curso muestran edad vs fecha; al hacer clic añade | ☐ |
| 5.8 | `ProductGrid` (1/2/3 col, `sizes` correctos) + `EmptyState` | visual en los 3 breakpoints | ☐ |
| 5.9 | `CategoryFilter` (pills `aria-pressed` + conteos) + `ResultsStatus` (live, con debounce) | test: al pulsar una pill cambia `aria-pressed` y filtra | ☐ |
| 5.10 | `Catalog` que lo une todo + los enlaces “Test” / “Formazione” del nav aplican el filtro | e2e: categoría + búsqueda combinadas; sin recarga (`page.on('load')` se dispara una sola vez); deep link `?categoria=formazione` | ☐ |
| 5.11 | `ContactForm` + `ContactSuccess` (validación, foco en el primer error, submitting, éxito con foco en el h3, reset) | tests de componente + e2e de los flujos de error y de éxito | ☐ |
| 5.12 | `ContactSection` (texto + datos de contacto ficticios) | visual | ☐ |
| 5.13 | `Footer` (columnas, `#risorse`, redes, copyright) | visual; los enlaces tienen destino | ☐ |
| 5.14 | `page.tsx` en el orden obligatorio; `<main id="main">`; ids de las anclas | `npm run verify` en verde | ☐ |

### Fase 6 — Verificación final

| # | Tarea | H | Estado |
|---|---|---|---|
| 6.1 | `screenshots.spec.ts`: página completa a 375/768/1280 → `docs/screenshots/version-a/` | 3 PNG generados y **revisados uno por uno** (sin scroll horizontal, grilla 1/2/3) | ☐ |
| 6.2 | Capturas de estados: card en hover y con foco, pill activa, búsqueda vacía, formulario con errores y con éxito, drawer, menú móvil | PNG revisados | ☐ |
| 6.3 | `a11y.spec.ts`: axe (wcag2a, wcag2aa, wcag21aa) sobre la página, con el drawer abierto, el menú móvil y el formulario con errores | 0 violaciones | ☐ |
| 6.4 | `keyboard.spec.ts`: skip link → nav → búsqueda → pills → botones de las cards → carrito → formulario → footer, sin trampas de foco | e2e en verde | ☐ |
| 6.5 | Lighthouse (CLI, móvil + escritorio) sobre `next start` → `docs/lighthouse/version-a/` | ≥ 95 en las 4 categorías, LCP < 2,5 s, CLS < 0,1; **valores reales anotados aquí** | ☐ |
| 6.6 | Ajustes según Lighthouse (`priority` si el LCP resulta ser una imagen, etc.) | volver a medir | ☐ |
| 6.7 | `version-a/README.md` (stack, scripts, arquitectura, Server/Client, decisiones, mejoras, resultados) | revisión | ☐ |
| 6.8 | Revisión del diff completo + corrección | `npm run verify && npm run e2e && npm run check:tokens` en verde | ☐ |

---

## 6. Riesgos y mitigación

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| R1 | Turbopack/Next no permite importar CSS, JSON o imágenes de `/shared`, que está fuera de `/version-a` | Rompe la fuente única | Probarlo pronto (1.2). Plan B: `turbopack.root` en la raíz del monorepo. Plan C: `scripts/sync-shared.mjs` en `predev`/`prebuild` + una comprobación de que las copias no difieren |
| R2 | `Intl.NumberFormat('it-IT')` da resultados distintos entre el ICU de Node (SSR) y el del navegador (por ejemplo U+00A0 frente a U+202F, o la agrupación de 4 cifras: `1250,00` en vez de `1.250,00` en algunos ICU) | **Error de hidratación** y formato incorrecto | Formateador propio y determinista para precio y fecha, fijado con tests (2.2, 2.3) |
| R3 | El carrito en localStorage provoca una diferencia SSR/cliente (el contador sale distinto) | Warning de hidratación, CLS | El SSR siempre renderiza el carrito vacío; se hidrata en `useEffect`/`useSyncExternalStore` con `getServerSnapshot`. El contador tiene ancho reservado (sin CLS) |
| R4 | Un deep link `?categoria=` se lee después de hidratar → se ve un instante la grilla completa | Destello breve | Aceptado y documentado: mantiene la página estática (mejor TTFB y LCP). Alternativa descartada: renderizado dinámico con `searchParams` |
| R5 | jsdom no implementa `<dialog>.showModal` | Tests que fallan sin motivo | Mock en `vitest.setup.ts`; el comportamiento real (foco, Esc, backdrop) se cubre con Playwright |
| R6 | El LCP resulta ser una imagen de la primera fila (escritorio alto) y no el h1 | LCP > objetivo | Medirlo en 6.5. Si es así, `priority` solo en esa imagen (la primera card) y documentarlo |
| R7 | Next 16 cambió su tooling (ya no existe `next lint`, Turbopack por defecto, ESLint con flat config) | Scripts rotos | Usar `eslint .` directamente; leer las notas de versión y el código generado en 0.2 antes de configurar |
| R8 | Hex sueltos o paleta por defecto de Tailwind en componentes | Incumple la regla de tokens y la paridad con B | `--color-*: initial` (las clases `bg-blue-500` dejan de existir) + `check:tokens` en `verify` |
| R9 | Nombres de tests reales colados en los datos | Incumple la consigna | Test con lista negra (2.10) |
| R10 | Fotos de Unsplash: licencia, enlace o peso | Rendimiento, cumplimiento | Descarga local, WebP < 150 KB, créditos en CREDITS.md. `next/image` sirve AVIF/WebP con `sizes` |
| R11 | Fin de línea CRLF en Windows → diffs ruidosos o Prettier en rojo | Ruido | `.gitattributes eol=lf` + `.editorconfig` |
| R12 | Divergencia visual con version-b | Incumple la paridad | Tokens, datos e imágenes compartidos; DESIGN-SPEC como contrato; capturas de A como referencia de píxel para B |
| R13 | Crecimiento del alcance por las mejoras | Retraso | Solo las mejoras de IMPROVEMENTS.md; cualquier nueva requiere aprobación |
| R14 | Los anuncios `aria-live` se repiten o se pisan (búsqueda + carrito) | Ruido para el lector de pantalla | Una sola región `Announcer` para los eventos y una región propia para el contador, con debounce |
