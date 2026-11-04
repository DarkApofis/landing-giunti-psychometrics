# Sistema de diseño — Giunti Psychometrics (landing catálogo)

Fuente única de verdad visual para **version-a (Next.js)** y **version-b (Laravel)**.
**Estado: refleja lo que hay en pantalla en version-a** (revisado el 2026-11-04 contra el build de producción: valores
computados por el navegador y árbol DOM renderizado). Si algo cambia en el código, se cambia aquí primero.

Implementación de referencia: `version-a/src/styles/tokens.css` (tokens) y `version-a/src/app/globals.css` (base, utilidades).
Traducción a Laravel/BEM: [`HANDOFF-LARAVEL.md`](HANDOFF-LARAVEL.md).

Estilo: **Minimalism & Swiss** (recomendado por la skill *UI UX Pro Max*): limpio, en rejilla, alto contraste, movimiento
sutil. La paleta que sugería la skill se descartó: los tokens de marca son obligatorios.

---

## 1. Color

### 1.1 Tokens de marca (obligatorios)

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#1B4F8A` | Botones primarios, pill activa, enlaces, anillo de foco, fondo del logo |
| `--color-ink` | `#0F2D52` | Texto principal, footer, inicio del gradiente del hero |
| `--color-accent` | `#0EA5E9` | **Solo decorativo / fondo** (§1.3): brillo del hero, barra destacada del SVG, punto del logo, fondo del contador del carrito |
| `--color-canvas` | `#EFF6FF` | Fondo de página |

### 1.2 Tokens derivados

| Token | Valor | Uso |
|---|---|---|
| `--color-primary-hover` | `#153F6F` | Hover del botón primario y de la pill activa |
| `--color-primary-active` | `#10335A` | Pressed del primario; borde pressed del secundario |
| `--color-primary-subtle` | `#DBEAFE` | Hover de pills/ghost/enlaces de nav, círculos de iconos, fondo de imagen (placeholder), texto secundario sobre oscuro |
| `--color-accent-strong` | `#0369A1` | Eyebrows de sección (“CATALOGO”, “CONTATTI”), texto con sabor acento |
| `--color-accent-subtle` | `#E0F2FE` | Chip de descuento; eyebrow del hero sobre oscuro |
| `--color-surface` | `#FFFFFF` | Cards, header, drawer, diálogo, inputs, franja de confianza |
| `--color-ink-muted` | `#4A607D` | Texto secundario (descripción, dt, precio tachado, contador, placeholder) |
| `--color-border` | `#C7D7EC` | Bordes decorativos (cards, separadores, header) |
| `--color-border-strong` | `#6B84A3` | Bordes de controles (inputs, pills inactivas, stepper, borde dashed del estado vacío) |
| `--color-danger` | `#B42318` | Error (texto, borde, asterisco de obligatorio), “Rimuovi” |
| `--color-danger-subtle` | `#FEF3F2` | Fondo del resumen de errores, hover de “Rimuovi” |
| `--color-success` | `#1A7F37` | Icono de éxito, “Risparmi” del carrito |
| `--color-success-subtle` | `#ECFDF3` | Fondo del panel de éxito |
| `--color-white` | `#FFFFFF` | Texto sobre primario/oscuro |
| `--color-backdrop` | `rgb(15 45 82 / .5)` | `::backdrop` de diálogos y fondo del menú móvil |

Opacidades derivadas en uso: `primary/40` (borde de card en hover), `primary/30` (borde del aviso de cualificación),
`white/60` (borde del CTA outline del hero), `white/50` (borde de botones sociales), `white/25` · `white/20` · `white/15`
(separadores sobre oscuro), `white/10` (hover sobre oscuro), `danger/30`, `success/30` (bordes de paneles de estado),
`format-*/20` (borde de los badges).

### 1.3 Badges de formato (texto / fondo; borde = texto al 20 %)

| Formato | Texto | Fondo | Icono lucide |
|---|---|---|---|
| Cartaceo | `#7A3E00` | `#FEF0C7` | `BookOpen` |
| Digitale | `#0B4A6F` | `#E0F2FE` | `MonitorSmartphone` |
| Corso online | `#4A2C8F` | `#EDE7FB` | `CirclePlay` |
| In presenza | `#14532D` | `#DCFCE7` | `MapPin` |

