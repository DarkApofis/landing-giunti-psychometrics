# Sistema de diseño — Giunti Psychometrics (landing catálogo)

Fuente única de verdad visual para **version-a (Next.js)** y **version-b (Laravel)**.
Cualquier valor que aparezca en un componente debe salir de esta tabla. Si algo cambia en
código, se cambia aquí primero.

Herramienta de apoyo: skill *UI UX Pro Max* (`--design-system`, dominios `typography`, `ux`).
Recomendación aceptada: estilo **Minimalism & Swiss** (limpio, en rejilla, alto contraste,
movimiento sutil). Paleta sugerida por la skill **descartada**: los tokens de marca son obligatorios.

---

## 1. Color

### 1.1 Tokens de marca (obligatorios)

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#1B4F8A` | Botones primarios, pill activa, enlaces, anillo de foco |
| `--color-ink` | `#0F2D52` | Texto principal, footer, inicio del gradiente del hero |
| `--color-accent` | `#0EA5E9` | **Solo decorativo / fondo** (ver 1.3) |
| `--color-canvas` | `#EFF6FF` | Fondo de página |

### 1.2 Tokens derivados

| Token | Hex | Uso |
|---|---|---|
| `--color-primary-hover` | `#153F6F` | Hover del botón primario |
| `--color-primary-active` | `#10335A` | Estado pressed |
| `--color-primary-subtle` | `#DBEAFE` | Fondo hover de pills/ghost, filas seleccionadas |
| `--color-accent-strong` | `#0369A1` | Alternativa del acento **para texto/iconos** |
| `--color-accent-subtle` | `#E0F2FE` | Fondo del chip de descuento |
| `--color-surface` | `#FFFFFF` | Cards, header, drawer, inputs |
| `--color-ink-muted` | `#4A607D` | Texto secundario (autor, meta, precio tachado) |
| `--color-border` | `#C7D7EC` | Bordes decorativos (cards, separadores) |
| `--color-border-strong` | `#6B84A3` | Bordes de controles (inputs, pills inactivas) |
| `--color-danger` | `#B42318` | Texto/borde de error |
| `--color-danger-subtle` | `#FEF3F2` | Fondo de error |
| `--color-success` | `#1A7F37` | Texto/icono de éxito |
| `--color-success-subtle` | `#ECFDF3` | Fondo del panel de éxito |

Badges de formato (texto / fondo; el borde usa el texto al 20 %):

| Formato | Texto | Fondo | Icono lucide |
|---|---|---|---|
| Cartaceo | `#7A3E00` | `#FEF0C7` | `BookOpen` |
| Digitale | `#0B4A6F` | `#E0F2FE` | `MonitorSmartphone` |
| Corso online | `#4A2C8F` | `#EDE7FB` | `PlayCircle` |
| In presenza | `#14532D` | `#DCFCE7` | `MapPin` |

El formato **nunca se comunica solo por color**: siempre hay icono + texto.

### 1.3 Verificación de contraste (WCAG 2.1, calculado)

| Par | Ratio | Resultado |
|---|---|---|
| ink / surface | 13.84 | AAA |
| ink / canvas | 12.72 | AAA |
| primary / surface (enlaces, foco) | 8.29 | AAA |
| surface / primary (texto de botón) | 8.29 | AAA |
| surface / primary-hover | 10.65 | AAA |
| ink-muted / surface | 6.44 | AA |
| ink-muted / canvas | 5.92 | AA |
| accent-strong / surface | 5.93 | AA |
| border-strong / surface (componente UI) | 3.85 | ≥ 3:1 ✔ |
| danger / surface | 6.57 | AA |
| danger / danger-subtle | 6.05 | AA |
| success / success-subtle | 4.82 | AA |
| Badges de formato (los 4) | 7.35 – 8.51 | AAA |
| ink / accent (número del contador del carrito) | 4.99 | AA |
| **accent / surface** | **2.77** | ✘ falla texto y UI |
| **accent / canvas** | **2.55** | ✘ falla |

**Decisión:** `#0EA5E9` no se usa nunca como color de texto, borde de control ni anillo de foco.
Se usa como relleno decorativo (brillo del hero, subrayado del título, fondo del contador
del carrito con texto `ink`). Para texto o iconos con “sabor acento” se usa `--color-accent-strong`.

---

## 2. Tipografía

Self-hosted con `next/font/google` (version-b: los mismos `.woff2`, ver §10).

| Rol | Familia | Pesos |
|---|---|---|
| Títulos, botones, precios, badges | **Figtree** (variable) | 500–700 |
| Cuerpo, formularios | **Noto Sans** (variable) | 400, 500 |

