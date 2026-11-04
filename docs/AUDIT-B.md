# Auditoría — version-b (Laravel)

**Fecha:** 2026-11-04 · **Entorno:** build de producción de B — `npm run build`, `APP_ENV=production`, `APP_DEBUG=false`,
`php artisan config:cache route:cache view:cache` — servido con `php artisan serve` en `localhost:8000`; Windows 11, Chrome 156,
Lighthouse 13.6.0, axe-core 4.x (`@axe-core/playwright` 4.14.0). Comparada con [`AUDIT.md`](AUDIT.md) (version-a).

**Regla de este documento:** cada afirmación remite a una medición reproducible: informes de Lighthouse en
[`lighthouse/version-b/`](lighthouse/version-b), datos de accesibilidad en [`audit-b/`](audit-b) (`axe-states.json` y, en
`raw/`, lo que vuelca `version-a/e2e/audit.spec.ts` al ejecutarse contra B).

---

## 1. Resumen antes / después

### 1.1 Lighthouse (mediana de 3 ejecuciones)

| Métrica | B móvil antes | B móvil después | B móvil después **con compresión**¹ | A móvil | B escritorio después **con compresión**¹ | A escritorio | Objetivo |
|---|---|---|---|---|---|---|---|
| Performance | 96 | 96 | **100** | 100 | **100** | 100 | ≥ 95 |
| Accessibility | 100 | 100 | **100** | 100 | **100** | 100 | ≥ 95 |
| Best Practices | 100 | 100 | **100** | 100 | **100** | 100 | ≥ 95 |
| SEO | 100 | 100 | **100** | 100 | **100** | 100 | ≥ 95 |
| LCP | 2,22 s | 2,23 s | **1,29 s** | 0,91 s | **0,35 s** | 0,27 s | < 2,5 s |
| FCP | 2,22 s | 2,23 s | 1,29 s | 0,91 s | 0,35 s | 0,27 s | — |
| CLS | 0 | 0 | **0** | 0 | **0** | 0 | < 0,1 |
| TBT | 33 ms | 37 ms | **16 ms** | 49 ms | 0 ms | 0 ms | < 200 ms |
| Peso transferido | 430 KiB | 407 KiB | **216,5 KiB** | 301 KiB | 302 KiB | 326 KiB | — |
| Peticiones | 10 | 10 | 10 | — | 18 | — | — |

Escritorio sin compresión: 100 / 100 / 100 / 100, LCP 0,52 s → 0,47 s, 516 → 493 KiB.

¹ **Servidor de medición, no el definitivo.** `php artisan serve` (el servidor integrado de PHP) no comprime ni pone cabeceras de
caché a los archivos estáticos. La compresión y la caché son trabajo del servidor del Dockerfile (Prompt 10), que todavía no
existe. Para medir el rendimiento real se usó [`tools/parity/serve-prod.mjs`](../tools/parity/serve-prod.mjs), un proxy local que
aplica exactamente lo que ese servidor debe aplicar (brotli/gzip y `Cache-Control: immutable` en los archivos con hash, sin
`X-Powered-By`). **La verificación definitiva de compresión y cabeceras queda pendiente del Prompt 10** (§3.4).

### 1.2 Peso por tipo de recurso (móvil, transferido)

| Recurso | B antes | B después | B después con compresión | Sin comprimir (B después) |
|---|---|---|---|---|
| HTML | 124,9 KiB | 124,0 KiB | **14,8 KiB** (brotli) | 124,0 KiB |
| CSS (1 archivo) | 40,1 KiB | 40,1 KiB | **7,4 KiB** | 40,1 KiB |
| JS (1 archivo, `defer`) | 95,7 KiB | **73,5 KiB** | **24,8 KiB** | 73,5 KiB |
| Fuentes (2 woff2 latin, precargadas) | 54,9 KiB | 54,9 KiB | 55,1 KiB (woff2 ya va comprimido) | — |
| Imágenes (4 visibles en móvil, AVIF, lazy) | 114 KiB | 114 KiB | 114 KiB | — |
| **Total** | **430 KiB** | **407 KiB** | **216,5 KiB** | |

### 1.3 Accesibilidad