El formato **nunca se comunica solo por color**: siempre icono + texto (+ `sr-only` “Formato:”).

### 1.4 Contraste verificado (WCAG 2.1)

| Par | Ratio | |
|---|---|---|
| ink / surface · ink / canvas | 13,84 · 12,72 | AAA |
| primary / surface (enlaces, foco) · surface / primary (texto de botón) | 8,29 | AAA |
| ink-muted / surface · ink-muted / canvas | 6,44 · 5,92 | AA |
| accent-strong / surface | 5,93 | AA |
| danger / surface · success / success-subtle | 6,57 · 4,82 | AA |
| Badges de formato (los 4) | 7,35 – 8,51 | AAA |
| ink / accent (contador del carrito) | 4,99 | AA |
| Texto sobre el gradiente del hero (medido por píxeles, peor caso) | ≥ 5,15 | AA |
| Contraste no textual: border-strong / canvas · / surface | 3,54 · 3,85 | ≥ 3 |
| **accent / surface** · **accent / canvas** | **2,77 · 2,55** | ✘ → nunca texto, borde de control ni foco |

Detalle y método: [`AUDIT.md`](AUDIT.md) §3.2–3.3.

---

## 2. Tipografía

| Rol | Familia | Carga |
|---|---|---|
| Títulos, botones, labels, pills, precios, badges, eyebrows | **Figtree** (variable 300–900) | `next/font/google`, `display: swap`, subset `latin` precargado |
| Cuerpo, inputs, descripciones | **Noto Sans** (variable 100–900) | ídem |

Fallbacks con métricas ajustadas (`size-adjust`, `ascent-override`) → sin salto de layout. Body: 16 px / 1.6, `ink` sobre `canvas`,
`-webkit-font-smoothing: antialiased`. Encabezados con `text-wrap: balance`; párrafos con `text-wrap: pretty`.

Escala **medida en pantalla** (1280 px; los `clamp` escalan con el viewport):

| Estilo | Tamaño / interlineado | Peso | Dónde |
|---|---|---|---|
| Display (h1 hero) | `clamp(2rem, 1.4rem + 3vw, 3.25rem)` → 52 / 57,2 px; tracking −0,02em | 700 | Hero |
| h2 de sección | `clamp(1.75rem, 1.5rem + 1vw, 2.25rem)` → 36 / 43,2 px; tracking −0,01em | 700 | Catálogo, Contatti, 404 |
| h2 diálogo de ficha | 24 px / 1,25 | 700 | Diálogo |
| h3 formulario · h2 drawer | 20 px / 1,4 | 700 | “Scrivici un messaggio”, “Il tuo carrello” |
| h3 card | 18 / 24,75 px (`leading-snug`) | 600 | Card (sin recorte: el título completo siempre visible) |
| Cifras del hero | 30 / 36 px | 700 (Figtree, tabular) | `dd` de estadísticas |
| Lead | 18 / 28 px | 400 | Hero (`primary-subtle`), intros de sección (`ink-muted`) |
| Body | 16 / 25,6 px | 400 | Texto general, inputs |
| Small | 14 / 20 px | 400–600 | Descripción y `dl` de card, labels (Figtree 600), hints, errores, footer |
| Pill | 15 px | 500 (Figtree) | Filtros |
| Botón | 16 px (lg: 18 px) | 600 (Figtree) | Todos los botones |
| Precio final | 24 / 24 px | 700 (Figtree, `tabular-nums`) | Card, diálogo, subtotal del carrito |
| Eyebrow | 12 / 14,4 px; mayúsculas; tracking 0,06em | 600 (Figtree) | Hero, secciones, card, títulos de columna del footer (14 px) |
| Badge / chip / contador | 12 px | 600–700 (Figtree) | Formato, descuento, pills, carrito |
| Micro | 12 px | 400 | “IVA inclusa”, notas del carrito |

Longitud de línea: lead del hero `max-width: 60ch`; intros `max-w-3xl` (48rem).

---

## 3. Espaciado, rejilla y breakpoints

- Base 4 px (escala de Tailwind: `1` = 4 px).
- **Contenedor** `.container-page`: `max-width: 75rem` (1200 px), centrado; padding lateral **16 px** (< 768), **24 px** (≥ 768),
  **32 px** (≥ 1280).
