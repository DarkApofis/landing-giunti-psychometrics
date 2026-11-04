# Plan — version-b (Laravel + Blade + Stylus + jQuery + Gulp)

Objetivo: la misma landing que version-a, **visualmente idéntica y con el mismo comportamiento**, en el stack PHP que pide la prueba.
Contrato: [`DESIGN-SPEC.md`](DESIGN-SPEC.md) · [`HANDOFF-LARAVEL.md`](HANDOFF-LARAVEL.md) · [`AUDIT.md`](AUDIT.md) ·
referencia de píxel [`screenshots/version-a/`](screenshots/version-a). Decisiones: [`ASSUMPTIONS.md`](ASSUMPTIONS.md) B1–B16.

Regla de cierre de cada tarea: **criterio de terminado con evidencia** (salida de comando, test o captura). Un commit por tarea
verificada, en inglés (Conventional Commits, `feat(version-b): …`), sin trailers de coautoría.

---

## 1. Versiones

| Pieza | Versión | Origen |
|---|---|---|
| PHP | 8.4.0 (Herd Lite) — Laravel exige `^8.3` | `php -v` |
| Composer | 2.8.12 | `composer -V` |
| Laravel | 13.40.0 (plantilla `laravel/laravel` 13.11.0) | instalación de prueba verificada con `composer create-project` |
| Node / npm | 24.16.0 / 11.13.0 (las mismas que A) | `.nvmrc` |
| jQuery | 4.0.0 | npm |
| Gulp | 5.0.1 | npm |
| Stylus | 0.64.0 | npm |
| PostCSS: autoprefixer · cssnano | 10.6.2 · 9.9.0 | npm |
| esbuild (empaquetado y minificado del JS dentro de Gulp) | 0.28.2 | npm |
| lucide-static | **1.67.0** (fijada a la versión de `lucide-react` de A, para que los trazos sean idénticos) | npm |
| Fuentes | `@fontsource-variable/figtree` y `/noto-sans` 5.3.0 | npm |

## 2. Estructura

```
version-b/
├─ app/
│  ├─ Http/Controllers/HomeController.php        GET /  → pages.home
│  ├─ Http/Controllers/ContactController.php     POST /contatti (JSON con JS; redirect + flash sin JS)
│  ├─ Http/Requests/ContactRequest.php            mismas reglas y mensajes que validators.ts
│  ├─ Support/Handoff.php                         lee resources/data/*.json (cacheado en memoria por petición)
│  ├─ Support/Catalog.php                         categorías, conteos, estadísticas del hero, filtros iniciales desde la URL
│  ├─ Support/Format.php                          precio, fechas, edad, % de descuento, céntimos (HANDOFF §5)
│  └─ Support/Assets.php                          resuelve nombres con hash desde public/build/rev-manifest.json
├─ resources/
│  ├─ data/products.json · content.json          copia de docs/handoff (npm run sync:handoff)
│  ├─ svg/lucide/*.svg                            los ~30 iconos usados, copiados por Gulp (el servidor no depende de node_modules)
│  ├─ stylus/
│  │  ├─ settings/tokens.styl                     ÚNICO archivo con colores literales (variables CSS de HANDOFF §1)
│  │  ├─ settings/breakpoints.styl                mixins mobile-first 640/768/1024/1280 + min-height 30rem
│  │  ├─ base/{fonts,preflight,base,utilities}.styl   preflight = reset de Tailwind 4 portado (paridad de píxel)
│  │  ├─ blocks/*.styl                            un archivo por bloque BEM (btn, pill, product-card, site-header…)
│  │  └─ app.styl
│  ├─ js/
│  │  ├─ lib/{search,catalog,format,validators,cart,storage}.js   funciones puras, port 1:1 de version-a/src/lib
│  │  ├─ modules/{filters,search-box,mobile-menu,modal-dialog,product-dialog,cart,contact-form,announcer}.js  (jQuery)
│  │  └─ app.js                                   punto de entrada; lee la config de <script type="application/json" id="app-config">
│  └─ views/
│     ├─ layouts/app.blade.php
│     ├─ pages/home.blade.php
│     ├─ partials/  skip-link · header · hero · catalog · product-card · product-dialog · trust-strip · contact · footer · cart-drawer
│     ├─ components/  icon · logo · social-icon · hero-illustration · button · format-badge · price · field
│     └─ errors/404.blade.php
├─ lang/it/ui.php                                 textos que NO están en content.json (B3)
├─ routes/web.php
├─ tests/
│  ├─ Unit/  FormatTest · CatalogTest · HandoffSyncTest · UiStringsTest
│  ├─ Feature/  HomePageTest (estructura, ARIA, ids) · ContactTest · NotFoundTest
│  └─ js/*.test.mjs                               node:test sobre resources/js/lib (mismos casos que los tests de A)
├─ e2e/screenshots.spec.ts + playwright.config.ts → docs/screenshots/version-b/
├─ scripts/  sync-handoff.mjs · check-tokens.mjs · compare-screenshots.mjs
├─ gulpfile.mjs
└─ package.json · composer.json · .env.example · .nvmrc
```