Subset `latin` (cubre à è é ì ò ù). `display: swap` con métricas de fallback ajustadas (next/font) → sin CLS.

| Estilo | Tamaño / interlineado | Peso | Notas |
|---|---|---|---|
| Display (h1 hero) | `clamp(2rem, 1.4rem + 3vw, 3.25rem)` / 1.1 | 700 | `text-wrap: balance`, tracking −0.02em |
| h2 sección | `clamp(1.75rem, 1.5rem + 1vw, 2.25rem)` / 1.2 | 700 | |
| h3 card | 1.125rem / 1.35 | 600 | máximo 2 líneas (line-clamp) con altura reservada |
| Lead | 1.125rem / 1.6 | 400 | hero, intros |
| Body | 1rem / 1.6 | 400 | mínimo absoluto para cuerpo |
| Small | 0.875rem / 1.5 | 400–500 | autor, meta, precio tachado |
| Eyebrow / badge | 0.75rem / 1.2 | 600 | mayúsculas + tracking 0.06em; nunca para párrafos |
| Precio final | 1.5rem / 1 | 700 | `font-variant-numeric: tabular-nums` |

Longitud de línea del texto: máx. ~65ch.

---

## 3. Espaciado, rejilla y breakpoints

- Base 4 px (escala de Tailwind). Ritmo habitual: 8 / 12 / 16 / 20 / 24 / 32 / 48 / 64 / 96.
- Contenedor: `max-width: 75rem` (1200 px), padding lateral 16 px (<768), 24 px (≥768), 32 px (≥1280).
- Padding vertical de sección: 64 px móvil, 96 px ≥1024.

| Breakpoint | Ancho | Grid de productos | Nav |
|---|---|---|---|
| base | < 768 | 1 columna | menú hamburguesa |
| `md` | ≥ 768 | 2 columnas, gap 24 | hamburguesa + buscador visible |
| `lg` | ≥ 1024 | 3 columnas, gap 24 (32 ≥1280) | nav completa |

Verificación obligatoria en 375 / 768 / 1280.

## 4. Radios, sombras, foco

| Token | Valor | Uso |
|---|---|---|
| `--radius-sm` | 6 px | inputs, botones pequeños |
| `--radius-md` | 8 px | botones |
| `--radius-lg` | 12 px | cards, drawer, panel de formulario |
| `--radius-full` | 9999 px | pills, badges, contador |
| `--shadow-card` | `0 1px 2px rgb(15 45 82 / .06), 0 1px 3px rgb(15 45 82 / .08)` | card en reposo |
| `--shadow-card-hover` | `0 8px 24px -6px rgb(15 45 82 / .18)` | card en hover |
| `--shadow-overlay` | `0 16px 48px -12px rgb(15 45 82 / .35)` | drawer, menú móvil |

**Foco** (todos los controles, solo `:focus-visible`): `outline: 2px solid var(--color-primary); outline-offset: 2px`.
Sobre fondos oscuros (hero, footer): `outline-color: #FFFFFF`. Nunca `outline: none` sin sustituto.

## 5. Movimiento

| Caso | Duración | Easing |
|---|---|---|
| Color / fondo / borde | 150 ms | `ease-out` |
| Elevación de card, transformaciones | 200 ms | `cubic-bezier(.2,.8,.2,1)` |
| Entrada del drawer | 250 ms | `cubic-bezier(.2,.8,.2,1)` |
| Salida del drawer | 200 ms | `ease-in` |

Solo se animan `transform` y `opacity` (y colores). Sin reveal al hacer scroll ni JS de animación.
`prefers-reduced-motion: reduce` → sin traslados, el scroll suave pasa a instantáneo y las transiciones duran ≤ 1 ms.

---

## 6. Componentes

### 6.1 Botón

| Variante | Reposo | Hover | Active | Disabled |
|---|---|---|---|---|
| primary | fondo `primary`, texto blanco | `primary-hover` | `primary-active` | opacidad .5, `cursor: not-allowed` |
| secondary (Accedi) | borde 1 px `primary`, texto `primary`, fondo `surface` | fondo `primary-subtle` | fondo `primary-subtle` + borde `primary-active` | ídem |
| ghost / icono | transparente, texto `ink` | fondo `primary-subtle` | — | — |
| on-dark (hero) | fondo blanco, texto `ink` | fondo `canvas` | — | — |

Alto mínimo 44 px (área táctil ≥ 44×44 también en botones de icono). Padding horizontal 20 px. Figtree 600, 1rem.
Los botones de icono llevan `aria-label` en italiano y el SVG con `aria-hidden`.