- **Secciones** (catálogo, contacto): padding vertical **64 px** (< 1024) / **96 px** (≥ 1024). Hero: 64 / 80 (≥ 768) / 96 px (≥ 1024).
  Franja de confianza: 40 px. Footer: 56 px + barra inferior 24 px.

| Breakpoint | Ancho | Header | Hero | Pills | Grilla | Contacto | Footer |
|---|---|---|---|---|---|---|---|
| base | < 640 | 2 filas (logo · carrito · menú / buscador) = 120 px | 1 col; CTAs apilados a ancho completo | fila con scroll horizontal | 1 col, gap 24 | 1 col; campos apilados | 1 col |
| `sm` | ≥ 640 | ídem | CTAs en fila | ídem | 1 col | Nome + Email en 2 col | 2 col (marca a ancho completo) |
| `md` | ≥ 768 | 1 fila: logo · buscador (máx 28rem) · Accedi · carrito · menú = 64 px | ídem | wrap; contador a la derecha | **2 col**, gap 24 | ídem | ídem |
| `lg` | ≥ 1024 | 1 fila: logo · nav · buscador (máx 20rem) · Accedi · carrito = 72 px | 2 col (1,1fr / 1fr) + ilustración SVG | ídem | **3 col**, gap 24 | 2 col (2fr / 3fr), gap 64 | 4 col (1,4fr 1fr 1fr 1fr), gap 48 |
| `xl` | ≥ 1280 | ídem | ídem | ídem | 3 col, **gap 32** (columnas de 357 px) | ídem | ídem |
| Alto < 30rem | — | **no sticky** (zoom 400 %, móvil horizontal) | | | | | |

Verificado en 375 / 768 / 1280 y en 320×256 (zoom 400 %).

## 4. Radios, sombras, foco

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 6 px | Inputs, logo (foco), enlaces del footer |
| `--radius-md` | 8 px | Botones, nav, stepper, resumen de errores, miniaturas del carrito |
| `--radius-lg` | 12 px | Cards, panel del formulario, diálogo, estado vacío, paneles de éxito |
| `rounded-full` | 9999 px | Pills, badges, chips, contador, botones sociales, círculos de iconos |
| `--shadow-card` | `0 1px 2px rgb(15 45 82 / .06), 0 1px 3px rgb(15 45 82 / .08)` | Card, panel del formulario, botón “Chiudi” sobre imagen |
| `--shadow-card-hover` | `0 8px 24px -6px rgb(15 45 82 / .18)` | Card en hover |
| `--shadow-overlay` | `0 16px 48px -12px rgb(15 45 82 / .35)` | Drawer, diálogo, menú móvil, skip link |

**Foco** (solo `:focus-visible`, todos los controles): `outline: 2px solid var(--color-primary); outline-offset: 2px`.
Dentro de `.on-dark` (hero, footer): `outline-color: #FFF`. `main:focus { outline: none }` (recibe el foco del skip link, no es un control).
Inputs: además el borde pasa a `primary` al enfocar.

## 5. Movimiento

| Caso | Duración | Easing |
|---|---|---|
| Colores / fondos / bordes (botones, pills, enlaces, inputs) | 150 ms (`--duration-fast`) | `ease-out` |
| Card en hover (sombra, borde, `translateY(-2px)`) e imagen (`scale(1.03)`) | 200 ms (`--duration-base`) | `--ease-standard` `cubic-bezier(.2,.8,.2,1)` |
| Entrada del drawer (`translateX(100%)` → 0) y del menú móvil (`opacity 0, translateY(-8px)` → reposo) | 250 ms (`--duration-enter`) | `--ease-standard`, vía `@starting-style` |
| Cierre de drawer, diálogo y menú | instantáneo | — |
| Spinner de “Invio in corso…” | `animate-spin` | — |
| Scroll a anclas | `scroll-behavior: smooth` | — |

Solo se animan `transform`, `opacity` y colores. Sin animaciones de entrada al hacer scroll.
**`prefers-reduced-motion: reduce`**: transiciones y animaciones a 1 ms, sin `translate`/`scale` en hover (`motion-safe:`),
`scroll-behavior: auto`.

---

## 6. Componentes

### 6.1 Botón

