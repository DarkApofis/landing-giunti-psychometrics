# Plan — version-b (Laravel 13 + Blade + Stylus/BEM + jQuery + Gulp)

**Esto es un plan, no código.** Objetivo: la misma landing que version-a, visualmente idéntica y con el mismo
comportamiento, en el stack de la prueba. Contrato: [`DESIGN-SPEC.md`](DESIGN-SPEC.md) · [`HANDOFF-LARAVEL.md`](HANDOFF-LARAVEL.md)
(abreviado **H**) · [`AUDIT.md`](AUDIT.md) · referencia de píxel [`screenshots/version-a/`](screenshots/version-a).
Decisiones con su motivo: [`ASSUMPTIONS.md`](ASSUMPTIONS.md), sección “Versión B” (B1…).

**Reglas de ejecución:**
- Cada tarea se cierra con la evidencia de su columna “Hecho cuando” (salida de un comando o una comprobación concreta).
- Un commit por tarea verificada, en inglés (Conventional Commits, `feat(version-b): …`), sin trailers de coautoría.
- version-a no se toca. Si aparece un bug real en A, se avisa antes de cambiar nada.

## 0. Versiones de partida (verificadas el 2026-11-04)

| Pieza | Versión | Cómo se comprobó |
|---|---|---|
| Laravel | 13.40.0 (plantilla `laravel/laravel` 13.11.0), requiere PHP `^8.3` | instalación de prueba con `composer create-project` → `php artisan --version` |
| PHP / Composer | 8.4.0 (Herd Lite, sin `intl`) / 2.8.12 | `php -v`, `php -m`, `composer -V` |
| Node / npm | 24.16.0 / 11.13.0 (las mismas que A) | `.nvmrc` |
| jQuery · Gulp · Stylus | 4.0.0 · 5.0.1 · 0.64.0 | `npm view` |
| autoprefixer · cssnano · terser | 10.6.2 · 9.9.0 · 5.51.2 | `npm view` |
| gulp-concat · gulp-terser · gulp-rev · gulp-rev-rewrite · gulp-if · del | 2.6.1 · 2.1.0 · 12.0.0 · 7.0.0 · 3.0.0 · 9.0.1 | `npm view` |
| lucide-static | **1.67.0** (la misma versión que `lucide-react` de A, no la 1.68.0 actual) | `npm view lucide-static@1.67.0` |
| @fontsource-variable/figtree · /noto-sans | 5.3.0 · 5.3.0 | `npm view` |

`gulp-stylus` **no se usa**: fija `stylus ^0.59` (vía `accord`) y no tiene versiones desde 2023. En su lugar, un plugin propio de unas
20 líneas sobre la API de `stylus` 0.64 con `through2` (ver §3.1).

---

## 1. Árbol de carpetas final de `/version-b`