## 3. Arquitectura

- **Render en servidor**: Blade genera todo el HTML final, incluidas las 12 cards con precios y fechas ya formateados en PHP, y el
  estado inicial del filtro leído de `?categoria=&q=` (B6). jQuery solo añade comportamiento: sin JS, la página se lee completa.
- **Datos → JS**: un único `<script type="application/json" id="app-config">` con los productos (los campos que necesitan
  el diálogo y el carrito), las categorías, los textos de `lang/it/ui.php` y de `content.json` que usa el JS, y los límites de validación.
  Sin fetch extra, sin JS bloqueante.
- **Lógica pura duplicada a propósito** (PHP para el render y JS para la interacción): precio, fechas y céntimos existen en los dos
  lados. La paridad se fija con **los mismos casos de prueba** en PHPUnit y en node:test (B9).
- **CSS**: Stylus → PostCSS (autoprefixer + cssnano) → `app.[hash].css`. Ningún color literal fuera de `tokens.styl`
  (`npm run check:tokens`, igual que A).
- **JS**: módulos ES → esbuild (bundle IIFE, minificado, target es2020) → `app.[hash].js` con `defer`; jQuery 4 va en el mismo bundle.
- **Fuentes**: los woff2 variables del subset latin se copian con hash; `@font-face` con `unicode-range` y `font-display: swap`;
  `<link rel="preload">` de los dos latin; fallbacks con las métricas de next/font (copiadas del CSS compilado de A).
- **Sin base de datos**: `SESSION_DRIVER=file`, `CACHE_STORE=file`, `QUEUE_CONNECTION=sync`; se eliminan `database/` y las migraciones.

## 4. Tareas

Cada fila ≈ 15 min o menos. **Hecho cuando** = evidencia que se mostrará.

### Fase 0 — Esqueleto
| # | Tarea | Hecho cuando |
|---|---|---|
| B0.1 | `composer create-project laravel/laravel version-b` (13.x); conservar el README actual | `php artisan --version` = 13.40.x |
| B0.2 | Quitar Vite (vite.config, resources/js/bootstrap, `@vite`, laravel-vite-plugin, axios, tailwind), `database/` y migraciones; `.env.example` sin BD | `grep -ri vite` vacío; `php artisan route:list` funciona sin BD |
| B0.3 | `package.json` (scripts `build`, `dev`/`watch`, `test`, `lint`, `check:tokens`, `sync:handoff`), `.nvmrc`, `gulpfile.mjs` con tareas vacías encadenadas | `npm run build` termina sin errores |
| B0.4 | Pint (PSR-12, de serie en Laravel) y ESLint flat para `resources/js` | `composer lint` y `npm run lint` limpios |

### Fase 1 — Datos y formatos (TDD)
| # | Tarea | Hecho cuando |
|---|---|---|
| B1.1 | `scripts/sync-handoff.mjs` copia los JSON; `HandoffSyncTest` compara byte a byte con `../docs/handoff` (se salta si `docs/` no existe, p. ej. en un deploy aislado) | test verde; falla si se edita un JSON a mano |
| B1.2 | `Format.php`: `price`, `dateLong`, `dateShort`, `ageRange`, `discountPercent`, `toCents` (tests primero, mismos casos que `format.test.ts`/`cart.test.ts`) | PHPUnit verde, incl. `1.250,00 €` con U+00A0 |
| B1.3 | `Catalog.php`: categorías, `countByCategory`, `heroStats` (= `content.json → heroStats`), `parseFilters` (categoría desconocida → tutti; q ≤ 100) | PHPUnit verde |
| B1.4 | `lang/it/ui.php` con todos los microtextos (B3) + `UiStringsTest` que fija los mensajes exactos de HANDOFF §6.2 | test verde |
| B1.5 | `resources/js/lib/*.js` (port de `src/lib`) + `tests/js/*.test.mjs` con los casos de A | `npm test` verde |

### Fase 2 — Pipeline de assets
| # | Tarea | Hecho cuando |
|---|---|---|
| B2.1 | Tarea `styles`: Stylus → PostCSS → rev; probar sintaxis moderna (`clamp`, `rgb(… / .5)`, `:has`, `@starting-style`, `@media (min-height)`) | el CSS de salida contiene esas reglas intactas |
| B2.2 | Tarea `scripts`: esbuild bundle + rev; `defer` | `public/build/app.[hash].js` minificado |
| B2.3 | Tareas `fonts` e `icons`; `rev-manifest.json`; `Assets.php` + directiva `@asset` | el HTML referencia los nombres con hash; 200 en todos |
| B2.4 | `check-tokens.mjs` adaptado a `.styl`/`.blade.php`/`.js` | pasa; falla con un hex inyectado |

### Fase 3 — Base visual
| # | Tarea | Hecho cuando |
|---|---|---|
| B3.1 | `tokens.styl` (HANDOFF §1), breakpoints, preflight, base, utilidades (`sr-only`, `container`, foco) | estilos computados de body/h1 = A |
| B3.2 | Componentes Blade: `icon`, `logo`, `social-icon`, `hero-illustration` (SVG copiados de A), `button` (variantes/tamaños), `format-badge`, `price` | render de feature test; captura de los botones |
| B3.3 | Layout + head (SEO/OG/theme-color de `content.json → site`, favicon de A) + skip link | Feature test: `lang=it`, título, meta |

