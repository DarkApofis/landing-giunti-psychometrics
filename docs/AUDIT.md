# Auditoría — version-a (Next.js)

**Fecha:** 2026-11-04 · **Commit auditado (antes):** `55fc12e` · **Entorno:** build de producción (`next build && next start`)
en local, Windows 11, Chrome 156, Lighthouse 13.6.0, axe-core 4.x vía `@axe-core/playwright`.

**Regla de este documento:** cada afirmación remite a una medición reproducible. Las pruebas de accesibilidad viven en
`version-a/e2e/audit.spec.ts` (se ejecutan con `npm run e2e`) y vuelcan sus datos crudos en `version-a/test-results/audit/*.json`.
Los informes de Lighthouse están en [`docs/lighthouse/version-a/`](lighthouse/version-a).

---

## 1. Resumen antes / después

### 1.1 Lighthouse

| Métrica | Móvil antes¹ | Móvil después² | Escritorio antes¹ | Escritorio después² | Objetivo |
|---|---|---|---|---|---|
| Performance | 100 | **100** | 100 | **100** | ≥ 95 |
| Accessibility | 100 | **100** | 100 | **100** | ≥ 95 |
| Best Practices | 100 | **100** | 100 | **100** | ≥ 95 |
| SEO | 100 | **100** | 100 | **100** | ≥ 95 |
| LCP | 1,0 s | **0,91 s** | 0,3 s | **0,27 s** | < 2,5 s |
| CLS | 0 | **0** | 0 | **0** | < 0,1 |
| TBT | 50 ms | **49 ms** | 0 ms | **0 ms** | < 200 ms |
| FCP | 1,0 s | 0,91 s | 0,3 s | 0,27 s | — |
| TTI | 2,8 s | 2,81 s | 0,3 s | 0,27 s | — |
| Peso total | 301 KiB | 301 KiB | 326 KiB | 326 KiB | — |

¹ Una sola ejecución. ² **Mediana de 3 ejecuciones** (Lighthouse con throttling simulado: móvil = Moto G Power / 4G lento; escritorio = preset `desktop`).
Las diferencias móviles antes/después (1,0 → 0,91 s) están dentro del ruido entre ejecuciones: los cambios de esta auditoría
fueron de accesibilidad, no de rendimiento. La conclusión honesta es que **el rendimiento ya estaba en objetivo y se mantiene**.

Informes: `before-mobile.report.html`, `before-desktop.report.html`, `after-mobile.report.html`, `after-desktop.report.html`
(+ `.json`; las medianas en `after-*-median.json`).

### 1.2 Accesibilidad

| Comprobación | Antes | Después |
|---|---|---|
| axe (WCAG 2.0/2.1/2.2 A+AA + best-practice), 8 estados³ | 0 violaciones | **0 violaciones** |
| Objetivos táctiles < 44 px (375 px) | **2** (enlaces email/teléfono: 22 px de alto, **< 24 px = falla WCAG 2.2 · 2.5.8**) | **0** (mínimo 44 px) |
| Foco de teclado fuera de la vista en las pills (375 px) | **Sí**: una pill enfocada quedaba ~100 px fuera de la pantalla | **No** |
| Contraste del borde de los iconos sociales (1.4.11) | **2,21 : 1** | **4,59 : 1** |
| Header sticky a zoom 400 % (320×256 CSS px) | **Ocupaba ~47 % de la altura visible** | Se vuelve estático (< 30rem de alto) |
| Paradas de tabulación con foco visible | 55/55 (1280) · 51/51 (375) | 55/55 · 51/51 · **51/51 (zoom 400 %)** |
| Elementos enfocados tapados por el header sticky (2.4.11) | 0 | 0 |

³ Página a 375 / 768 / 1280 / 320 px (zoom 400 %), menú móvil abierto, estado vacío del catálogo, diálogo de ficha abierto, formulario con errores.

---

## 2. Hallazgos y correcciones