```
version-b/
├─ app/
│  ├─ Content/
│  │  ├─ ContentRepository.php        lee resources/data/{products,content}.json (memo por proceso), expone arrays tipados
│  │  ├─ ProductPresenter.php         producto → datos de vista ya formateados (precio, fechas, edad, meta, aria-labels, srcset)
│  │  └─ CatalogStats.php             conteos por categoría, estadísticas del hero
│  ├─ Support/
│  │  ├─ Format.php                   formatos de H §5 (precio, fecha larga/corta, edad, % de descuento, céntimos)
│  │  ├─ AssetManifest.php            lee public/build/rev-manifest.json → URL con hash
│  │  ├─ Icon.php                     carga y cachea resources/svg/lucide/{name}.svg
│  │  └─ UnsplashImage.php            src/srcset/sizes a partir de la URL del JSON
│  ├─ View/
│  │  ├─ Composers/AppComposer.php    site, navegación, footer, config del JS → layouts.app
│  │  ├─ Composers/HomeComposer.php   productos presentados, categorías, conteos, textos → pages.home y sus partials
│  │  └─ Components/{Icon,Button,FormatBadge,Price,Field,Logo,SocialIcon,HeroIllustration}.php
│  ├─ Http/
│  │  ├─ Controllers/HomeController.php      GET /
│  │  ├─ Controllers/ContactController.php   POST /contatti (JSON con JS; redirect + flash sin JS)
│  │  └─ Requests/ContactRequest.php         mismas reglas y mensajes que version-a/src/lib/validators.ts
│  └─ Providers/AppServiceProvider.php       registra composers, directiva @asset, singleton del repositorio
├─ bootstrap/ · config/ · routes/web.php     (sin database/, sin migraciones)
├─ lang/it/ui.php                            textos que no están en content.json (B4), con marcadores :count / :name
├─ resources/
│  ├─ data/products.json · content.json      copia exacta de docs/handoff (npm run sync:handoff)
│  ├─ svg/lucide/*.svg                       los 30 iconos de DESIGN-SPEC §7, copiados por Gulp desde lucide-static (versionados).
│  │                                         Logo, ilustración del hero y redes son componentes Blade (usan variables CSS y tonos)
│  ├─ stylus/
│  │  ├─ settings/
│  │  │  ├─ tokens.styl                      ÚNICO archivo con colores literales: variables CSS de H §1 en :root
│  │  │  ├─ breakpoints.styl                 $sm 640 · $md 768 · $lg 1024 · $xl 1280 · $tall 30rem + mixins mq()
│  │  │  └─ mixins.styl                      focus-ring(), on-dark(), visually-hidden(), motion-safe()
│  │  ├─ base/
│  │  │  ├─ fonts.styl                       @font-face Figtree / Noto Sans (latin, swap, unicode-range) + fallbacks con métricas
│  │  │  ├─ preflight.styl                   reset equivalente al preflight de Tailwind 4 (paridad de medidas)
│  │  │  └─ base.styl                        html/body/h1–h4/p, scroll-behavior, scroll-padding, :focus-visible, reduced-motion
│  │  ├─ layout/
│  │  │  ├─ container.styl                   .container (75rem, gutters 16/24/32)
│  │  │  ├─ section.styl                     .section (64/96 px) y variantes
│  │  │  └─ grid.styl                        .product-grid, .trust__list, .contact, .site-footer__grid
│  │  ├─ components/                         un archivo por bloque BEM (lista en §2)
│  │  ├─ utilities/
│  │  │  └─ utilities.styl                   .sr-only, .is-hidden, .on-dark
│  │  └─ app.styl                            @import en orden: settings → base → layout → components → utilities
│  ├─ js/
│  │  ├─ lib/                                funciones puras en IIFE/UMD (window.GP.* y module.exports para node:test)
│  │  │  ├─ search.js                        normalize(), matchesQuery()  — port 1:1 de src/lib/search.ts
│  │  │  ├─ catalog.js                       filterProducts, countByCategory, resultsLabel, parseFilters, filtersToSearch
│  │  │  ├─ format.js                        formatPrice(cents) — el resto llega formateado desde PHP
│  │  │  ├─ validators.js                    validateNome/Email/Messaggio, firstInvalidField (mensajes desde la config)
│  │  │  ├─ cart.js                          cartReducer, toCents, cartLines, cartTotals, parseStoredCart, serializeCart
│  │  │  └─ storage.js                       readStorage/writeStorage en try/catch
│  │  ├─ modules/                            comportamiento con jQuery, una IIFE por módulo: init($root, config)
│  │  │  ├─ config.js                        lee y congela <script type="application/json" id="app-config">
│  │  │  ├─ announcer.js                     región global polite (cola de mensajes)
│  │  │  ├─ modal-dialog.js                  patrón común de <dialog> (H §6.4)
│  │  │  ├─ catalog-filters.js               estado {category, query}, pills, contador, vacío, URL, enlaces data-category
│  │  │  ├─ search-box.js                    input, limpiar, Enter → scroll
│  │  │  ├─ mobile-menu.js                   H §6.3
│  │  │  ├─ product-dialog.js                rellena el <dialog> único desde la config
│  │  │  ├─ cart.js                          estado + persistencia + botón + drawer + añadir
│  │  │  └─ contact-form.js                  máquina de estados de H §6.2 + POST
│  │  └─ main.js                             $(function () { … }) → inicializa los módulos
│  └─ views/
│     ├─ layouts/app.blade.php
│     ├─ pages/home.blade.php
│     ├─ partials/  skip-link · header · mobile-menu · search · hero · catalog · category-filter · results-status ·
│     │             product-card · empty-state · product-dialog · trust-strip · contact · contact-form · footer ·
│     │             cart-button · cart-drawer
│     ├─ components/ icon · button · format-badge · price · field · logo · social-icon · hero-illustration
│     └─ errors/404.blade.php
├─ public/
│  ├─ index.php · favicon (icon.svg de A) · robots.txt
│  └─ build/                                 generado por Gulp, NO versionado
│     ├─ css/app-[hash].css (+ .map solo en dev)
│     ├─ js/app-[hash].js  (+ .map solo en dev)
│     ├─ fonts/{figtree,noto-sans}-latin-wght-normal-[hash].woff2
│     └─ rev-manifest.json
├─ scripts/
│  ├─ sync-handoff.mjs                       copia docs/handoff → resources/data
│  ├─ check-tokens.mjs                       ningún color literal fuera de tokens.styl (como en A)
│  └─ compare-screenshots.mjs                pixelmatch A vs B → tabla de % de diferencia
├─ tests/
│  ├─ Unit/      FormatTest · CatalogStatsTest · ProductPresenterTest · HandoffSyncTest · UiStringsTest · AssetManifestTest
│  ├─ Feature/   HomePageTest (estructura, ARIA, ids, 12 cards) · ContactTest · NotFoundTest
│  └─ js/        *.test.mjs con node:test sobre resources/js/lib (mismos casos que los tests de A)
├─ e2e/  playwright.config.ts · screenshots.spec.ts  → docs/screenshots/version-b/
├─ gulpfile.mjs
├─ composer.json · composer.lock · package.json · package-lock.json · .nvmrc · .env.example · phpunit.xml · pint.json
└─ README.md
```

---

## 2. Mapeo pieza a pieza (A → B)

Una fila por pieza de version-a. Comportamiento según H §6.