### Fase 4 — Secciones (cada una: Blade + Stylus + verificación 375/768/1280 frente a A)
| # | Tarea | Hecho cuando |
|---|---|---|
| B4.1 | Header (barra, nav, buscador, Accedi, botón del carrito, menú móvil, sticky solo con ≥ 30rem) | alturas 120/64/72 px; captura vs `01-*`, `02-*` |
| B4.2 | Hero (`hero-surface`, CTAs, stats, ilustración ≥ 1024) | captura vs `01-hero-*` |
| B4.3 | Catálogo: cabecera, pills, contador, grilla, card (2 variantes), estado vacío | captura vs `10-*`, `11-*`, `12-*`, `14-*` |
| B4.4 | Diálogo de ficha + drawer del carrito (markup y estilos, vacío y con líneas) | captura vs `13-*`, `30-*`–`32-*` |
| B4.5 | Franja de confianza, Contatti (canales + formulario + éxito), footer, 404 | captura vs `20-*`, `24-*`, `25-*` |

### Fase 5 — Comportamiento (jQuery)
| # | Tarea | Hecho cuando |
|---|---|---|
| B5.1 | Filtros + buscador + contador con debounce + URL + enlaces `data-category` + estado vacío (HANDOFF §6.1) | `catalog.spec.ts` de A contra B |
| B5.2 | Menú móvil (§6.3) | `layout.spec.ts` de A contra B |
| B5.3 | Patrón de diálogo común + ficha (§6.4) | tests de diálogo de `catalog.spec.ts` |
| B5.4 | Carrito: estado, persistencia defensiva, anuncios, foco, drawer (§6.5) | `cart.spec.ts` de A contra B |
| B5.5 | Formulario: máquina de estados (§6.2) + `POST /contatti` (`ContactRequest`, CSRF, throttle) con fallback sin JS (B4) | `contact.spec.ts` de A contra B + `ContactTest` |

### Fase 6 — Auditoría y cierre
| # | Tarea | Hecho cuando |
|---|---|---|
| B6.1 | `audit.spec.ts` de A contra B (axe, teclado, foco tapado, contraste del hero, reflow 320×256, espaciado de texto, movimiento reducido) | 0 violaciones; mismos números de paradas (o la diferencia explicada) |
| B6.2 | Capturas de B (`e2e/screenshots.spec.ts` propio) + `compare-screenshots.mjs` (pixelmatch) contra A | tabla de % de píxeles distintos por captura; cada diferencia > 0,5 % explicada o corregida |
| B6.3 | Lighthouse 13 móvil y escritorio, mediana de 3, sobre el build de producción | ≥ 95 ×4, LCP < 2,5 s, CLS 0; informes en `docs/lighthouse/version-b/` |
| B6.4 | `version-b/README.md`, sección B de `AUDIT.md`, actualizar README raíz | suite completa en verde: `composer test`, `npm test`, lints, `npm run build` |

## 5. Cómo se verifica la paridad

- **Comportamiento**: las pruebas e2e de A localizan por rol, nombre accesible y texto, así que se ejecutan **sin modificar** contra B:
  `cd version-a && E2E_BASE_URL=http://127.0.0.1:8000 npx playwright test e2e/{layout,catalog,contact,cart,audit}.spec.ts`.
  No se ejecuta `screenshots.spec.ts` de A contra B porque **sobrescribiría** `docs/screenshots/version-a/`; B tiene el suyo.
- **Visual**: capturas con los mismos nombres y estados en `docs/screenshots/version-b/` y diferencia de píxeles automatizada.
- **Datos**: la prueba de sincronización con `docs/handoff` y los feature tests que cuentan 12 cards con los ids/ARIA de HANDOFF §4.

## 6. Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| R1 | Stylus 0.64 (sin versión desde 2024) puede alterar la sintaxis CSS moderna | B2.1 lo prueba al principio; donde falle, bloques literales `@css { }`; revisar el CSS de salida |
| R2 | Diferencias de píxel por el reset (preflight de Tailwind) o por el antialiasing de las fuentes | preflight portado regla a regla; mismas woff2 variables; tolerancia y diferencias explicadas en B6.2 |
| R3 | `php artisan serve` no comprime (gzip) ni pone cabeceras de caché a los estáticos → Lighthouse puede penalizar | medir; si penaliza, servir el build de medición con un servidor con compresión y documentarlo (en un deploy real lo hace nginx/Caddy) |
| R4 | jQuery 4 (~27 KiB gzip) sube el JS respecto al propio de A (~24 KiB) | un solo bundle diferido; TBT medido en B6.3 |
| R5 | El deploy aún no está decidido | nada depende de un proveedor: `.env.example` sin BD, assets compilados en `public/build`, datos copiados en `resources/data` |
| R6 | Lógica duplicada PHP/JS que se desvía | mismos casos de prueba en ambos lados (B9) |