| # | Hallazgo | Criterio | Gravedad | Evidencia | Corrección | Verificación |
|---|---|---|---|---|---|---|
| H1 | Los enlaces de email y teléfono de Contatti medían **22 px** de alto | WCAG 2.2 **2.5.8 Target Size (Minimum)** (24 px) · objetivo del proyecto 44 px | Seria (falla AA 2.2) | `target-size-375.json` | `inline-flex min-h-11` en los enlaces (`ContactSection.tsx`) | Test “target size ≥ 44×44”: 0 elementos por debajo |
| H2 | En móvil, al enfocar con Tab una pill del filtro, el **scroll-snap** devolvía el scroller a un punto de anclaje y la pill enfocada quedaba parcialmente fuera de la pantalla (p. ej. “Lavoro e Organizzazioni”: x = 247–473 en un viewport de 375) | 2.4.11 Focus Not Obscured (pasa el mínimo AA, pero mala experiencia) · 2.4.7 | Moderada | Sondeo de geometría durante la auditoría | Eliminado `scroll-snap`; `onFocus` → `scrollIntoView({ inline: 'nearest', block: 'nearest' })` (`CategoryFilter.tsx`) | Recorrido de teclado: 0 controles parcialmente fuera de vista (criterio **más estricto** que AA) |
| H3 | Borde de los botones sociales del footer (blanco 25 % sobre `ink`) a **2,21 : 1** | 1.4.11 Non-text Contrast | Menor (el icono blanco, 13,8 : 1, ya identifica el control) | Cálculo §3.3 | Borde blanco al 50 % → 4,59 : 1 (`Footer.tsx`) | Tabla §3.3 |
| H4 | Con zoom del 400 % real (1280×1024 → **320×256 CSS px**) el header sticky de 121 px ocupaba ~47 % de la altura útil | 1.4.10 Reflow (técnica recomendada: evitar contenido fijo que reduzca el área de lectura) | Moderada | Revisión visual a 320 px | Header sticky solo con `@media (min-height: 30rem)`; por debajo, estático y sin `scroll-padding` (`Header.tsx`, `globals.css`) | Test “sticky header only where there is room”: y = −1500 a 400 %, y = 0 en escritorio |

### 2.1 Falsos positivos descartados (con evidencia)

Se documentan porque podrían reaparecer en una auditoría automática:

- **“Skip link tapado por el header”**: la primera métrica comparaba coordenadas; el skip link es `fixed` con `z-50` y se pinta
  **encima** del header. Se sustituyó por *hit-testing* (`elementFromPoint` en 3 puntos del control).
- **“44 controles tapados”** en el recorrido de teclado: el scroll suave seguía en curso al medir. Se espera a que `scrollY` se
  estabilice antes de medir → 0 tapados.
- **`textarea` “parcial”** a 375 px: se extiende por debajo del pliegue (fuera del viewport, no tapado por contenido del autor);
  2.4.11 trata de contenido del autor. La métrica distingue ahora “fuera de la ventana” de “tapado”.
- **CTA secundario del hero a 2,08 : 1**: el muestreo incluía el propio borde blanco del botón como “fondo”. Ocultando bordes →
  7,07 : 1.
- **12 fallos simultáneos** a mitad de auditoría: un proceso `node` huérfano seguía sirviendo el build anterior (CSS 404).
  Detectado por el patrón (0/56 indicadores de foco) y por `netstat`; se reinició el servidor por PID.

### 2.2 Experimento descartado: `experimental.inlineCss`

Lighthouse marca la hoja de estilos (8,6 KiB gzip) como *render-blocking*. Se probó incrustarla en `<head>` y se midió A/B
(mediana de 3, móvil):

| Variante | FCP / LCP | TBT | Peso |
|---|---|---|---|
| A — CSS externo (actual) | **985 ms** | 54 ms | 307,7 KB |
| B — `inlineCss: true` | 1155 ms (+17 %) | 44 ms | 324,9 KB |

**Empeora** el LCP y aumenta el peso total en 17 KB (más que el propio CSS, 8,6 KiB gzip; no se investigó la causa
exacta del exceso), así que se revirtió. Datos: `A-external-css-mobile-median.json`,
`B-inline-css-mobile-median.json`.

---

## 3. Accesibilidad — detalle

### 3.1 Teclado (`audit.spec.ts` → `tab-order-*.json`)