| Componente React (A) | Partial / componente Blade (B) | Bloque BEM | Comportamiento jQuery |
|---|---|---|---|
| `SkipLink` | `partials/skip-link` | `skip-link` | — (CSS `:focus-visible`) |
| `Header` | `partials/header` | `site-header` (`__bar`, `__actions`, `__login`) | — (sticky por CSS con `min-height: 30rem`) |
| `Logo` | `<x-logo tone="default\|on-dark">` | `logo` (`__mark`, `__accent`; `logo--on-dark`) | — |
| `MainNav` | dentro de `partials/header` | `main-nav` (`__list`, `__link`) | `catalog-filters.js`: enlaces con `data-category` |
| `SearchBox` | `partials/search` | `site-search` (`__form`, `__icon`, `__input`, `__clear`) | `search-box.js`: filtra en `input`; limpiar → foco al input; Enter → `#catalogo` |
| `MobileMenu` | `partials/mobile-menu` | `mobile-menu` (`__toggle`, `__panel`, `__backdrop`, `__sheet`, `__link`, `__login`) | `mobile-menu.js`: `aria-expanded`, etiqueta e icono, trampa simple, Esc, fondo, `matchMedia(64rem)` |
| `CartButton` | `partials/cart-button` | `cart-button` (`__badge`) | `cart.js`: `aria-label`, badge (99+), región `[data-cart-live]` |
| `CatalogLink` | atributo `data-category` en `<a>` normales | — | `catalog-filters.js`: aplica la categoría y deja el scroll nativo del ancla |
| `Button` | `<x-button variant size block>` | `btn` (`--primary`, `--secondary`, `--ghost`, `--on-dark`, `--on-dark-outline`, `--lg`, `--block`, `--danger-text`) | — |
| `Hero` | `partials/hero` | `hero` (`__inner`, `__content`, `__title`, `__lead`, `__ctas`, `__stats`, `__stat`) + `eyebrow--on-dark` | CTA 2 con `data-category="formazione"` |
| `HeroIllustration` | `<x-hero-illustration>` (SVG calculado en PHP con la misma gaussiana) | `hero__illustration` | — |
| `CatalogSection` · `Catalog` | `partials/catalog` | `catalog` (`__head`, `__toolbar`) + `section-title`, `lead`, `eyebrow` | `catalog-filters.js`: estado y orquestación |
| `CategoryFilter` | `partials/category-filter` | `category-filter` (`__list`) + `pill` (`__check`, `__count`; `is-active`) | `catalog-filters.js`: `aria-pressed`, conteos y `aria-label`, scroll de la pill activa, `scrollIntoView` al enfocar |
| `ResultsStatus` | `partials/results-status` | `results-status` (`__visible`) | `catalog-filters.js`: texto inmediato + región viva con debounce de 400 ms |
| `ProductGrid` | dentro de `partials/catalog` | `product-grid` (`__item`) | `catalog-filters.js`: `hidden` en los `<li>` (sin reordenar) |
| `ProductCard` | `partials/product-card` (variantes test / corso) | `product-card` (`__media`, `__img`, `__body`, `__title`, `__desc`, `__meta`, `__footer`, `__pricing`) | botones `data-details` / `data-add-to-cart` |
| `FormatBadge` | `<x-format-badge :format>` | `format-badge` (`--cartaceo`, `--digitale`, `--online`, `--presenza`) | — |
| `Price` | `<x-price :product>` | `price` (`__final`, `__original`, `__saving`, `__vat`) | — |
| `AddToCartButton` | botón dentro de `product-card` | `btn btn--primary btn--block` (`is-added`) | `cart.js`: añadir, anunciar, 2 s “Aggiunto al carrello” |
| `EmptyState` | `partials/empty-state` | `empty-state` (`__icon`, `__title`, `__text`) | `catalog-filters.js`: contexto «query» / categoría; “Azzera filtri” → foco a “Tutti” |
| `ProductDialog` | `partials/product-dialog` (un único `<dialog>`) | `product-dialog` (`__close`, `__media`, `__body`, `__meta`, `__footer`) + `qualification-note` | `product-dialog.js` + `modal-dialog.js`: rellenar desde la config, foco en “Chiudi”, trampa, Esc, fondo, retorno del foco |
| `CartDrawer` | `partials/cart-drawer` | `cart-drawer` (`__inner`, `__head`, `__list`, `__foot`, `__empty`) + `cart-line` (`__name`, `__total`, `__remove`) | `cart.js` + `modal-dialog.js`: render de líneas, totales en céntimos, foco al quitar, vaciar |
| `QuantityStepper` | dentro de `cart-line` (lo genera el JS) | `stepper` (`__btn`, `__value`) | `cart.js`: `aria-disabled` en 1 y 99 |
| `Announcer` | `<div data-announcer>` en `layouts/app` | `sr-only` | `announcer.js` |
| `TrustStrip` | `partials/trust-strip` | `trust` (`__list`, `__item`, `__title`, `__text`) + `icon-circle--lg` | — |
| `ContactSection` | `partials/contact` | `contact` (`__intro`, `__channels`, `__channel`, `__panel`) + `icon-circle` | — |
| `ContactForm` | `partials/contact-form` | `contact-form` (`__grid`, `__submit`) + `form-alert` + `form-success` | `contact-form.js`: estados editing → submitting → success, foco, AJAX |
| `FormField` | `<x-field name type hint>` | `field` (`__label`, `__control-wrap`, `__control`, `__hint`, `__error`; `field--full`, `is-invalid`) | `contact-form.js`: `aria-invalid`, `aria-describedby` |
| `Footer` | `partials/footer` | `site-footer` (`__grid`, `__brand`, `__col`, `__bottom`) + `social` (`__link`) | enlaces “Esplora” con `data-category` |
| `SocialIcon` | `<x-social-icon network>` | — (SVG dentro de `social__link`) | — |
| `CopyrightYear` | `{{ now()->year }}` en `partials/footer` | — | — |
| `not-found.tsx` (404) | `errors/404.blade.php` (usa `layouts/app`) | `not-found` | — |

