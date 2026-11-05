# Giunti Psychometrics Italia — Versión B (Laravel)

La misma landing que la [versión A](../version-a/README.md) (Next.js), **visualmente idéntica** y con el mismo comportamiento, hecha con
**Laravel 13 + Blade + Stylus/BEM + jQuery 4 + Gulp 5**. Sin base de datos ni backend: el formulario y el pedido se simulan, como en A.
Interfaz en italiano, datos 100 % ficticios.

> Prueba técnica de Frontend Developer. Monorepo: [README raíz](../README.md) · Versión A: [`../version-a/README.md`](../version-a/README.md)

**Despliegue:** _pendiente (Render)._ · Versión A: https://giunti-psychometrics-a.vercel.app

---

## 1. Requisitos y versiones exactas

Comprobadas con `php -v`, `composer -V`, `php artisan --version`, `node -v`, `npm -v` y `npx gulp --version`.

| Herramienta | Versión | Fijada en |
|---|---|---|
| PHP | **8.4.0** (local) · 8.4.x en el contenedor | `composer.json` → `"php": "^8.4"`, `config.platform.php` = 8.4.0 |
| Composer | **2.8.12** | — (el contenedor usa la imagen `composer:2.8`) |
| Laravel | **13.40.0** | `composer.lock` |
| Node | **24.16.0** | `.nvmrc` y `package.json` → `engines` |
| npm | **11.13.0** | `package.json` → `engines` |
| Gulp | **5.0.1** (CLI 3.1.0) | `package.json` (versión exacta) |
| Stylus | **0.64.0** | `package.json` |
| jQuery | **4.0.0** (build *slim*) | `package.json` |
| Iconos | `lucide-static` **1.67.0** (la misma versión que `lucide-react` de A) | `package.json` |

Extensiones de PHP: las de Laravel (ctype, curl, dom, fileinfo, filter, mbstring, openssl, tokenizer, xml). **No** hace falta `intl`.

## 2. Instalación paso a paso

```bash
cd version-b
nvm use                                   # 1. Node 24.16.0 (.nvmrc)
composer install                          # 2. Dependencias PHP
npm ci                                    # 3. Dependencias del build (Gulp, Stylus, jQuery…)
cp .env.example .env                      # 4. Entorno local (sin BD; .env nunca se commitea)
php artisan key:generate                  # 5. APP_KEY
npm run build                             # 6. Gulp → public/build (CSS/JS con hash) + public/fonts
php artisan serve                         # 7. http://127.0.0.1:8000
```

`composer setup` encadena los pasos 2–6. Los datos (`resources/data/*.json`) ya están en el repo; `npm run sync:handoff` los vuelve a
copiar desde `docs/handoff/` (sección 5.4). Para los e2e: `npx playwright install chromium`.

## 3. Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | **Desarrollo**: Gulp en watch (sourcemaps, sin minificar) + `php artisan serve` |
| `npm run build` | **Build de producción**: Stylus → autoprefixer → cssnano; jQuery slim + `lib/` + `modules/` → terser; fuentes e iconos; hash + `rev-manifest.json` |
| `php artisan config:cache route:cache view:cache` | Cachés de producción (el contenedor las genera al arrancar) |
| `php artisan test` · `composer test` | **PHPUnit**: 106 pruebas (unitarias y feature) |
| `npm test` | **Lógica JS** con `node:test` (búsqueda, catálogo, carrito, formato, validadores, almacenamiento): 101 pruebas |
| `npx playwright test` | **e2e de B**: carrito/diálogo, mensajes del formulario y axe en 18 estados (contra `php artisan serve` o `E2E_BASE_URL`) |
| `cd ../version-a && E2E_BASE_URL=http://127.0.0.1:8000 npx playwright test e2e/layout.spec.ts e2e/catalog.spec.ts e2e/contact.spec.ts e2e/cart.spec.ts e2e/audit.spec.ts` | **e2e de A contra B** (78 pruebas, sin modificarlas). No incluir `screenshots.spec.ts`: escribe en las capturas de A |
| `npm run e2e:screenshots` · `npm run compare:screenshots` | Capturas de B (`docs/screenshots/version-b`) y % de píxeles frente a A |
| `cd ../tools/parity && npm ci && npm run all` | Herramienta de paridad: capturas de A y B en 13 vistas × 3 anchos, valores computados e informe ([`docs/PARITY.md`](../docs/PARITY.md)). Arranca A y B si no están levantados (`A_URL`, `B_URL`) |
| `npm run lint` · `composer lint` | ESLint (JS y tooling) · Pint (PHP) |
| `npm run check:tokens` | Falla si hay un color literal fuera de `settings/_tokens.styl` |
| `npm run sync:handoff` | Copia `docs/handoff/*.json` a `resources/data` |
| `/_styleguide` | Solo con `APP_ENV=local`: tipografía, colores y botones en todos sus estados |