Base: `inline-flex`, centrado, `gap 8px`, **alto mín. 44 px**, `radius-md`, Figtree 600, `white-space: nowrap`, transición de color 150 ms.

| Variante | Reposo | Hover | Active |
|---|---|---|---|
| `primary` | fondo `primary`, texto blanco | `primary-hover` | `primary-active` |
| `secondary` | borde 1 px `primary`, texto `primary`, fondo `surface` | fondo `primary-subtle` | + borde `primary-active` |
| `ghost` | transparente, texto `ink` | fondo `primary-subtle` | — |
| `on-dark` (CTA hero) | fondo blanco, texto `ink` | fondo `canvas` | fondo `primary-subtle` |
| `on-dark-outline` (CTA 2 hero) | borde 1 px `white/60`, texto blanco | borde blanco + fondo `white/10` | — |

| Tamaño | Padding horizontal | Texto | Alto mín. |
|---|---|---|---|
| `md` | 20 px | 16 px | 44 px |
| `lg` (hero) | 24 px | 18 px | 48 px |

Deshabilitado / ocupado: `aria-disabled="true"` (no `disabled`, para no perder el foco) + `cursor: not-allowed`/`progress`.
Botones de icono: 44×44, `aria-label` en italiano, SVG `aria-hidden`.

### 6.2 Card de producto