---

## 3. Decisiones técnicas

### 3.1 Gulp (`gulpfile.mjs`)

| Tarea | Cadena | Justificación |
|---|---|---|
| `clean` | `del(public/build)` | builds reproducibles, sin restos de hashes viejos |
| `styles` | `resources/stylus/app.styl` → plugin propio sobre `stylus` 0.64 → `gulp-postcss([autoprefixer, cssnano])` → `css/app.css` | `gulp-stylus` fija Stylus 0.59 y está sin mantenimiento; el plugin propio es una función `through2` que llama a `stylus.render` con `filename` y `paths` |
| `scripts` | `gulp-concat` en orden explícito: `node_modules/jquery/dist/jquery.js` → `resources/js/lib/*.js` → `modules/config.js`, `announcer.js`, `modal-dialog.js`, resto → `main.js` → `gulp-terser` → `js/app.js` | un solo archivo diferido, sin módulos ES ni bundler; el orden explícito sustituye a los imports |
| `fonts` | copia `@fontsource-variable/{figtree,noto-sans}/files/*-latin-wght-normal.woff2` → `fonts/` | solo el subset latin, el mismo que precarga A |
| `icons` | copia los 30 SVG de `lucide-static@1.67.0/icons/` → `resources/svg/lucide/` (versionado) | el servidor no depende de `node_modules` |
| `rev` | `gulp-rev` sobre css/js/fonts → nombres con hash + `rev-manifest.json`; `gulp-rev-rewrite` reescribe las URLs de las fuentes dentro del CSS | caché inmutable y referencias coherentes |
| `build` | `series(clean, parallel(styles, scripts, fonts, icons), rev)` | |
| `dev` | `build` sin minificar + `watch` | |

- **Sourcemaps solo en desarrollo:** `src(…, { sourcemaps: !isProd })` y `dest(…, { sourcemaps: '.' })` (nativo en Gulp 4/5), y
  `gulp-if(isProd, terser())`. `NODE_ENV=production` es el valor por defecto de `npm run build`.
- **Helper Blade:** `App\Support\AssetManifest` lee `public/build/rev-manifest.json` una vez por proceso y resuelve
  `css/app.css` → `/build/css/app-1a2b3c4d.css`. Si falta el manifest o la clave, lanza una excepción con el mensaje
  “Run `npm run build`”. Se expone como directiva `@asset('css/app.css')` y se usa en el `<link rel="stylesheet">`, en el
  `<script defer>` y en los dos `<link rel="preload" as="font" crossorigin>`.

### 3.2 jQuery y estructura del JS

- jQuery 4.0.0 **instalado por npm y concatenado por Gulp**: nada de CDN. Así no hay una conexión extra a otro origen (mejor LCP),
  no depende de un tercero y el build es reproducible con `package-lock.json`.
- Cada archivo es una **IIFE** que se registra en un único espacio de nombres: `window.GP = { lib: {…}, modules: {…} }`. Sin módulos ES.
  Los archivos de `lib/` siguen además el patrón UMD (`if (typeof module === 'object') module.exports = …`), lo que permite probarlos
  con `node:test` sin jsdom ni bundler.
- **Una sola configuración inyectada desde Blade:** `<script type="application/json" id="app-config">@json($appConfig)</script>`,
  generado por `AppComposer`. Contiene:
  - los textos para el JS (de `content.json` y `lang/it/ui.php`);
  - los límites de validación;
  - las categorías;
  - los productos con los campos que necesitan el diálogo y el carrito, **ya formateados en PHP**.

  Al ser JSON y no JS, no se ejecuta ni bloquea nada.
- `main.js` arranca todo en `$(function () { … })`, y el `<script>` lleva `defer`.

### 3.3 Cómo se renderizan los datos

- **`ContentRepository`** (singleton) lee y decodifica los dos JSON una sola vez por proceso (`JSON_THROW_ON_ERROR`).
  Es la única clase que conoce las rutas de los archivos.
- **View composers:** `AppComposer` → `layouts.app` (site/SEO, navegación, footer, `appConfig`); `HomeComposer` → `pages.home`
  (productos presentados, categorías con conteos, textos de las secciones). Los partials solo leen variables: **ninguna lógica en Blade**
  más allá de `@foreach`/`@if`.
- **En PHP:**
  - todos los formatos de H §5 (`Format`): precio `1.250,00 €`, fechas larga y corta con tabla fija de meses, edad con U+2013, `−15%` con U+2212, céntimos;
  - las estadísticas del hero, calculadas del dataset (`CatalogStats`). Un test comprueba que coinciden con `content.json → heroStats`;
  - los conteos iniciales de las pills y el texto inicial del contador;
  - `aria-label`, `srcset` y el año del copyright.