Recorrido completo con Tab desde el inicio hasta que el foco sale del documento (sin trampas):

| Viewport | Paradas | Foco visible (`:focus-visible` + outline ≥ 2 px) | Tapadas por el header | Parcialmente fuera de vista | Objetivo mínimo |
|---|---|---|---|---|---|
| 1280×800 | 55 | 55/55 | 0 | 0 | 44 px |
| 375×812 | 51 | 51/51 | 0 | 0 | 44 px |
| 320×256 (zoom 400 %) | 51 | 51/51 | 0 | 0 | 44 px |

Orden (1280): skip link → logo → Test → Formazione → Risorse → Contatti → buscador → Accedi → 2 CTAs del hero → 5 pills →
12 acciones de las cards (en orden visual) → email → teléfono → Nome → Email → Messaggio → Invia → logo → 4 redes →
13 enlaces del footer → Privacy · Cookie · Termini → Torna su. Los componentes modales tienen su propia trampa **intencionada**
y con salida (Esc): menú móvil (trampa simple + Esc + retorno de foco) y `<dialog>` nativo (Esc + retorno al botón de origen);
ambos cubiertos por `layout.spec.ts` y `catalog.spec.ts`.

### 3.2 Contraste de texto

- **Pares de tokens** (calculados, DESIGN-SPEC §1.3): todos los pares texto/fondo ≥ 4,5 : 1 (mínimo `success`/`success-subtle` 4,82;
  la mayoría AAA). `accent #0EA5E9` (2,77 : 1) **nunca** se usa como texto.
- **Texto sobre el gradiente del hero**: axe lo marca como *incomplete* (no resuelve fondos con gradiente). Se midió por píxeles:
  se oculta el texto, se captura el fondo real y se compara con el píxel **más claro** (peor caso):

| Elemento | Mín. 375 px | Mín. 1280 px | Requisito |
|---|---|---|---|
| h1 (texto grande) | 5,74 | 8,00 | 3 : 1 |
| Eyebrow | **5,15** | 7,08 | 4,5 : 1 |
| Lead | 5,29 | 6,60 | 4,5 : 1 |
| Etiquetas de estadísticas | 5,64 | 6,47 | 4,5 : 1 |
| Cifras (texto grande) | 7,08 | 8,01 | 3 : 1 |
| Texto del CTA outline | 7,07 | 8,26 | 4,5 : 1 |

El peor caso (5,15 a 375 px) se debe al brillo decorativo del acento, que en móvil queda detrás del eyebrow; sigue con margen sobre AA.
Los otros *incomplete* de axe son `<text>` dentro del SVG decorativo del hero (`aria-hidden`, exento) y badges sobre fotos con
fondo **opaco** (7,35–8,51 : 1, calculado).

### 3.3 Contraste no textual (1.4.11, ≥ 3 : 1)

| Componente / estado | Ratio |
|---|---|
| Borde de pill inactiva (`border-strong`) sobre `canvas` | 3,54 |
| Borde de input (`border-strong`) sobre `surface` | 3,85 |
| Borde de input con error (`danger`) | 6,57 |
| Pill activa (`primary`) sobre `canvas` | 7,62 |
| Anillo de foco `primary` sobre `canvas` / `surface` / `primary-subtle` | 7,62 / 8,29 / 6,80 |
| Anillo de foco blanco sobre `ink` / `primary` (hero, footer) | 13,84 / 8,29 |
| Borde del CTA outline (blanco 60 %) sobre `primary` | 4,12 |
| Borde de botones sociales (blanco 50 %) sobre `ink` | **4,59** (antes 2,21 — H3) |

### 3.4 Estructura y nombres (`structure.json`, `images.json`)

- `lang="it"`; landmarks: `header` · `nav` “Navigazione principale” · `search` · `main` · 4 `section` con nombre (por su h2/h1) ·
  `footer` con 3 `nav` etiquetados (Esplora, Azienda, Assistenza).