```
┌──────────────────────────────────┐
│ [▣ Cartaceo]                     │  imagen 3:2, fondo primary-subtle mientras carga; badge arriba-izq. (12 px del borde)
│              FOTO                │
├──────────────────────────────────┤  cuerpo: padding 20 px
│ CLINICA E NEUROPSICOLOGIA        │  eyebrow 12 px, ink-muted
│ NEURA-Q — Batteria di            │  h3 18 px / 600 (8 px debajo)
│ valutazione neurocognitiva       │
│ Profilo completo di memoria…     │  descripción 14 px, ink-muted (8 px debajo)
│                                  │
│ Autore     Laura Bettini         │  <dl> 2 columnas (16 px de separación), 14 px; dt ink-muted, dd ink 500
│ Età        18–90 anni            │  cursos: Docente · Inizio (<time>) · Durata (“24 ore · 24 crediti ECM”) · Sede (“Online” o ciudad)
│ Qualifica  C                     │
│ Durata     75 min                │
│ ──────────────────────────────── │  margin-top:auto + 20 px; borde superior `border`; 16 px debajo
│ 1.062,50 €  1.250,00 €  (−15%)   │  final 24/700 · tachado 14 ink-muted · chip accent-subtle/ink 12/700
│ IVA inclusa                      │  12 px, ink-muted
│ ┌──────────────────────────────┐ │  16 px debajo; botón a ancho completo
│ │ ⓘ Scopri di più              │ │  tests: secondary + icono Info · cursos: primary “Aggiungi al carrello” + ShoppingBag
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

- `<article aria-labelledby="product-{id}-title">`; fondo `surface`, borde 1 px `border`, `radius-lg`, `shadow-card`, `overflow:hidden`.
  Columna flex de altura completa: precio y botón alineados en toda la fila.
- Imagen: `aspect-ratio: 3/2`, `object-fit: cover`, `loading="lazy"`,
  `sizes="(min-width:1280px) 360px, (min-width:1024px) 31vw, (min-width:768px) 46vw, calc(100vw - 2rem)"`.
- Badge de formato: alto 28 px, padding 10 px, `rounded-full`, borde 1 px (texto al 20 %), icono 14 px + texto 12/600.
- Precio sin descuento: solo el precio final (`sr-only` “Prezzo:”). Con descuento: `sr-only` “Prezzo scontato:”, “, prezzo originale:”
  dentro de `<s>`, chip “−15%” `aria-hidden` + `sr-only` “, risparmi il 15%”.
- Formato del precio: `1.250,00 €` — `Intl.NumberFormat('it-IT', {style:'currency', currency:'EUR', useGrouping:'always'})`.
- Estados:
  - **hover** (solo puntero con hover): `translateY(-2px)`, `shadow-card-hover`, borde `primary/40`, imagen `scale(1.03)`.
  - **focus-within**: borde de la card `primary` + anillo de foco en el botón.
  - **añadido** (cursos): durante 2 s el botón muestra icono `Check` + “Aggiunto al carrello” (nombre accesible actualizado).
- La card no es clicable entera: el único control es el botón. `aria-label` del botón = texto visible + “: ” + nombre del producto.

### 6.3 Pills de categoría

- `<div role="group" aria-label="Filtra per categoria">` → `<ul>` → `<button aria-pressed>`.
- Alto 44 px, padding 16 px, `rounded-full`, borde 1 px, Figtree 500 15 px, separación 8 px.
- Contenido: [icono `Check` 16 px solo si activa] + etiqueta + contador (pill interna: mín. 24 px de ancho, 12/600, `tabular-nums`, `aria-hidden`).
- Inactiva: fondo `surface`, borde `border-strong`, texto `ink`; contador sobre `primary-subtle`. Hover: fondo `primary-subtle`.
- Activa: fondo y borde `primary`, texto blanco; contador sobre `white/20`. Hover: `primary-hover`.
- `aria-label` explícito “Formazione 4 prodotti” (contiene el texto visible “Formazione 4”).
- < 768 px: una fila con scroll horizontal, a sangre hasta los bordes de la pantalla (`margin: 0 -16px; padding: 4px 16px`),
  `scroll-padding-inline: 16px`, **sin scroll-snap**; la pill enfocada o activa se desplaza a la vista. ≥ 768 px: wrap.
- Contador de resultados (§6.5) a la derecha de las pills en ≥ 768 px, debajo en móvil.

### 6.4 Buscador (header)

- `<search>` → `<form>` → `<label class="sr-only">Cerca nel catalogo</label>` + `<input type="search" name="q">`.
- Alto 44 px, `radius-md`, borde `border-strong` (hover `ink`, foco `primary`), padding 40 px a la izquierda (icono `Search` 20 px
  a 12 px del borde, `ink-muted`) y 44 px a la derecha; placeholder “Cerca test o corsi…” (`ink-muted`).
- Botón “Cancella la ricerca” (icono `X` 20 px, 44×44) solo con texto. La X nativa de `type=search` se oculta.
- Ancho: 100 % en < 768; `flex: 1`, máx. 28rem en 768–1023; máx. 20rem en ≥ 1024.

### 6.5 Estado de resultados y estado vacío

- Visible (`aria-hidden`), Figtree 600 14 px `ink-muted`: “12 prodotti trovati” · “1 prodotto trovato” · “Nessun prodotto trovato”.
- Región `role="status" aria-live="polite"` (`sr-only`) con el mismo texto y un debounce de 400 ms.
- Vacío: caja `surface`, borde 1 px **dashed** `border-strong`, `radius-lg`, padding 48 × 24 px, centrada: círculo 56 px
  `primary-subtle` con icono `SearchX` 28 px `primary`, h3 20 px/600 “Nessun prodotto trovato”, texto `ink-muted`
  “Nessun risultato per «…» in …. Prova con un altro termine o mostra di nuovo tutto il catalogo.”, botón primario “Azzera filtri”
  (icono `RotateCcw`) que restablece todo y lleva el foco a “Tutti”.

### 6.6 Formulario de contacto

- Panel: `surface`, borde `border`, `radius-lg`, `shadow-card`, padding 24 px (32 px ≥ 640).
- Cabecera: h3 “Scrivici un messaggio” (20/700) + nota 14 px `ink-muted` “I campi contrassegnati con * sono obbligatori.”.
- Rejilla de campos: separación 20 px; Nome y Email en 2 columnas ≥ 640; Messaggio a ancho completo.
- **Campo**: label Figtree 600 14 px `ink` + asterisco `danger` (`aria-hidden`) + `sr-only` “(obbligatorio)”; hint opcional 14 px
  `ink-muted` (4 px debajo); control 6 px debajo.
- **Control**: alto 44 px (textarea: mín. 144 px, 5 filas, redimensionable en vertical), padding 14 px, `radius-sm`, borde 1 px
  `border-strong` (hover `ink`, foco `primary` + anillo), texto 16 px, fondo `surface` (`canvas` si es `readOnly`).
- **Error**: borde `danger` + `ring 1px danger` (equivale a 2 px sin cambiar la caja); mensaje 14 px `danger` 6 px debajo con icono
  `CircleAlert` 16 px; `aria-invalid="true"` y `aria-describedby` = hint + error.
- **Resumen de errores**: 20 px encima del botón, `role="alert"`, fondo `danger-subtle`, borde `danger/30`, `radius-md`, padding 12 px,
  14/500 `danger`.
- **Botón**: primario “Invia messaggio” (icono `Send`); ancho completo en < 640. Enviando: icono `LoaderCircle` girando + “Invio in corso…”.
- **Éxito**: sustituye al formulario. Panel `success-subtle`, borde `success/30`, `radius-lg`, padding 24 px (32 px ≥ 640), centrado:
  `CircleCheck` 48 px `success`, h3 20/700 enfocado, texto `ink`, botón secundario “Invia un altro messaggio”.

### 6.7 Carrito (botón del header + drawer)

- **Botón**: icono `ShoppingBag` 24 px en botón de 44×44; contador absoluto arriba-derecha (alto 20 px, mín. 20 px de ancho, fondo
  `accent`, texto `ink` 12/700) solo con artículos (“99+” por encima de 99). `aria-label` “Apri il carrello, N articoli nel carrello”,
  `aria-haspopup="dialog"`. Región `aria-live="polite"` contigua: “N articoli nel carrello” cuando cambia (no al restaurar).
- **Drawer**: `<dialog>` modal anclado a la derecha, ancho `min(26rem, 100vw)`, alto `100dvh`, `surface`, `shadow-overlay`,
  `::backdrop` = `backdrop`; columna flex:
  - Cabecera (padding 12 × 20 px, borde inferior): h2 “Il tuo carrello” (20/700) + “(N)” 16 px `ink-muted`; botón “Chiudi il carrello” 44×44.
  - Lista (scroll propio, separadores `border`): por línea, miniatura 64×64 `radius-md` (`alt=""`), nombre 14/600, “Formato · 10 apr 2027”
    12 px `ink-muted`, “382,50 € / cad.” 14 px, stepper (−, cantidad en `<output>`, +; botones 44×44, borde `border-strong`) + total de
    línea (Figtree 700, derecha), “Rimuovi” (icono `Trash2`, 14/500 `danger`, hover `danger-subtle`, alto 44 px).
  - Pie (padding 20 px, borde superior): `dl` “Subtotale” (Figtree 600) / importe 24/700; “Risparmi” / “−X €” en `success` 14 px;
    nota 12 px “IVA inclusa…”; botón primario a ancho completo “Procedi all’ordine” (solo visual, `aria-describedby` →
    “Demo: l’ordine non viene inviato.”); botón ghost `danger` “Svuota il carrello”.
  - Vacío: centrado, círculo 64 px `primary-subtle` con `ShoppingBag` 32 px, “Il carrello è vuoto” (Figtree 600 18 px), texto 14 px,
    botón primario “Scopri i corsi” (aplica el filtro Formazione).
- Solo los **cursos** se añaden; los tests (“Scopri di più”) no.

### 6.8 Header

- `surface`, borde inferior `border`, `z-index: 40`; **sticky solo si el viewport mide ≥ 30rem de alto**.
- Alturas fijas: 64 px (< 1024) / 72 px (≥ 1024); en < 768 se añade la fila del buscador (44 px + 12 px) → 120 px en total.
  `scroll-padding-top` = alto del header + 16 px (solo cuando es sticky).
- Logo: monograma SVG 32 px (cuadrado `radius 7/32` `primary`, “G” en trazo blanco, punto `accent`) + “Giunti” (Figtree 700 18 px
  `ink`) “Psychometrics” (600, `primary`). Variante `on-dark` (footer): cuadrado blanco, “G” `primary`, texto blanco / `primary-subtle`.
- Nav (≥ 1024): enlaces Figtree 500 16 px `ink`, padding 12 px, alto 44 px, `radius-md`; hover `primary-subtle` + texto `primary`.
- “Accedi”: botón secundario con icono `UserRound`, visible ≥ 768 (en móvil, dentro del menú).
- **Menú móvil** (< 1024): botón `Menu`/`X` 44×44 (`aria-expanded`, `aria-controls`, “Apri il menu” / “Chiudi il menu”). Panel bajo el
  header a ancho completo (`surface`, borde inferior, `shadow-overlay`) + fondo `backdrop` hasta abajo; enlaces Figtree 500 18 px,
  alto 48 px; separador y “Accedi” a ancho completo en < 768. Esc cierra, foco atrapado, la página no hace scroll.

### 6.9 Hero

- `.on-dark`, texto blanco. Fondo (`.hero-surface`, capas de arriba abajo):
  1. `radial-gradient(circle at 85% 15%, accent 35 % → transparent 45 %)` — brillo decorativo;
  2. `radial-gradient(white 9 % 1px, transparent 1px)` en mosaico de 22 px — patrón de puntos;
  3. `linear-gradient(135deg, ink 0 %, primary 100 %)`.
- Rejilla: 1 columna; ≥ 1024 dos (1,1fr / 1fr), gap 48 px, alineación vertical centrada.
- Contenido (máx. 42rem): eyebrow “CATALOGO 2026/27” (`accent-subtle`) → 12 px → h1 → 20 px → lead (`primary-subtle`, máx. 60ch) → 32 px →
  CTAs (`on-dark` lg “Esplora il catalogo” + `ArrowDown`; `on-dark-outline` lg “Scopri la formazione” + `ArrowRight`, que aplica el
  filtro Formazione), separación 12 px, apilados a ancho completo en < 640 → 40 px → `dl` de 3 columnas (máx. 32rem, borde superior
  `white/20`, 24 px de padding): cifra 30/700 encima, etiqueta 14 px `primary-subtle` debajo (orden DOM `dt`, `dd`).
- Ilustración (solo ≥ 1024, `aria-hidden`, máx. 32rem): tarjeta blanca con histograma de 13 barras `primary-subtle` (una en `accent`),
  curva normal en trazo `primary` de 3 px, línea discontinua `ink-muted`; tarjetas flotantes “Percentile 84°” y “Report pronto” (check `success`).
- **El LCP es texto** (h1 en escritorio, lead en móvil): no hay foto en el hero.

### 6.10 Franja de confianza

- Banda `surface` a ancho completo con bordes superior e inferior `border`, entre el catálogo y Contatti; h2 `sr-only` “Perché sceglierci”.
- `<ul>` en el contenedor, padding vertical 40 px; 1 / 2 (≥ 640) / 4 (≥ 1024) columnas; separación 24 px × 32 px.
- Ítem: círculo 48 px `primary-subtle` con icono 24 px `primary` (trazo 1,75; `aria-hidden`) + h3 Figtree 600 16 px + texto 14 px `ink-muted`.
- Iconos: `Truck` (Spedizione gratuita), `ShieldCheck` (Pagamenti sicuri), `BadgeCheck` (Test validati), `Headset` (Centro assistenza).

### 6.11 Contatti (sección)

- Rejilla 1 col; ≥ 1024 2 columnas (2fr / 3fr), separación 64 px (40 px en móvil).
- Columna izquierda: eyebrow “CONTATTI” (`accent-strong`), h2, lead `ink-muted`, lista de canales (separación 16 px): círculo 44 px
  `primary-subtle` con icono 20 px (`Mail`, `Phone`, `Clock`) + etiqueta 14 px `ink-muted` + valor (enlace `primary` subrayado
  `primary/40`, alto 44 px; o texto `ink` 500).
- Columna derecha: panel del formulario (§6.6).

### 6.12 Diálogo de ficha (tests)

- `<dialog>` modal centrado, ancho `min(40rem, 100vw − 2rem)`, alto máx. `100dvh − 2rem` (scroll interno), `radius-lg`, `shadow-overlay`.
- Botón “Chiudi” (círculo blanco 44 px con `shadow-card`, arriba-derecha a 12 px) **primero en el DOM** (recibe el foco inicial).
- Imagen 16:7 con badge de formato; cuerpo con padding 24 px: eyebrow, h2 24/700, descripción `ink-muted`, `dl` (Autore, Età,
  Somministrazione, Formato; 14 px, separación 24 × 8 px), aviso de cualificación (fondo `primary-subtle`, borde `primary/30`, `radius-md`,
  padding 16 px: “Qualifica X” Figtree 600 + descripción), pie con borde superior: precio + “IVA inclusa · acquisto previa verifica della
  qualifica” y botón primario “Richiedi informazioni” (`Mail`) → `#contatti`.