- **En JS:**
  - el filtrado y el recálculo de conteos, del contador y del estado vacío;
  - la URL;
  - los totales del carrito en céntimos y su formato (`formatPrice` es la **única** función de formato duplicada, probada con los mismos casos en PHP y en JS);
  - las validaciones del formulario;
  - el relleno del diálogo, con datos ya formateados.
- Estado inicial de la página = el mismo que A: “Tutti” y sin búsqueda; el JS aplica `?categoria=&q=` al cargar (H §6.1).

### 3.4 `data-search`: se calcula en JS, una vez, al cargar

**Elección: JS.** Al iniciar, `catalog-filters.js` calcula `normalize(name)` para cada producto, con la función portada 1:1 de A
(`NFD` + `\p{Diacritic}` + `toLocaleLowerCase('it-IT')` + `[^\p{L}\p{N}]+`), y la escribe en el `data-search` de cada `<li>`.
Así el DOM final coincide con H §4.3.

Motivos:
1. **Garantiza la misma normalización que A.** En PHP haría falta `Normalizer` (extensión `intl`, que no está instalada), y la
   tabla de `\p{Diacritic}` de PCRE no tiene por qué coincidir con la de V8. Cualquier diferencia entre la normalización del
   índice (PHP) y la de la consulta (JS) haría que fallaran búsquedas sin que se notase.
2. Hay que normalizar la consulta en JS de todas formas; con una sola implementación desaparece el riesgo de desincronización.
3. El coste es despreciable: 12 cadenas, una vez.

### 3.5 Iconos: `<x-icon name="search" size="20" />`

- El componente lee `resources/svg/lucide/search.svg` y lo cachea en memoria por proceso.
- Antes de insertar el SVG en línea: quita el `width`, el `height` y la `class` originales, pone el tamaño pedido, y añade la clase
  `icon` y la que se le pase, más `aria-hidden="true"` y `focusable="false"`.
- Admite `stroke-width` para los iconos de la franja de confianza (1,75).
- Si el icono no existe, lanza una excepción, para que un nombre mal escrito no pase desapercibido.
- El JS reutiliza los iconos que necesita (check, plus, minus, trash, loader…) desde `<template>` renderizados por Blade, de modo
  que **no hay SVG escritos a mano en JS**.

### 3.6 Imágenes: `UnsplashImage`

- A partir de la URL del JSON, sustituye `w=1200&h=800` por `w=384&h=256`, `w=750&h=500` y `w=1200&h=800` (misma proporción 3:2)
  para el `srcset`, y añade `auto=format` (AVIF/WebP según el navegador).
- Atributos fijos: `width="1200" height="800" loading="lazy" decoding="async"`.
- `sizes` igual que A: `(min-width:1280px) 360px, (min-width:1024px) 31vw, (min-width:768px) 46vw, calc(100vw - 2rem)`.
- El contenedor tiene `aspect-ratio: 3/2` y fondo `primary-subtle`, así que CLS = 0.
- Las miniaturas del carrito usan `w=128&h=128` con `alt=""`.

### 3.7 Fuentes

- `@fontsource-variable/figtree` y `@fontsource-variable/noto-sans` 5.3.0. Gulp copia solo los woff2 latin (§3.1).
- `@font-face` propios en `base/fonts.styl`: `font-weight` 300–900 (Figtree) y 100–900 (Noto Sans), `font-display: swap` y el
  `unicode-range` latin de Google Fonts. Las rutas pasan por el hash de `gulp-rev-rewrite`.
- **Fallbacks con las métricas de A:** `'Figtree Fallback'` y `'Noto Sans Fallback'` como `local('Arial')`, con los
  `ascent-override` / `descent-override` / `line-gap-override` / `size-adjust` copiados del CSS compilado de A
  (`version-a/.next/static/chunks/*.css`). Así el texto no salta al cargar las fuentes.
- `<link rel="preload" as="font" type="font/woff2" crossorigin>` de los dos archivos latin en `<head>`.

### 3.8 Stylus: estilo de código

- Sintaxis **explícita y consistente: llaves y punto y coma siempre**, `:` en las propiedades. Nada de la sintaxis indentada ni de
  propiedades sin dos puntos. La permisividad de Stylus mezcla estilos con facilidad.
- Solo se usan variables CSS (`var(--color-primary)`) en los componentes. Las variables Stylus (`$md`) quedan para los breakpoints,
  que en CSS no pueden ser variables dentro de `@media`.
- BEM estricto: un bloque por archivo; nada de anidar más de un nivel (`.block { &__el {} &--mod {} }`); estados con `is-*`
  o con atributos ARIA (`[aria-pressed="true"]`, `[aria-invalid="true"]`).
- Las construcciones que Stylus no entienda se escriben como CSS literal con `@css { … }`, y siempre con un comentario que diga por qué.

### 3.9 Formulario

- `POST /contatti` con `ContactRequest`: mismas reglas que A, sobre el valor recortado y contando caracteres con
  `mb_strlen`. Los mensajes salen de `lang/it/ui.php`.
- Protección: `throttle:5,1` y CSRF (`X-CSRF-TOKEN` desde `<meta name="csrf-token">`).
- Con JS: AJAX, con una espera mínima de 900 ms antes del éxito (los mismos estados que A).
- Sin JS: envío normal, redirección con `withErrors`/`old()` y panel de éxito renderizado en el servidor.
- El mensaje se escribe en el log; no se envía correo.