## 4. Estructura

```
version-b/
├─ app/
│  ├─ Content/        ContentRepository (lee los JSON) · ProductPresenter (producto → datos de vista) · CatalogStats (hero, pills)
│  ├─ Support/        Format (precios, fechas, edades, descuentos) · AssetManifest (@asset) · Icons · UnsplashImage · HeroIllustration
│  ├─ View/Composers/ AppComposer: datos compartidos y configuración JSON para jQuery
│  └─ Http/Controllers/ HomeController · Dev/StyleguideController
├─ lang/it/           ui.php (microtextos y mensajes de validación) · styleguide.php
├─ resources/
│  ├─ data/           products.json + content.json (copia de docs/handoff, con prueba de sincronía)
│  ├─ views/          layouts/app · pages/home · errors/404 · partials/ (una por bloque de HANDOFF §4) · components/ (icon, logo, field…)
│  ├─ stylus/         settings → base → layout → components → utilities (un bloque BEM por archivo)
│  ├─ js/             lib/ (lógica pura y testeada) · modules/ (comportamiento jQuery) · main.js
│  └─ svg/lucide/     los 30 iconos usados (copiados por Gulp, versionados)
├─ gulpfile.mjs       pipeline de assets
├─ tests/             Unit + Feature (PHPUnit) · js/ (node:test)
├─ e2e/               Playwright + axe
├─ Dockerfile · docker/   imagen de producción (nginx + PHP-FPM)
└─ scripts/           sync-handoff · check-tokens · compare-screenshots
```

## 5. Decisiones

### 5.1 Por qué Gulp (y no Vite ni Mix)

La consigna pide Gulp. Además encaja con el resto del stack: Stylus, jQuery concatenado en IIFE (sin módulos ES) y un manifest de
hashes simple. Vite y Mix se eliminaron por completo de la plantilla. Hay un plugin de Stylus propio sobre `stylus` 0.64, porque
`gulp-stylus` fija la 0.59 y no se actualiza desde 2023. `gulp-rev` genera los nombres con hash y la directiva Blade `@asset('css/app.css')`
los resuelve. Los sourcemaps solo se generan en desarrollo. Detalle en [ASSUMPTIONS B7](../docs/ASSUMPTIONS.md).

### 5.2 Stylus + BEM

- **Tokens:** un único `settings/_tokens.styl` contiene las variables CSS de HANDOFF §1 y es el único archivo con colores literales
  (`npm run check:tokens`).
- **Preflight:** un reset equivalente al de Tailwind 4, porque las medidas de A dependen de él.
- **Capas:** `settings → base → layout → components → utilities`, con un bloque BEM por archivo y los nombres de bloque de HANDOFF §4
  (`site-header`, `product-card__price`, `cart-drawer__line`…). Los modificadores reflejan estados de datos (`product-card--test`); los
  estados de interacción usan los atributos ARIA (`[aria-expanded="true"]`, `[aria-pressed]`).
- **Cuidado con Stylus:** altera sin avisar parte del CSS moderno (`rgb(… / a)`, `clamp()`, `min()`, `color-mix()`). Esos valores se
  escriben con comas o dentro de `unquote()` ([B19](../docs/ASSUMPTIONS.md), [B29](../docs/ASSUMPTIONS.md)).

### 5.3 Cómo se renderizan los datos

- **Todo el HTML lo genera el servidor (Blade).** `ContentRepository` lee los dos JSON. PHP formatea precios, fechas, edades y descuentos
  (HANDOFF §5) y calcula las estadísticas del hero. Las 12 cards salen en el HTML, así que la página se lee y se indexa sin JS.
- **jQuery solo añade comportamiento:**
  - filtra (oculta y muestra los `<li>` ya renderizados);
  - valida el formulario;
  - rellena el diálogo de ficha;
  - gestiona el carrito (localStorage, importes en céntimos enteros).

  Lo que necesita (productos ya formateados, límites, microtextos) le llega en **un único objeto JSON** que Blade escribe en
  `#app-config`. El JS no contiene ningún texto visible: todo sale de `content.json` o de `lang/it/ui.php`.