### 6.13 Footer

- `.on-dark`, fondo `ink`, texto blanco.
- Rejilla (padding 56 px): 1 col → 2 col (≥ 640, la marca ocupa toda la fila) → 4 col (≥ 1024: 1,4fr 1fr 1fr 1fr), separación 40 / 48 px.
- Marca: logo `on-dark`, texto 14 px `primary-subtle` (máx. 24rem), redes (separación 8 px): círculos 44 px con borde `white/50`
  (hover borde blanco + `white/10`), glifos SVG propios de 20 px.
- Columnas (`<nav aria-labelledby>`): título h2 14 px Figtree 600 mayúsculas tracking 0,06em blanco; enlaces 14 px `primary-subtle`
  (hover blanco + subrayado), alto 44 px.
- Barra inferior (borde superior `white/15`, padding 24 px, 14 px `primary-subtle`): “© {año} Giunti Psychometrics S.r.l. — progetto
  dimostrativo.” + aviso de datos ficticios; a la derecha Privacy · Cookie · Termini di vendita (separación 20 px) y “Torna su” (blanco 500
  + `ArrowUp`, → `#main`). En < 768 se apila.

### 6.14 Skip link y 404

- Skip link “Vai al contenuto principale”: `fixed` arriba-izquierda (8 px), fondo `primary`, texto blanco Figtree 600, padding 12 × 16 px,
  `radius-md`, `shadow-overlay`; oculto con `translateY(-6rem)` y visible con `:focus-visible`.