---

## 4. Tareas (en orden; cada una ≤ 15 min)

### Fase 0 — Esqueleto
| # | Tarea | Hecho cuando |
|---|---|---|
| 0.1 | `composer create-project laravel/laravel:^13 version-b` (conservar el README actual de B) | `php artisan --version` → `Laravel Framework 13.40.x` |
| 0.2 | Quitar Vite (`vite.config.js`, `resources/js/*`, `resources/css/*`, `@vite`, `laravel-vite-plugin`, `axios`, `tailwindcss`) | `git grep -i -e vite -e tailwind -- version-b` sin resultados (salvo `composer.lock`/`vendor`) |
| 0.3 | Sin BD: borrar `database/`, `.env.example` con `SESSION_DRIVER=file`, `CACHE_STORE=file`, `QUEUE_CONNECTION=sync`; `APP_LOCALE=it` | `php artisan about` sin errores y sin conexión a BD; `php artisan route:list` OK |
| 0.4 | `package.json` (scripts `build`, `dev`, `test`, `lint`, `check:tokens`, `sync:handoff`, `verify`), `.nvmrc`, dependencias de §0 fijadas | `npm ci` limpio; `npm ls --depth=0` muestra las versiones de §0 |
| 0.5 | Pint (`pint.json`, preset laravel) y ESLint flat para `resources/js` (`ecmaVersion: 2020`, `sourceType: script`, global `jQuery`) | `composer lint` y `npm run lint` → 0 problemas |

### Fase 1 — Datos y lógica (tests primero)
| # | Tarea | Hecho cuando |
|---|---|---|
| 1.1 | `scripts/sync-handoff.mjs` + `HandoffSyncTest` (compara byte a byte con `../docs/handoff`; se salta si no existe) | test verde; editar un byte de `resources/data/products.json` → test rojo |
| 1.2 | `Format.php`: `price`, `dateLong`, `dateShort`, `ageRange`, `discountPercent`, `toCents` con los casos de `format.test.ts` y `cart.test.ts` | `php artisan test --filter=FormatTest` verde, incl. `1.250,00 €` con U+00A0 y `toCents(1.005) = 101` |
| 1.3 | `ContentRepository` + `CatalogStats` (conteos, heroStats = `content.json`) | `CatalogStatsTest` verde (8 · 4 · 46; conteos 12/3/2/3/4) |
| 1.4 | `ProductPresenter` (meta de test y curso, `aria-label`, precio accesible) + `UnsplashImage` | `ProductPresenterTest` verde para NEURA-Q y un curso online y otro presencial |
| 1.5 | `lang/it/ui.php` + `UiStringsTest`: los mensajes exactos de H §6.2 y los del carrito | test verde; cada texto de H §6 está cubierto |
| 1.6 | `resources/js/lib/{search,catalog,format}.js` + `tests/js` con los casos de `search.test.ts` y `catalog.test.ts` | `npm test` verde |
| 1.7 | `resources/js/lib/{validators,cart,storage}.js` + `tests/js` con los casos de `validators.test.ts` y `cart.test.ts` | `npm test` verde; mismo número de casos que en A para esas funciones |

### Fase 2 — Pipeline de assets
| # | Tarea | Hecho cuando |
|---|---|---|
| 2.1 | Plugin Stylus propio + PostCSS. Prueba de humo con `clamp()`, `rgb(15 45 82 / .5)`, `:has()`, `@starting-style`, `@media (min-height: 30rem)`, `text-wrap` | el CSS de salida contiene esas reglas sin alterar (`grep` del archivo generado) |
| 2.2 | `scripts`: concat en orden + terser; sourcemaps solo en dev | `npm run build` → `app-[hash].js` minificado sin `.map`; `npm run dev` → con `.map` |
| 2.3 | `fonts` + `icons` + `rev` + `rev-rewrite` | `rev-manifest.json` con 4 entradas; el CSS apunta a las fuentes con hash |
| 2.4 | `AssetManifest` + directiva `@asset` + `AssetManifestTest` | test verde; con el manifest borrado el error dice “Run `npm run build`” |
| 2.5 | `scripts/check-tokens.mjs` (`.styl`, `.blade.php`, `.js`; solo se permite `tokens.styl`) | pasa; un hex inyectado en un componente → falla con archivo y línea |
| 2.6 | Reproducibilidad: `npm ci && npm run build` dos veces | los nombres con hash y el `rev-manifest.json` son idénticos en las dos ejecuciones |

### Fase 3 — Base visual
| # | Tarea | Hecho cuando |
|---|---|---|
| 3.1 | `settings/` (tokens de H §1, breakpoints, mixins) | `check:tokens` pasa; los valores de las variables coinciden con H §1 (test que compara `tokens.styl` con el bloque de H) |
| 3.2 | `base/preflight.styl` + `base/base.styl` + `base/fonts.styl` | `getComputedStyle` de `body`, `h1`, `p`, `button`, `input` igual en A y B (sonda de §6) |
| 3.3 | `layout/` + `utilities/` | ancho del contenedor y gutters a 375 / 768 / 1280 = A |
| 3.4 | Componentes `<x-icon>`, `<x-button>`, `<x-logo>`, `<x-social-icon>`, `<x-format-badge>`, `<x-price>` | feature test de render: `aria-hidden` en cada SVG; captura de una página de prueba solo en dev |
| 3.5 | `layouts/app` + `<head>` (title, description, OG, `theme-color`, favicon, preloads, CSS, JS diferido, `app-config`) + skip link | `HomePageTest`: `lang="it"`, título y meta = `content.json → site`; 1 solo `<script>` y con `defer` |