### 6.2 Card de producto (pieza clave)

```
┌──────────────────────────────┐
│ [▣ Digitale]          [-20%] │  ← imagen 3:2, badges superpuestos (fondo opaco)
│           IMAGEN             │
├──────────────────────────────┤
│ VALUTAZIONE COGNITIVA        │  eyebrow, ink-muted
│ NEURA-Q — Batteria di        │  h3, 2 líneas máx.
│ valutazione neurocognitiva   │
│ 👤 di Laura Bettini          │  small, ink-muted, icono
│ 👥 Età 6–16 anni · 40 min    │  o 📅 Inizio 19 gen 2027 · 24 h
│ Qualifica B                  │  o 24 crediti ECM · Milano (M9)
│                              │
│ 1.250,00 €   1.560,00 €      │  precio final 24/700 + original tachado 14
│ ┌──────────────────────────┐ │
│ │  🛒 Aggiungi al carrello │ │  botón primario, ancho completo, 44 px
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

- `<article>` con `aria-labelledby` apuntando al h3. Fondo `surface`, borde 1 px `border`, `radius-lg`, `shadow-card`.
- Card como columna flex: el bloque de precio + botón usa `mt-auto`, así todas las cards de una fila alinean sus botones.
- Imagen: `aspect-ratio: 3/2` reservado (CLS 0), `object-fit: cover`, radio superior heredado.
  `sizes="(min-width:1280px) 384px, (min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"`.
- Badge de formato: arriba a la izquierda sobre la imagen, pill de 28 px de alto, icono 14 px + texto 12/600, fondo opaco del formato.
- Chip de descuento: arriba a la derecha, solo si hay descuento; fondo `accent-subtle`, texto `ink`, por ejemplo “−20%”, con `aria-label="Sconto del 20%"`.
- Precio: final en `ink` 24/700 tabular; original en `ink-muted` 14 con `line-through`, dentro de `<s>`
  más texto `sr-only` (“Prezzo originale”, “Prezzo scontato”). Sin descuento → solo el precio.
- Formato del precio: `Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' })` → `1.250,00 €` (espacio duro).
- Estados:
  - **hover** (solo puntero fino, `@media (hover:hover)`): `translateY(-2px)`, `shadow-card-hover`, el borde pasa a `primary` al 40 %, la imagen hace `scale(1.03)` dentro de `overflow:hidden`.
  - **focus-within**: anillo de 2 px `primary` en el botón y además el borde de la card en `primary` (da contexto de qué card tiene el foco).
  - **añadido**: el botón pasa ~2 s a “Aggiunto ✓” (icono `Check`), anunciado en una región `aria-live="polite"` global; el contador del header se actualiza.
- Sin card clicable entera (evita controles anidados); el único control es el botón.

### 6.3 Pills de categoría

- `<div role="group" aria-label="Filtra per categoria">` con `<button aria-pressed>`.
- Alto 44 px, padding 16 px, `radius-full`, Figtree 500 15 px, con un contador opcional entre paréntesis.
- Inactiva: fondo `surface`, borde `border-strong`, texto `ink`. Hover: fondo `primary-subtle`.
- Activa: fondo `primary`, texto blanco, borde `primary`, más un icono `Check` (no depende solo del color).
- Hacen wrap en varias líneas (sin scroll horizontal oculto).

### 6.4 Buscador

- `<search>` (o `role="search"`) + `<label class="sr-only">Cerca nel catalogo</label>` + `input type="search"`.
- Alto 44 px, icono `Search` a la izquierda, botón `X` para limpiar cuando hay texto.
- Filtra la grilla en vivo (normalizando acentos y mayúsculas). Al pulsar Enter hace scroll hasta `#catalogo`
  (no al escribir: un salto de página mientras se teclea desorienta).

### 6.5 Estado de resultados

- Texto “12 prodotti” encima de la grilla, dentro de `aria-live="polite"`, con debounce de 300 ms para la búsqueda.
- Vacío: icono, “Nessun prodotto corrisponde alla ricerca” y botón “Azzera filtri”.

### 6.6 Campos de formulario

- Label visible encima (Noto 500 14 px, `ink`), asterisco con texto `sr-only` “obbligatorio”.
- Input: alto 44 px (textarea 140 px), borde 1 px `border-strong`, `radius-sm`, fondo `surface`, texto 16 px (evita el zoom en iOS).
- Error: borde de 2 px en `danger`, mensaje debajo en `danger` 14 px con icono `AlertCircle`, `aria-invalid="true"`, `aria-describedby` hacia el mensaje.
- Validación: en el submit; después de un primer error, revalida al cambiar o al salir del campo. Al enviar con errores, el foco va al primer campo inválido.
- Éxito: el panel `success-subtle` sustituye al formulario, con icono `CheckCircle2`, un h3 enfocado programáticamente y el botón “Invia un altro messaggio”.