- **Plantillas para el DOM nuevo:** las líneas del carrito y la imagen del diálogo se clonan de un `<template>`, nunca se escriben como
  HTML en el JS.
- **Marcado intacto:** se mantienen sin cambios los ARIA, ids y `data-*` de HANDOFF §4.

### 5.4 JSON en sincronía con A

A exporta su dataset a `docs/handoff/{products,content}.json` (fuente única). `npm run sync:handoff` los copia a `resources/data/`, y
`HandoffSyncTest` falla si las copias difieren byte a byte. Si A cambia un dato, la suite de B lo detecta.

### 5.5 Producción

- **Sin estado:** el grupo `web` va sin sesión, CSRF ni cookies, porque nada se envía al servidor (`StatelessTest`).
- **Imagen Docker multi-etapa:**
  1. `composer install --no-dev --optimize-autoloader`;
  2. `npm ci && npm run build`;
  3. `php:8.4-fpm-alpine` + nginx.
- **nginx:**
  - comprime con brotli/gzip;
  - sirve `/build` y `/fonts` con `Cache-Control: public, max-age=31536000, immutable` (nombres con hash) y el HTML con `no-cache`;
  - quita `X-Powered-By`;
  - el document root es `public/`.
- **PHP:** `expose_php=Off` y OPcache sin revalidación.
- **Arranque:** el entrypoint ejecuta `config:cache`, `route:cache` y `view:cache` con el entorno real y escucha en `$PORT`.
- **URLs absolutas:** `TRUSTED_PROXIES` confía en el proxy HTTPS de la plataforma. En producción, la canónica y las URLs de los assets
  salen de `APP_URL` (o de `RENDER_EXTERNAL_URL`), nunca de la cabecera `Host`.

## 6. Despliegue (Render)

`render.yaml` (en la raíz del monorepo) define el servicio Docker: `rootDir: version-b`, plan gratuito, health check `/up` y despliegue
automático solo cuando cambia `version-b/**`.

| Variable | Valor | Notas |
|---|---|---|
| `APP_KEY` | `base64:…` | Se genera en local con `php artisan key:generate --show` y se pega en Render → servicio → **Environment** (el Blueprint la pide al crearlo). Sin ella el contenedor no arranca y lo explica en el log. |
| `APP_ENV` / `APP_DEBUG` | `production` / `false` | Ya en el Blueprint y en el Dockerfile |
| `APP_URL` | URL pública | Opcional en Render: si falta, se usa `RENDER_EXTERNAL_URL` |
| `TRUSTED_PROXIES` | `*` | El TLS termina en el proxy de Render; con esto Laravel respeta `X-Forwarded-Proto: https` |

En local: `docker build -t giunti-b . && docker run -p 8080:8080 -e APP_KEY=base64:… -e APP_URL=http://localhost:8080 giunti-b`.

## 7. Supuestos

Lista completa en [`docs/ASSUMPTIONS.md`](../docs/ASSUMPTIONS.md) (A1–A35 de la versión A y B1–B36 de la B). Los principales:

| # | Supuesto | Por qué |
|---|---|---|
| B1 | **Stylus + BEM en lugar de Tailwind** (HANDOFF §1 recomendaba Tailwind 4 para copiar el markup de A) | La prueba exige Stylus y BEM y prohíbe Tailwind/Bootstrap. La paridad se consigue con los mismos tokens y un reset equivalente al preflight |
| B7 | **Gulp 5 en lugar de Mix/Vite** | La consigna lo pide; el pipeline (Stylus → PostCSS → hash) es pequeño y explícito |
| B2 | Laravel 13.40 + PHP 8.4 | Última estable |
| B4 | Microtextos que no están en `content.json` → `lang/it/ui.php` | A los tiene en sus componentes; ampliar el export obligaba a tocar A |
| B5 | Formulario sin backend (validación y envío simulado en jQuery) | Paridad con A y página sin sesión ni cookies |
| B6 | Sin base de datos | Consigna |
| B8 | jQuery por npm, empaquetado por Gulp, módulos en IIFE bajo `window.GP` | Sin CDN de terceros; build reproducible |
| B10 | `data-search` normalizado en JS al cargar, con el `normalize()` de A portado 1:1 | Misma búsqueda que A sin depender de `intl` |
| B14 / B25 | Imágenes de la CDN de Unsplash con `srcset`/`sizes` de A (sin optimizador propio) | Misma maquetación; la compresión de las fotos difiere un poco (≤ 0,11 % de píxeles) |
| B33 | Página sin estado y jQuery *slim* | Hallazgos de la auditoría |
| B35 | Render + Docker (nginx + PHP-FPM) | Vercel no ejecuta Laravel; Render tiene plan gratuito para Docker |