| Comprobación | B | A (AUDIT.md) |
|---|---|---|
| axe WCAG 2.0/2.1/**2.2** A+AA + best-practice, **18 estados** (9 × 375 y 1280, §2.1) | **0 violaciones** (0 críticas, 0 serias, 0 moderadas, 0 menores) | 0 violaciones (8 estados) |
| Suites e2e de A contra B (`layout`, `catalog`, `contact`, `cart`, `audit`) | **78/78** | 78/78 |
| Pruebas e2e propias de B (carrito/diálogo, mensajes del formulario, axe por estados) | **38/38** | — |
| Paradas de tabulación con foco visible | **56/56 · 52/52 · 52/52** (1280 · 375 · 320×256) | 55/55 · 51/51 · 51/51² |
| Controles tapados por el header / parcialmente fuera de vista | 0 / 0 | 0 / 0 |
| Objetivos táctiles < 44 px (375) | **0** | 0 |
| Contraste mínimo del texto sobre el degradado del hero (medido por píxeles) | **5,64 : 1** | 5,15 : 1 |

² La auditoría de A es anterior al botón del carrito (+1 parada). **A medida hoy: 56 · 52 · 52, idéntico a B.**

---

## 2. Accesibilidad — detalle

### 2.1 axe por estados ([`audit-b/axe-states.json`](audit-b/axe-states.json), `version-b/e2e/axe-states.spec.ts`)

Etiquetas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`; a 375 y 1280 px:

| Estado | 375 | 1280 |
|---|---|---|
| Inicial | 0 | 0 |
| Filtrada (Formazione + «valutazione») | 0 | 0 |
| Sin resultados (estado vacío) | 0 | 0 |
| Menú móvil abierto | 0 | 0 (no hay menú ≥ 1024) |
| Diálogo de ficha abierto | 0 | 0 |
| Drawer vacío | 0 | 0 |
| Drawer con artículos | 0 | 0 |
| Formulario con errores | 0 | 0 |
| Formulario enviado (éxito) | 0 | 0 |

**Incompletos** (axe no puede decidir; revisados a mano):
- `color-contrast` sobre el **degradado del hero**: axe no resuelve fondos con degradado. Se mide por píxeles con el peor
  caso (`audit.spec.ts` → `raw/hero-contrast.json`): mínimo **5,64 : 1** (etiquetas de las cifras a 375), h1 5,74, cifras 7,08.
  Los `<text>` del SVG decorativo del hero son `aria-hidden` (exentos).
- `aria-valid-attr-value` en el botón del carrito: axe no confirma `aria-controls="cart-drawer"` cuando hay `aria-haspopup`.
  El `<dialog id="cart-drawer">` existe en el DOM (cerrado) → correcto.

### 2.2 Checklist de HANDOFF §7, ítem por ítem

| Ítem de HANDOFF §7 | Estado | Evidencia |
|---|---|---|
| `lang="it"`; un solo `h1`; jerarquía h1 → h2 → h3 sin saltos (h2 `sr-only` en la franja; columnas del footer = h2) | ✔ | `raw/structure.json` (1 h1, niveles 1·2·3); `layout.spec.ts`; `HomePageTest`, `ContactFooterMarkupTest` |
| Skip link primer enfocable → `#main` (`tabindex="-1"`) | ✔ | `layout.spec.ts` › skip link; `raw/tab-order-*.json` (primera parada) |
| Landmarks: `header`, `nav` «Navigazione principale», `search`, `main`, `section` con nombre, `footer` con 3 `nav` | ✔ | `raw/structure.json`; `contact.spec.ts` › footer; `ContactFooterMarkupTest` |
| Foco visible en **todos** los controles (2 px primary; blanco sobre oscuro) | ✔ | `raw/tab-order-*.json`: 56/56, 52/52, 52/52 con `:focus-visible` e indicador ≥ 2 px |
| Objetivos ≥ 44 × 44 px | ✔ | `raw/target-size-375.json` vacío (0 por debajo); alto mínimo de parada 44 px |
| Contrastes de DESIGN-SPEC §1.4; `#0EA5E9` nunca texto ni borde de control | ✔ | tokens idénticos a A (`check:tokens`); `accent` solo en: fondo del contador del carrito, punto del logo, barra del SVG y brillo del hero (búsqueda en `resources/`) |
| `alt` descriptivo en italiano; SVG decorativos `aria-hidden`; miniaturas del carrito `alt=""` | ✔ | `raw/images.json`: 12 imágenes, `alt` mínimo 65 caracteres, 0 SVG sin `aria-hidden` ni nombre; `DialogsMarkupTest` (miniatura `alt=""`) |
| Nombres únicos con label-in-name («Scopri di più: …», «Rimuovi … dal carrello») | ✔ | `CatalogMarkupTest` (12 nombres únicos que empiezan por el texto visible); axe `label-content-name-mismatch` = 0 |
| Pills: `<button aria-pressed>` en `role="group"` con nombre | ✔ | `CatalogMarkupTest`; `catalog.spec.ts` |
| Regiones vivas: resultados (polite, 400 ms), carrito (polite), anuncios, resumen de errores (`alert`), envío y éxito (`status`) | ✔ | `catalog.spec.ts` › live region; `cart.spec.ts` (anuncio del recuento, sin anunciar al restaurar); `contact.spec.ts`; `e2e/cart-dialog.spec.ts` (anuncios de «Svuota» y «Rimuovi») |
| Formularios: `label for`, `aria-required`, `aria-invalid`, `aria-describedby` (pista + error), foco al primer error, `aria-disabled` | ✔ | `contact.spec.ts`; `e2e/contact-messages.spec.ts` (9 mensajes, descripción accesible, `aria-disabled` sin `disabled`) |
| Diálogos: modal, foco inicial en «Chiudi», trampa de Tab, Esc, clic en el fondo, retorno del foco | ✔ | `catalog.spec.ts` › details dialog; `cart.spec.ts` › keyboard only / backdrop |
| Menú móvil: `aria-expanded` + `aria-controls`, Esc, trampa simple, retorno del foco | ✔ | `layout.spec.ts` › mobile menu |
| `prefers-reduced-motion`: sin `translate`/`scale` en hover, transiciones a 1 ms, scroll instantáneo | ✔ | `raw/reduced-motion.json`: `cardTranslate none`, `cardTransition 0.001s`, `imgTransform none`, `htmlScroll auto` |
| Reflow sin scroll horizontal a 320 px; header no sticky con alto < 30rem; espaciado de texto (1.4.12) sin recortes | ✔ | `raw/sticky-header.json` (y = −1500 a 400 %, 0 en escritorio); `raw/text-spacing.json` vacío (0 recortes); `raw/zoom-200.png`, `raw/zoom-400.png`; `layout.spec.ts` › no horizontal scroll |

### 2.3 Teclado, zoom y movimiento

- **Solo teclado:** recorrido completo desde el inicio hasta salir del documento en 1280, 375 y 320×256, con 0 trampas no
  intencionadas, 0 controles tapados y 0 parcialmente fuera de vista (`raw/tab-order-*.json`). Flujos completos con teclado:
  añadir al carrito → drawer → stepper → Esc → quitar (`cart.spec.ts`); formulario con errores → corrección → envío → éxito →
  «Invia un altro» (`contact.spec.ts`).
- **Zoom 200 % (640×512) y 400 % (320×256):** sin scroll horizontal, contenido clave visible, header estático por debajo de 30rem
  de alto (`audit.spec.ts` › reflow; capturas en `raw/`).
- **Movimiento reducido:** ver la tabla de §2.2.

### 2.4 WCAG 2.2 (los criterios baratos)

| Criterio | Estado |
|---|---|
| 2.4.11 Focus Not Obscured (Minimum) — AA | ✔ 0 tapados (y 0 parciales) en 3 viewports |
| 2.5.8 Target Size (Minimum) — AA | ✔ mínimo 44 px |
| 2.5.7 Dragging Movements — AA | N/A (no hay arrastre) |
| 3.2.6 Consistent Help — A | ✔ un único bloque de ayuda (Contatti), enlazado desde la navegación y el footer |
| 3.3.7 Redundant Entry — A | N/A (formulario de un paso) |
| 3.3.8 Accessible Authentication — AA | N/A («Accedi» es solo visual) |

Las reglas `wcag22aa` de axe están incluidas en los 18 estados de §2.1.

---

## 3. Rendimiento — detalle

### 3.1 Revisión punto por punto

| Punto | Estado | Evidencia |
|---|---|---|
| CSS y JS minificados y con hash en el nombre | ✔ | `public/build/css/app-[hash].css` (cssnano), `public/build/js/app-[hash].js` (terser); `rev-manifest.json`; `AssetManifestTest` |
| Un solo script, con `defer` | ✔ | `HomePageTest` › «a single deferred script»; Lighthouse sin JS bloqueante (TBT 16–37 ms) |
| Preload de la fuente latin | ✔ | 2 `<link rel="preload" as="font" type="font/woff2" crossorigin>` (Figtree y Noto Sans latin); `HomePageTest` |
| Recursos que bloquean el render | 1 (la hoja de estilos) | Igual que A: 1 CSS externo, 7,4 KiB comprimido. A midió que incrustarlo empeora el LCP (AUDIT.md §2.2); se mantiene |
| Imágenes: `srcset` 384/750/1200, `sizes`, `width`/`height`, `lazy`, ninguna precargada | ✔ | `CatalogMarkupTest`; `catalog.spec.ts` › «image sizes attribute matches rendered width» (ancho elegido ≥ hueco y < 2,2×); 0 `preload as=image`; AVIF servido por la CDN |
| CLS | 0 | Lighthouse; `catalog.spec.ts` › CLS < 0,1 al recorrer la grilla; cajas `aspect-ratio`, fallbacks de fuente con métricas |
| El LCP es texto | ✔ | Elemento LCP = texto del hero (sin foto en el hero), como A |
| Compresión gzip/brotli | **Pendiente: Prompt 10** | `php artisan serve` no comprime (cabeceras de §3.4). Medido con el servidor de medición: HTML 124 → 14,8 KiB, CSS 40 → 7,4, JS 73,5 → 24,8 |
| `Cache-Control` en los archivos con hash | **Pendiente: Prompt 10** | Los nombres llevan hash: admiten `public, max-age=31536000, immutable` (aplicado en el servidor de medición) |

### 3.2 Hallazgos y correcciones

| # | Hallazgo | Gravedad | Corrección | Verificación |
|---|---|---|---|---|
| HB1 | **Cookies de sesión y CSRF en todas las páginas** (`XSRF-TOKEN`, `giunti-psychometrics-session`), aunque B no envía nada al servidor (B5): escritura de un archivo de sesión por petición y respuestas `private` | Media (rendimiento, privacidad) | Middleware `web` sin sesión, CSRF ni cookies (`bootstrap/app.php`; en Laravel 13 el CSRF es `PreventRequestForgery`) | `curl -D -`: sin `Set-Cookie` en `/` ni en la 404; `StatelessTest` |
| HB2 | **Rutas `GET`/`PUT storage/{path}`** expuestas por la plantilla de Laravel 13 (disco `local` con `serve: true`), sin uso | Baja (superficie de ataque; requieren URL firmada) | `'serve' => false` en `config/filesystems.php` | `php artisan route:list` → solo `/` y `/up` |
| HB3 | **JS de 95,7 KiB**: jQuery 4 completo, con AJAX, efectos y Deferred que B no usa | Baja | jQuery 4 **slim** | JS 95,7 → 73,5 KiB (24,8 KiB con brotli); jQuery minificado 76,9 → 54,7 KiB (gzip 26,9 → 19,0 KiB); 78/78 e2e de A y 38/38 de B en verde |
| HB4 | Calidad de imagen `q=80` (la del dataset) frente a 75 en A (`next/image` por defecto); Lighthouse estimaba 22 KiB de ahorro | Muy baja | `q=75`, como A | Medido: la CDN devuelve 14.503 B frente a 14.515 B (−12 B): **sin efecto real**; el ahorro estimado solo llegaría con `q ≤ 60` y no compensa la pérdida de calidad. Se mantiene por coherencia con A |
| HB5 | **Sin compresión ni `Cache-Control`** en los estáticos; **`X-Powered-By: PHP/8.4.0`** delata la versión | Alta para el LCP móvil (2,2 s → 1,3 s con compresión) | Corresponde al servidor de producción (Prompt 10): brotli/gzip, `immutable` en `/build` y `/fonts`, `expose_php=Off` | **Pendiente.** Estimado con el servidor de medición (§1.1); verificar en el contenedor |

### 3.3 Por qué el LCP de B (1,29 s) es mayor que el de A (0,91 s)

Ambos están muy por debajo de 2,5 s y con 100 en Performance. La diferencia restante se reparte así (cascada de Lighthouse):
1. **HTML de B más pesado**: 124 KiB sin comprimir y 14,8 KiB con brotli. B renderiza en el servidor las 12 cards, todos los SVG
   en línea (78 elementos, 31,8 KiB) y el JSON de configuración del JS (16 KiB). A divide el HTML en *chunks* y transmite en *streaming*.
2. **Latencia del servidor de medición**: `php artisan serve` es de un solo hilo y Laravel arranca en cada petición, sin
   OPcache de producción ni PHP-FPM. Un despliegue con PHP-FPM y OPcache reduciría el tiempo de respuesta del documento.
3. La hoja de estilos bloqueante y las fuentes precargadas son idénticas en las dos versiones.

Ninguno de estos tres puntos justifica romper la paridad (por ejemplo, quitando los SVG en línea): el objetivo se cumple con margen.

### 3.4 Cabeceras observadas (`curl -D -`, producción, `php artisan serve`)

```
GET /                         200  Content-Type: text/html; charset=utf-8 · Cache-Control: no-cache, private · sin Set-Cookie (tras HB1)
GET /build/css/app-[hash].css 200  Content-Type: text/css · Content-Length: 40869 · sin Content-Encoding · sin Cache-Control
GET /build/js/app-[hash].js   200  Content-Type: application/javascript · Content-Length: 75125 · sin Content-Encoding · sin Cache-Control
GET /fonts/[name]-[hash].woff2 200 Content-Type: font/woff2 · sin Cache-Control
X-Powered-By: PHP/8.4.0 en las respuestas de PHP
```

Con el servidor de medición (lo que debe reproducir el Prompt 10):

```
GET /               content-encoding: br · cache-control: no-cache          14.915 B
GET /build/css/...  content-encoding: br · cache-control: public, max-age=31536000, immutable   7.349 B
GET /build/js/...   content-encoding: br · cache-control: public, max-age=31536000, immutable  25.124 B
```

---

## 4. Objetivos no cumplidos / límites

- **Todos los objetivos se cumplen** (≥ 95 en las 4 categorías, LCP < 2,5 s y CLS < 0,1 en móvil y escritorio; 0 violaciones de
  axe en 18 estados; e2e de A completos contra B). **Sin compresión**, el LCP móvil (2,2 s) sigue por debajo de 2,5 s, pero con
  poco margen: la compresión del Prompt 10 es necesaria, no opcional.
- **Pendiente del Prompt 10 (no declarado resuelto):** compresión brotli/gzip, `Cache-Control: immutable` en `/build` y `/fonts`,
  `expose_php=Off`, PHP-FPM con OPcache. Hay que repetir allí las mediciones de §1.1 y las cabeceras de §3.4.
- **Límites de la medición:** Lighthouse local con throttling simulado (sin red real ni datos de campo); lector de pantalla
  evaluado de forma automática y semántica, sin sesión manual con NVDA/VoiceOver (igual que en A).
- `npm audit`: 1 aviso moderado en `minimatch` dentro de ESLint (solo herramienta de desarrollo; ASSUMPTIONS B24).

## 5. Cómo reproducir

```bash
cd version-b
npm run build && php artisan config:cache && php artisan route:cache && php artisan view:cache   # .env: APP_ENV=production, APP_DEBUG=false
php artisan serve --host=localhost --port=8000                                                   # terminal 1

cd version-a && E2E_BASE_URL=http://localhost:8000 npx playwright test e2e/layout.spec.ts e2e/catalog.spec.ts \
  e2e/contact.spec.ts e2e/cart.spec.ts e2e/audit.spec.ts          # → test-results/audit/*.json (copiados a docs/audit-b/raw)
cd ../version-b && E2E_BASE_URL=http://localhost:8000 npx playwright test e2e/axe-states.spec.ts e2e/cart-dialog.spec.ts e2e/contact-messages.spec.ts

cd ../tools/parity
node lighthouse.mjs http://localhost:8000/ ../../docs/lighthouse/version-b after 3              # tal cual
node serve-prod.mjs 8080 http://localhost:8000 &                                                 # servidor de medición
node lighthouse.mjs http://localhost:8080/ ../../docs/lighthouse/version-b after-compressed 3
```