- Headings: **un único h1** y sin saltos de nivel (h1 → h2 → h3; los h2 del footer son títulos de columna).
- 12 `<img>` con `alt` descriptivo en italiano (> 20 caracteres, nunca “immagine di…”); **0** SVG inline sin `aria-hidden` o nombre.
- Botones/enlaces: todos con nombre accesible; las acciones de las cards llevan el producto en el nombre (12 nombres únicos) y
  cumplen *label-in-name* (axe `label-content-name-mismatch` = 0, se corrigió durante el bloque del catálogo).

### 3.5 Regiones vivas

| Región | Implementación | Prueba |
|---|---|---|
| Contador de resultados | `role="status" aria-live="polite"`, debounce de 400 ms (no anuncia cada tecla) | “12 prodotti trovati” → “1 prodotto trovato” |
| Errores del formulario | Resumen `role="alert"` + error de cada campo por `aria-describedby` + foco al primer inválido | `toHaveAccessibleDescription('Inserisci il tuo nome.')` |
| Envío / éxito | `role="status"` (“Invio in corso…”, panel de éxito) + foco al título | `contact.spec.ts` |
| Carrito | Región global `role="status"` (“… aggiunto al carrello”) | `catalog.spec.ts` |

### 3.6 Movimiento, zoom y espaciado

- **`prefers-reduced-motion: reduce`** (`reduced-motion.json`): `scroll-behavior: auto`; transiciones a 1 ms; sin `translate` en la
  card ni `scale` en la imagen al pasar el ratón (`motion-safe:`).
- **Reflow**: sin scroll horizontal y con todo el contenido clave visible y dentro del ancho a **640×512 (200 %)** y
  **320×256 (400 %)**; header no sticky en alturas < 30rem (H4).
- **Espaciado de texto (1.4.12)**: con `line-height 1.5`, `letter-spacing .12em`, `word-spacing .16em` y párrafos `2em`:
  sin scroll horizontal y **0** elementos con texto recortado (`text-spacing.json`).

### 3.7 Criterios WCAG 2.2 revisados (los baratos de cumplir)

| Criterio | Estado |
|---|---|
| 2.4.11 Focus Not Obscured (Minimum) — AA | ✔ 0 tapados en 3 viewports (y 0 parciales, más estricto) |
| 2.5.8 Target Size (Minimum) — AA | ✔ mínimo 44 px (tras H1) |
| 2.5.7 Dragging Movements — AA | N/A (no hay arrastre) |
| 3.2.6 Consistent Help — A | ✔ un único bloque de ayuda (Contatti) enlazado desde nav y footer |
| 3.3.7 Redundant Entry — A | N/A (formulario de un solo paso) |
| 3.3.8 Accessible Authentication — AA | N/A (“Accedi” es solo visual) |

---

## 4. Rendimiento — detalle

### 4.1 Core Web Vitals (laboratorio)

- **LCP** = texto del hero (Lighthouse móvil: el párrafo `lead`; escritorio: el h1). No hay imagen LCP, así que **ninguna imagen lleva
  `preload`/`fetchPriority`** (en Next 16 `priority` está deprecado en favor de `preload`). Comprobado: 0 `<link rel="preload" as="image">`
  y todas las imágenes con prioridad *Low*.
- **CLS = 0**: imágenes en cajas `aspect-ratio: 3/2` con `fill`; fuentes con métricas de fallback (`size-adjust`, `ascent-override`);
  header con altura fija por breakpoint (test en `layout.spec.ts`); CLS < 0,1 medido también al recorrer la grilla (`catalog.spec.ts`).
- **TBT 49 ms / TTI 2,8 s (móvil)**: corresponden casi por completo a la hidratación de React/Next (ver §4.2).

### 4.2 JavaScript

`next build` (Turbopack, Next 16.4.5) ya no imprime el tamaño por ruta, así que se midieron los chunks que referencia `/` en el HTML
prerenderizado (gzip -9):

| Chunk | gzip | Contenido |
|---|---|---|
| framework | 69,9 KiB | React DOM + runtime de Next (incluye `next/image` cliente) |
| router | 44,1 KiB | App Router (navegación, error boundaries) |
| runtime | 38,6 + 8,9 + 3,8 + 2,0 KiB | runtime de Turbopack/Next |
| **app: catálogo + formulario + carrito** | **13,0 KiB** | `Catalog`, `ProductCard`, `ProductDialog`, `ContactForm`, providers |
| **app: header** | **10,8 KiB** | `SearchBox`, `MobileMenu`, `CatalogLink`, iconos lucide |
| **Total** | **191 KiB** (≈ 24 KiB propios) | |