## 8. Mejoras y limitaciones

**Mejoras.** B hereda todas las de A ([`docs/IMPROVEMENTS.md`](../docs/IMPROVEMENTS.md), M1–M22). Entre ellas:
- mini-carrito con drawer, cantidades y persistencia defensiva;
- filtro en la URL (`?categoria=&q=`);
- búsqueda sin acentos ni guiones;
- conteos por categoría que reflejan la búsqueda;
- ficha de test con la cualificación A/B/C explicada;
- mensajes de error concretos con foco en el primer campo inválido;
- importes en céntimos enteros;
- 404 en italiano.

Propias de B:
- página **sin estado** (ni cookies ni sesión);
- imagen Docker con compresión y caché inmutable;
- URLs ancladas a `APP_URL`;
- **herramienta de paridad** que mide la diferencia con A.

**Limitaciones conocidas**
- **Plan gratuito de Render:** el servicio se duerme tras 15 minutos sin tráfico y la primera visita después tarda unos 30–50 s. Lighthouse
  se mide después de esa primera petición.
- **HTML más pesado que el de A:** lleva las 12 cards, los SVG en línea y la configuración JSON. Comprimido son 14,6 KiB, y por eso el
  LCP es algo mayor que el de A ([AUDIT-B §LCP](../docs/AUDIT-B.md)).
- **Fotos:** las sirve directamente Unsplash con `auto=format`. Dependen de su disponibilidad y no se recomprimen como en A.
- **Valores computados:** 3 de 1014 difieren solo en notación (capas de sombra vacías de Tailwind; ver PARITY §3).
- **Sin sesión manual con lector de pantalla** (NVDA/VoiceOver). La accesibilidad se ha verificado con axe, teclado y semántica.
- **Sin backend:** el formulario y el pedido se simulan; los enlaces institucionales llevan a la 404 de demo.

## 9. Resultados

### Paridad con A ([`docs/PARITY.md`](../docs/PARITY.md))

| Medida | Resultado |
|---|---|
| Píxeles distintos, 13 vistas × 3 anchos (375/768/1280) | **máx. 0,09 %**, media 0,02 % (objetivo < 1,5 %); mismo tamaño de página en todas |
| Sin fotos (solo maquetación, tipografía, color y estados) | máx. 0,04 % |
| Valores computados (1014 propiedades) | 3 diferencias, todas de notación |
| e2e de A contra B | **78 / 78** |

### Auditoría ([`docs/AUDIT-B.md`](../docs/AUDIT-B.md))

| Métrica (Lighthouse 13.6, móvil, mediana de 3) | B | A | Objetivo |
|---|---|---|---|
| Performance / Accessibility / Best Practices / SEO | Contenedor Docker: **100 / 100 / 100 / 100** · producción: _pendiente_ | 100 ×4 | ≥ 95 |
| LCP / CLS / TBT | Contenedor: **1,32 s / 0 / 35 ms** (escritorio 0,36 s) | 0,91 s / 0 / 49 ms | < 2,5 s / < 0,1 |
| Peso transferido (móvil) | 217 KiB en 10 peticiones (HTML 14,6 KiB con brotli) | 301 KiB | — |

| Accesibilidad | Resultado |
|---|---|
| axe (WCAG 2.0/2.1/2.2 AA + best practices), 18 estados | **0 violaciones** |
| Checklist HANDOFF §7 | 15 / 15 con evidencia |
| Teclado (1280 · 375 · 320×256) | 56 · 52 · 52 paradas, foco visible, ninguna tapada (igual que A) |
| Zoom 200 % / 400 %, objetivos táctiles, movimiento reducido | sin scroll horizontal · ≥ 44 px · sin desplazamientos |

## 10. Documentación

[`docs/PLAN-B.md`](../docs/PLAN-B.md) (plan y mapeo A→B) · [`docs/HANDOFF-LARAVEL.md`](../docs/HANDOFF-LARAVEL.md) (especificación) ·
[`docs/ASSUMPTIONS.md`](../docs/ASSUMPTIONS.md) · [`docs/IMPROVEMENTS.md`](../docs/IMPROVEMENTS.md) · [`docs/PARITY.md`](../docs/PARITY.md) ·
[`docs/AUDIT-B.md`](../docs/AUDIT-B.md) · [`docs/CREDITS.md`](../docs/CREDITS.md)