### Fase 4 — Secciones (Blade + Stylus, sin JS)
Cada tarea: sonda de estilos computados y captura a 375 / 768 / 1280 comparada con la de A (§6).

| # | Tarea | Hecho cuando |
|---|---|---|
| 4.1 | Header: barra, nav, buscador, Accedi, botón del carrito; sticky solo con ≥ 30rem | alturas 120 / 64 / 72 px; diferencia de píxeles vs `01-*` ≤ umbral (§6) en la franja del header |
| 4.2 | Menú móvil (panel, fondo, enlaces, Accedi) | captura vs `02-menu-open-375` |
| 4.3 | Hero (fondo con tres capas, CTAs, stats, `<x-hero-illustration>`) | captura vs `01-hero-*`; contraste por píxeles del eyebrow ≥ 5,15 a 375 |
| 4.4 | Catálogo: cabecera, pills, contador, grilla | captura vs `10-catalog-*` (parte superior), `14-pills-375` |
| 4.5 | Card de producto (test y curso), estados hover y focus-within | captura vs `10-catalog-*`, `11-card-hover-focus-1280`; medidas de la card = A (sonda) |
| 4.6 | Estado vacío | captura vs `12-empty-state-1280` |
| 4.7 | Diálogo de ficha (markup + estilos) | captura vs `13-dialog-1280`, `13-dialog-375` |
| 4.8 | Drawer del carrito (vacío y con líneas) | captura vs `30-*`, `31-*`, `32-*` |
| 4.9 | Franja de confianza | captura vs `24-trust-*` |
| 4.10 | Contatti: canales, formulario (normal, errores, enviando, éxito) | captura vs `20-*`, `21-*`, `22-*`, `23-*` |
| 4.11 | Footer + 404 | captura vs `25-footer-*`; `NotFoundTest`: `/chi-siamo` → 404 con el texto en italiano |

### Fase 5 — Comportamiento (jQuery)
| # | Tarea | Hecho cuando |
|---|---|---|
| 5.1 | `config.js`, `announcer.js`, `modal-dialog.js` | sin errores de consola (`layout.spec.ts` › “no console errors”) |
| 5.2 | `catalog-filters.js`: pills, conteos, contador con debounce, vacío, “Azzera filtri” | `catalog.spec.ts` de A contra B: tests de filtrado en verde |
| 5.3 | `search-box.js` + URL (`replaceState`, lectura al cargar) + enlaces `data-category` | `catalog.spec.ts` y `layout.spec.ts` › búsqueda en verde |
| 5.4 | `mobile-menu.js` | `layout.spec.ts` › menú móvil en verde |
| 5.5 | `product-dialog.js` | `catalog.spec.ts` › diálogo en verde (foco inicial, Esc, fondo, retorno) |
| 5.6 | `cart.js`: estado, persistencia defensiva, sincronización entre pestañas | `cart.spec.ts` › persistencia en verde |
| 5.7 | `cart.js`: botón, drawer, stepper, quitar, vaciar, foco, anuncios | `cart.spec.ts` completo en verde |
| 5.8 | `contact-form.js` (validación y estados) | `contact.spec.ts` › validación en verde |
| 5.9 | `ContactController` + `ContactRequest` + throttle + fallback sin JS | `ContactTest` (422 con los mensajes exactos, 200, 429) + `contact.spec.ts` completo |

### Fase 6 — Auditoría y cierre
| # | Tarea | Hecho cuando |
|---|---|---|
| 6.1 | `audit.spec.ts` de A contra B | 0 violaciones de axe en los 8 estados; 0 controles tapados; mismas paradas de tabulación que A (55 / 51 / 51) o la diferencia explicada |
| 6.2 | Capturas de B (`e2e/screenshots.spec.ts`, mismos nombres y estados que A) | 34 PNG en `docs/screenshots/version-b/` |
| 6.3 | `compare-screenshots.mjs` | tabla con el % de píxeles distintos de los 34 pares; cada par por encima del umbral, corregido o explicado |
| 6.4 | Lighthouse 13 móvil y escritorio, mediana de 3, build de producción | ≥ 95 ×4; LCP < 2,5 s; CLS 0; informes en `docs/lighthouse/version-b/` |
| 6.5 | `version-b/README.md` (versiones, comandos, estructura, decisiones), sección B de `AUDIT.md`, README raíz | `composer test`, `npm test`, `composer lint`, `npm run lint`, `npm run check:tokens` y `npm run build` en verde, con su salida |

---