- 404 (“Questa pagina non fa parte della demo”): eyebrow “ERRORE 404”, h1 en escala h2, lead, botón primario “Torna alla home”;
  centrado, padding 96 px.

## 7. Iconos

`lucide-react` 1.67.0 (trazo 2 salvo indicación; tamaños 14 / 16 / 20 / 24 / 28 / 32 / 48 px; siempre `aria-hidden`):
Search, X, Menu, UserRound, ShoppingBag, ArrowDown, ArrowRight, ArrowUp, Check, Info, BookOpen, MonitorSmartphone, CirclePlay,
MapPin, SearchX, RotateCcw, Mail, Phone, Clock, Send, LoaderCircle, CircleAlert, CircleCheck, Truck, ShieldCheck, BadgeCheck,
Headset, Plus, Minus, Trash2.
Redes sociales (LinkedIn, Instagram, YouTube, Facebook): glifos SVG propios en estilo lucide (lucide 1.x no incluye marcas).

## 8. Imágenes

Fotos de Unsplash (`images.unsplash.com/photo-{id}?fm=jpg&fit=crop&w=1200&h=800&q=80`), servidas por `next/image` en AVIF/WebP con
`loading="lazy"`; ninguna lleva `preload`. Créditos en [`CREDITS.md`](CREDITS.md). El `alt` describe la escena en italiano
(nunca “immagine di…”); las miniaturas del carrito son decorativas (`alt=""`).