### 6.7 Drawer del carrito

- Abre con el botón del header (icono `ShoppingBag` y contador `accent` con texto `ink`).
  El `aria-label` es dinámico: “Carrello, 3 articoli”.
- `<dialog>` nativo con `showModal()`: trampa de foco, Esc para cerrar, `::backdrop` en `ink` al 50 %. Al cerrar, el foco vuelve al botón.
- Lateral derecho, ancho `min(26rem, 100vw)`, `shadow-overlay`.
- Cada línea: miniatura 64 px, nombre, formato, stepper − cantidad + (44 px) y “Rimuovi”.
- Pie: subtotal, “Risparmi X €” en `success`, nota “IVA inclusa” y el botón “Procedi all'ordine”, que solo informa de que es una demo.
- Persistencia en `localStorage`, con hidratación protegida (sin mismatch SSR).

### 6.8 Header

- Sticky, fondo `surface`, borde inferior `border`; alto 64 px (72 ≥1024).
- Logo: monograma SVG (cuadrado `primary` con una “G”) + “Giunti Psychometrics” (Figtree 700).
- ≥1024: logo · nav (Test, Formazione, Risorse, Contatti) · buscador · Accedi · carrito.
- <1024: logo · carrito · hamburguesa; el buscador ocupa una segunda fila a ancho completo.
- Menú móvil: panel desplegable bajo el header, `aria-expanded`/`aria-controls`, Esc para cerrar, enlaces de 48 px.

### 6.9 Hero

- Fondo: `linear-gradient(135deg, ink 0%, primary 100%)`, más un brillo radial `accent` al 25 % (decorativo) y un patrón SVG sutil de puntos. Texto blanco.
- Contenido: eyebrow “Catalogo 2026/27”, h1, lead, CTA “Esplora il catalogo” (on-dark) y un enlace secundario “Scopri la formazione”.
- A la derecha (≥1024), ilustración SVG inline decorativa (`aria-hidden`).
- **El LCP es el h1 (texto)**, no una imagen: no se usa una foto de hero. Ver ASSUMPTIONS sobre `priority`.

### 6.10 Footer

- Fondo `ink`, texto blanco y enlaces blancos con subrayado en hover (13.84:1).
- 4 columnas en ≥1024 (marca + descripción, Catalogo, Risorse, Contatti), 2 en tablet y 1 en móvil.
- Redes: iconos SVG placeholder (LinkedIn, Facebook, YouTube, Instagram) de 44 px con `aria-label`.
- Barra inferior: “© 2026 Giunti Psychometrics S.r.l. (demo)” y enlaces Privacy · Cookie.

## 7. Iconos

`lucide-react`, importados de uno en uno: Search, X, Menu, ShoppingBag, Plus, Minus, Trash2, Check,
BookOpen, MonitorSmartphone, PlayCircle, MapPin, User, Users, Calendar, AlertCircle, CheckCircle2, ArrowRight, Mail, Phone.
Redes sociales: SVG inline propios (lucide ya no incluye marcas). Tamaño 16/20/24, stroke 2. Sin emojis.

## 8. Imágenes

Fotos remotas de Unsplash (recorte 1200×800, ver `src/lib/unsplash.ts`) servidas por el optimizador de `next/image`
(AVIF/WebP, `lazy` por defecto), con créditos en `docs/CREDITS.md`. El alt describe la escena; nunca “immagine di…”.

## 9. Accesibilidad (resumen operativo)

`lang="it"`, skip link “Vai al contenuto principale” (visible al recibir el foco), landmarks
`header/nav/main/footer`, un solo h1, jerarquía h2 → h3, objetivos ≥ 44 px, `aria-live` para
resultados, carrito y errores, `prefers-reduced-motion`. El contenido no depende del hover.

## 10. Paridad con version-b

- Tokens en `version-a/src/styles/tokens.css` (bloque `@theme` de Tailwind 4). version-b usa una copia
  idéntica del archivo, y la igualdad se comprueba comparando los dos (ver ASSUMPTIONS A5).
- Mismas fuentes (Figtree y Noto Sans, variables, subset latin), mismas URLs de imagen y mismos datos
  (generados a partir de `version-a/src/data/products.ts`).
- Mismas clases de Tailwind en el markup siempre que sea posible.