## 5. Riesgos y mitigación

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | **ICU / `NumberFormatter`**: en italiano ICU no agrupa 4 cifras (`1250,00 €`), el mismo fallo que hubo en A (H §5). Además `intl` no está instalada | `Format::price` usa `number_format($v, 2, ',', '.') . "\u{00A0}€"`, sin `NumberFormatter`. Tests con 180, 1250, 1062,5 y 12.345,67. En JS, `formatPrice` usa `Intl.NumberFormat` con `useGrouping: 'always'`, igual que A, y pasa los mismos casos |
| R2 | **`<dialog>` se renderiza distinto según el navegador**: estilos por defecto (borde, padding, `max-height`, centrado), `::backdrop`, `@starting-style` | reset explícito del `<dialog>` en `preflight.styl` (como Tailwind: `padding: 0; border: 0; color: inherit; background: …`) + tamaños propios. La entrada con `@starting-style` va en un bloque `@css` si Stylus no la entiende. Las capturas de A y B se hacen con el mismo Chromium de Playwright |
| R3 | **Tipografía y métricas**: woff2 de origen distinto a los de next/font, fallbacks sin ajustar → salto de layout o líneas que se cortan en otro sitio | mismas fuentes variables del subset latin; métricas de fallback copiadas del CSS compilado de A; `document.fonts.ready` antes de cada captura; la sonda de estilos compara `font-family` resuelta, tamaño, interlineado y la altura de títulos de varias líneas |
| R4 | **Stylus**: sintaxis permisiva (mezcla de estilos, propiedades sin `:` interpretadas como selectores) y sin versiones desde 2024: puede alterar CSS moderno | llaves y punto y coma siempre (§3.8); prueba de humo en la tarea 2.1 antes de escribir estilos; `@css { }` documentado donde haga falta; se revisa el CSS generado, no solo el `.styl` |
| R5 | **Reproducibilidad del build** | `package-lock.json` y `composer.lock` versionados; dependencias fijadas con versión exacta; `.nvmrc`; `clean` antes de cada build; tarea 2.6 (dos builds → manifest idéntico); `public/build` fuera de git |
| R6 | **Paridad visual**: el reset de Tailwind, el redondeo de subpíxeles, el orden de las capas del hero, `text-wrap: balance` | preflight portado regla a regla; sonda de estilos computados en elementos clave; diferencia de píxeles automatizada con umbral y revisión manual de cada diferencia (§6) |
| R7 | **Lógica duplicada PHP/JS** (precio, céntimos) | se limita a `formatPrice` y `toCents`; mismos casos de prueba en ambos lados |
| R8 | **`php artisan serve` no comprime** ni pone cabeceras de caché a los estáticos → Lighthouse puede penalizar | medir primero; si penaliza, servir el build de medición detrás de un servidor con gzip y caché (se documentará cuál). En un deploy real lo haría nginx o Caddy |
| R9 | **jQuery 4** (~27 KiB gzip) supera al JS propio de A (~24 KiB) | un único archivo diferido; TBT medido en 6.4; ningún plugin de jQuery |
| R10 | **Deploy sin decidir** | nada depende de un proveedor: datos en `resources/data`, assets compilados, `.env.example` sin BD |

---

## 6. Estrategia de paridad (detalle final en el Prompt 8)

Se comparan cuatro capas, de lo más barato a lo más caro, y se aplica la misma sobre A y B:

1. **Comportamiento: los e2e de A sin modificar.** Localizan por rol, nombre accesible y texto, así que sirven para B:
   `cd version-a && E2E_BASE_URL=http://127.0.0.1:8000 npx playwright test e2e/{layout,catalog,contact,cart,audit}.spec.ts`.
   `screenshots.spec.ts` de A **no** se ejecuta contra B, porque sobrescribiría `docs/screenshots/version-a/`.
2. **Estructura y accesibilidad.** Comparación del árbol accesible (`ariaSnapshot()` de Playwright) de header, main y footer, y de
   los atributos ARIA/ids/`data-*` de H §4. Las diferencias de texto o de rol se tratan como fallos.
3. **Estilos computados (sonda).** Un script de Playwright recorre una lista de selectores equivalentes en A y B a 375 / 768 / 1280,
   lee `getComputedStyle` y `getBoundingClientRect`, y vuelca un JSON por versión; luego un diff. Selectores: body, h1, lead, botones,
   pill activa e inactiva, card, título, precio, badge, input, footer.
   - Medidas: tamaño, interlineado, peso y familia de la fuente; colores; padding; radio; sombra; ancho y alto.
   - Tolerancia: 0 en colores y fuentes, ≤ 1 px en cajas.
   Aquí aparecen las diferencias con su causa exacta, antes de mirar píxeles.
4. **Píxeles.** `docs/screenshots/version-b/` con los mismos 34 nombres y estados que A, capturados con el mismo Chromium, viewport,
   `document.fonts.ready` y animaciones desactivadas. `compare-screenshots.mjs` (pixelmatch, umbral 0,1) produce una tabla con el % de
   píxeles distintos y un PNG de diferencias por par. Objetivo: ≤ 0,5 % por captura. Lo que lo supere se corrige o se explica:
   por ejemplo, el antialiasing del texto, o las fotos de Unsplash servidas en otro formato (AVIF de Next frente a `auto=format`).

Además: **mismo Lighthouse** (13, mediana de 3, móvil y escritorio) y **misma tabla de AUDIT.md**, para presentar A y B lado a lado.