- **`"use client"` lo más abajo posible**: `layout`, `page`, `Header`, `Hero`, `CatalogSection`, `TrustStrip`, `ContactSection` y `Footer`
  son Server Components; solo son cliente las islas con estado (buscador, menú, providers, catálogo, formulario, enlaces que aplican
  filtro) y el año del copyright se resuelve en servidor con `'use cache'`. Los datos de productos **no** están en el JS (llegan en el
  payload RSC del HTML; “NEURA-Q” no aparece en ningún chunk).
- **Avisos de Lighthouse no accionables desde la app**: *unused JavaScript* (28 KiB) y *legacy JavaScript* (14 KiB: `Array.prototype.at`,
  `Object.hasOwn`, `trimStart`…) están **ambos en el chunk del framework** (polyfills que Next incluye en su runtime). No provienen de
  nuestro código y no hay opción de configuración estable para quitarlos en Next 16.4.

### 4.3 Imágenes

- Formato servido: **AVIF** en todas (móvil 4 peticiones, media 14,1 KiB a `w=750`; escritorio 12, media 6,8 KiB a `w=384`).
- `sizes` correcto (`(min-width:1280px) 360px, (min-width:1024px) 31vw, (min-width:768px) 46vw, calc(100vw - 2rem)`): el ancho elegido
  cubre el hueco sin superar 2,2× (test en 375/768/1280).
- `loading="lazy"` en todas; placeholder = color `primary-subtle` + `aspect-ratio` (sin CLS). No se usa `placeholder="blur"` porque las
  imágenes son remotas y exigiría generar y versionar `blurDataURL` por imagen para un beneficio solo perceptivo.
- `remotePatterns` restringido a host + `/photo-*` + query exacta (otra query → 400).

### 4.4 Fuentes

`next/font/google` (auto-hospedadas en build): Figtree y Noto Sans variables, `display: swap`, **solo el subset `latin` precargado**
(cabecera HTTP `Link: rel=preload`, 2 × woff2 = 55 KiB), `@font-face` con `unicode-range` (los bloques cirílico/griego de Noto no se
descargan) y fuentes de fallback ajustadas (`size-adjust`) → sin salto de layout al cargar.

---

## 5. Objetivos no cumplidos / límites

- **Todos los objetivos de la prueba se cumplen** (Lighthouse ≥ 95 ×4 en móvil y escritorio, LCP < 2,5 s, CLS < 0,1, WCAG 2.1 AA).
- **Límites de la medición**: Lighthouse se ejecutó en local con throttling *simulado* (no en un servidor real con red real ni con
  datos de campo/CrUX); los números de campo pueden diferir. La auditoría de lector de pantalla es **automática + semántica**
  (nombres, roles, regiones vivas, orden); no se hizo una sesión manual con NVDA/VoiceOver, que sería el siguiente paso.
- **No accionable**: los avisos de JS sin usar/legacy del framework (§4.2) y el *render-blocking* de la única hoja de estilos (la
  alternativa medida empeora el LCP, §2.2).
- **Pendiente del plan, fuera de esta auditoría**: drawer del carrito, contador en el header y persistencia (el carrito actual funciona en
  memoria). Cuando se implemente, debe pasar por las mismas pruebas (`audit.spec.ts` incluye ya el patrón de diálogo).

## 6. Cómo reproducir

```bash
cd version-a
npm run build && npm run start -- -p 3100                       # terminal 1
E2E_BASE_URL=http://localhost:3100 npx playwright test e2e/audit.spec.ts   # terminal 2 → test-results/audit/*.json
npx lighthouse@13 http://localhost:3100/ --output=html --output-path=../docs/lighthouse/version-a/run   # móvil
npx lighthouse@13 http://localhost:3100/ --preset=desktop --output=html --output-path=../docs/lighthouse/version-a/run-desktop
```