## 9. Accesibilidad (resumen operativo)

`lang="it"`; skip link; landmarks `header` / `nav` / `search` / `main` / `section` con nombre / `footer` (3 `nav` etiquetados); un solo h1
sin saltos de nivel; objetivos ≥ 44 px; foco visible y nunca tapado; `aria-live` en contador de resultados, contador del carrito y estados
del formulario; `role="alert"` en el resumen de errores; diálogos modales con trampa de foco, Esc y retorno del foco;
`prefers-reduced-motion`; reflow sin pérdida a 400 %. Detalle y evidencias: [`AUDIT.md`](AUDIT.md).

## 10. Paridad con version-b

- Tokens: copia idéntica de `version-a/src/styles/tokens.css` (Tailwind 4 `@theme`) o, si version-b no usa Tailwind, las variables CSS
  de [`HANDOFF-LARAVEL.md`](HANDOFF-LARAVEL.md) §1.
- Mismas fuentes (Figtree y Noto Sans variables, subset latin), mismas URLs de imagen y mismos datos: `docs/handoff/products.json` y
  `docs/handoff/content.json`, generados desde el código TS (`npm run export:handoff`; un test falla si se desincronizan).
- Referencia de píxel: capturas en [`screenshots/version-a/`](screenshots/version-a).
