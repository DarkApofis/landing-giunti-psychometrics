# Giunti Psychometrics Italia — Versión A (Next.js)

Landing de catálogo de **test psicológicos y cursos de formación** para profesionales: header con buscador, hero, catálogo filtrable
(categoría + búsqueda), franja de confianza, formulario de contacto, footer y mini-carrito. Interfaz en italiano, datos 100 % ficticios.

> Prueba técnica de Frontend Developer. Monorepo: [README raíz](../README.md) · Versión B (Laravel): [`../version-b/README.md`](../version-b/README.md)

**Despliegue:** _pendiente — se completa en el Prompt 9._

---

## 1. Requisitos y versiones exactas

| Herramienta                    | Versión usada                                        | Declarada en                                              |
| ------------------------------ | ---------------------------------------------------- | --------------------------------------------------------- |
| Node.js                        | **24.16.0**                                          | `.nvmrc`, `package.json → engines.node` (`>=24.16.0 <25`) |
| npm                            | **11.13.0**                                          | `package.json → engines.npm` (`>=11.13.0`)                |
| Next.js                        | **16.4.5** (App Router, Turbopack, Cache Components) | `package.json`                                            |
| React / React DOM              | **19.3.0**                                           | `package.json`                                            |
| Tailwind CSS                   | **4.3.4** (`@theme`, sin `tailwind.config`)          | `package.json`                                            |
| TypeScript                     | **5.9.3** (`strict`, `noUncheckedIndexedAccess`)     | `package.json`, `tsconfig.json`                           |
| Vitest · Playwright · axe-core | 5.1.0 · 1.64.1 · `@axe-core/playwright` 4.14.0       | `package.json`                                            |
| lucide-react (iconos)          | 1.67.0                                               | `package.json`                                            |

PHP y Composer: ver [`/version-b/README.md`](../version-b/README.md).

## 2. Instalación paso a paso

```bash
# 1. Node 24.16.0 (con nvm: usa el .nvmrc)
nvm install && nvm use            # o instala Node 24.16.0 manualmente

# 2. Dependencias (desde la raíz del monorepo)
cd version-a
npm ci                            # instala exactamente lo de package-lock.json

# 3. (Solo para los tests e2e) navegador de Playwright
npx playwright install chromium

# 4. Arrancar en desarrollo → http://localhost:3000
npm run dev
```

No hace falta `.env`: la única variable opcional es `NEXT_PUBLIC_SITE_URL` (URL canónica para metadatos; por defecto `http://localhost:3000`).
Las imágenes se cargan desde `images.unsplash.com` (hace falta conexión).

## 3. Comandos

| Comando                           | Qué hace                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo (http://localhost:3000)                                                                    |
| `npm run build`                   | Build de producción (`next build`)                                                                                |
| `npm run start`                   | Sirve el build de producción (`next start`; por defecto en el puerto 3000)                                        |
| `npm run lint`                    | ESLint (config de Next + `eslint-config-prettier`)                                                                |
| `npm run typecheck`               | `tsc --noEmit`                                                                                                    |
| `npm test`                        | Tests unitarios y de componentes (Vitest + Testing Library, jsdom)                                                |
| `npm run e2e`                     | Tests e2e + accesibilidad (Playwright + axe) contra el build de producción en :3100 (lo construye y arranca solo) |
| `npm run e2e:screenshots`         | Regenera las capturas de `docs/screenshots/version-a/` (375 / 768 / 1280 y estados)                               |
| `npm run check:tokens`            | Falla si aparece un color en crudo (`#hex`, `rgb()`…) fuera de los archivos de tokens                             |
| `npm run format` / `format:check` | Prettier (con orden de clases de Tailwind)                                                                        |
| `npm run export:handoff`          | Exporta el dataset y los textos a `docs/handoff/*.json` para la versión B                                         |
| `npm run verify`                  | `lint` + `typecheck` + `check:tokens` + `test` + `build` en cadena                                                |

Para lanzar los e2e contra un servidor ya arrancado (p. ej. `npm run dev`): `E2E_BASE_URL=http://localhost:3000 npm run e2e`.

## 4. Estructura

```
version-a/
├─ src/
│  ├─ app/                 layout.tsx (lang="it", fuentes, metadata SEO, providers, skip link) · page.tsx · not-found.tsx
│  │                       globals.css (base, foco, reduced motion, utilidades) · icon.svg
│  ├─ components/
│  │  ├─ ui/               Button, FormatBadge, Price, FormField (TextField/TextArea), QuantityStepper, Logo, SocialIcon
│  │  ├─ layout/           Header, MainNav, SearchBox, MobileMenu, CartButton, CartDrawer, CatalogLink, Footer, CopyrightYear, SkipLink
│  │  ├─ sections/         Hero, CatalogSection, Catalog, CategoryFilter, ProductGrid, ProductCard, ResultsStatus, EmptyState,
│  │  │                    ProductDialog, AddToCartButton, TrustStrip, ContactSection, ContactForm
│  │  └─ providers/        AppProviders, CatalogFiltersProvider, CartProvider, Announcer (contextos cliente)
│  ├─ data/                products.ts (12 productos tipados) · categories · qualifications · navigation · copy de cada sección
│  ├─ lib/                 format · search · catalog · validators · cart · storage · unsplash · cn   (lógica pura, testeada)
│  ├─ hooks/               useModalDialog · useDebouncedValue
│  ├─ styles/tokens.css    tokens de diseño (Tailwind 4 @theme) — único sitio con colores en crudo
│  └─ types/               product.ts · contact.ts
├─ e2e/                    layout · catalog · contact · cart · audit (axe, teclado, contraste, reflow) · screenshots
├─ scripts/                check-tokens.mjs · export-handoff.mjs
└─ next.config.ts          remotePatterns de Unsplash (host + ruta + query exacta)
```

Los tests unitarios viven junto al código (`*.test.ts[x]`).

## 5. Arquitectura: Server vs Client

**Server Components por defecto; `"use client"` solo en las islas con estado o APIs del navegador.**

| Server Components                                                                                                                                  | Por qué                                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `layout`, `page`, `Header`, `MainNav`, `Hero` (+ ilustración SVG), `CatalogSection`, `TrustStrip`, `ContactSection`, `Footer`, `Logo`, `not-found` | Markup estático: no necesitan estado ni JS en el cliente                                                       |
| `CopyrightYear`                                                                                                                                    | `'use cache'` + `cacheLife('days')`: año dinámico sin hacer dinámica la página (`/` sigue prerenderizada, `○`) |

| Client Components                                                                                                               | Por qué                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `CatalogFiltersProvider`                                                                                                        | Estado `{ categoría, búsqueda }` compartido entre el buscador (en `<header>`) y la grilla (en `<main>`) + sincronización con la URL |
| `CartProvider`, `Announcer`                                                                                                     | Carrito (`useReducer` + localStorage) y región `aria-live` global                                                                   |
| `SearchBox`, `MobileMenu`, `CartButton`, `CartDrawer`, `CatalogLink`                                                            | Eventos, foco, `<dialog>`, lectura del contexto                                                                                     |
| `Catalog` (+ `CategoryFilter`, `ProductGrid`, `ProductCard`, `ResultsStatus`, `EmptyState`, `ProductDialog`, `AddToCartButton`) | Filtrado en el cliente sin recarga; se **prerenderiza en el servidor** con las 12 cards (el HTML ya trae todo el contenido)         |
| `ContactForm`                                                                                                                   | Estados del formulario, validación y gestión del foco                                                                               |

**Por qué un contexto y no “elevar el estado” a un contenedor cliente:** el buscador y la grilla están lejos en el árbol. Un contenedor cliente
que guardara el estado tendría que envolver (y convertir en cliente) el Hero y el Footer; el provider solo recibe `children`, así que esas
secciones siguen siendo Server Components.

Otras decisiones:

- **Sin librerías de estado ni de formularios**: `useReducer` + contexto y validadores puros (`lib/validators.ts`), portables a la versión B.
- **Lógica pura y testeada** en `lib/` (formato, búsqueda, filtrado, carrito en céntimos, validación); los componentes solo la consumen.
- **Tokens obligatorios**: Tailwind 4 con la paleta por defecto **desactivada** (`--color-*: initial`) y `check:tokens` en `verify`.
- **Datos fuera del JSX**: productos y textos en `src/data/*`; los productos llegan a la grilla por el payload RSC (no están en el bundle JS).
- Next 16: `cacheComponents` + `partialPrefetching` (vienen en la plantilla); `next/image` con `preload` en lugar del `priority` deprecado
  (no se usa: el LCP es texto).

## 6. Supuestos

Lista completa y fechada en [`docs/ASSUMPTIONS.md`](../docs/ASSUMPTIONS.md) (A1–A35). Los que más afectan a la evaluación:

1. **Carrito**: solo los **cursos** se compran (“Aggiungi al carrello”); los **tests** abren “Scopri di più” con la cualificación necesaria A/B/C
   y ofrecen “Richiedi informazioni”, porque su compra exige verificar la cualificación. “Procedi all’ordine” y “Accedi” son solo visuales.
2. **Categorías ≠ formato**: 4 áreas (Clinica e Neuropsicologia, Scuola ed Età evolutiva, Lavoro e Organizzazioni, Formazione) y el formato
   (Cartaceo, Digitale, Corso online, In presenza) como badge.
3. **Navegación**: “Test” → catálogo completo (los tests están en 3 categorías); “Formazione” → filtro Formazione; “Risorse” → footer;
   “Contatti” → formulario. Los enlaces institucionales del footer llevan a un 404 en italiano (“non fa parte della demo”).
4. **Búsqueda** por nombre, sin distinguir mayúsculas, acentos ni puntuación; todas las palabras (AND); siglas con o sin guion.
5. **Precios** en euros con IVA; `discountPrice: null` = sin descuento. Formato `1.250,00 €` con `Intl` + `useGrouping: 'always'`
   (sin esa opción, el italiano de ICU escribe `1250,00 €`).
6. **Imágenes** remotas de Unsplash con `remotePatterns` restringido a la query exacta.
7. **Estructura**: monorepo `/version-a`, `/version-b`, `/docs`; tokens en `version-a/src/styles/tokens.css`; el dataset para B se genera desde el TS.
8. **Formulario sin backend**: envío simulado de 900 ms.
9. **Lighthouse** medido en local sobre el build de producción.
10. **Header sticky** solo con alto de viewport ≥ 30rem (con zoom del 400 % taparía media pantalla).

## 7. Mejoras sobre la referencia (y por qué)

Detalle en [`docs/IMPROVEMENTS.md`](../docs/IMPROVEMENTS.md) (M1–M22).

| Mejora                                                                                                                                                                         | Justificación                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| **Mini-carrito**: contador accesible en el header, drawer modal, cantidades, subtotal y ahorro, persistencia                                                                   | Convierte “Aggiungi al carrello” en un flujo real y verificable                         |
| **Dinero en céntimos enteros**                                                                                                                                                 | `19,99 × 3 = 59.97000000000001` en coma flotante; con céntimos, los totales son exactos |
| **Persistencia defensiva y sin errores de hidratación** (try/catch, lectura que descarta datos corruptos, sincronización entre pestañas, restauración tras el montaje)         | Funciona con el almacenamiento bloqueado o con datos viejos o manipulados               |
| **Ficha de detalle** de los tests con la cualificación A/B/C explicada                                                                                                         | Evita compras que el profesional no podría usar                                         |
| **Más información en la card**: cualificación y duración (tests); horas, créditos ECM y sede (cursos)                                                                          | Es lo que un profesional necesita para decidir sin abrir otra página                    |
| **Chip de descuento** junto al precio y ahorro en el carrito                                                                                                                   | Refuerza la jerarquía del precio que valora la prueba                                   |
| **Badge de formato** con icono + color + texto                                                                                                                                 | No depende solo del color (WCAG 1.4.1) y se escanea más rápido                          |
| **Búsqueda tolerante** (acentos, puntuación, siglas sin guion)                                                                                                                 | En italiano “età” y “eta” deben coincidir; las siglas se teclean de muchas formas       |
| **Conteos por categoría** que reflejan la búsqueda                                                                                                                             | El usuario sabe cuántos resultados hay en cada área antes de hacer clic                 |
| **Filtros en la URL** (`?categoria=&q=`) sin recarga + enlaces del nav, hero y footer que aplican el filtro                                                                    | Enlaces compartibles y atajos reales al contenido                                       |
| **Contador `aria-live` con debounce** y **estado vacío** con “Azzera filtri”                                                                                                   | Feedback sin saturar al lector de pantalla; nunca un callejón sin salida                |
| **Formulario**: mensajes concretos (“ne mancano 6 caratteri”), resumen de errores, foco al primer error, revalidación solo tras el primer intento, foco gestionado en el éxito | Recuperación de errores accesible y sin errores prematuros                              |
| **Hero sin foto** (gradiente de tokens + SVG)                                                                                                                                  | LCP en texto, menos bytes                                                               |
| **`ProductCard` memoizada con medición**                                                                                                                                       | Un test demuestra 12 → 0 re-renders por tecla                                           |
| **`remotePatterns` restringido**                                                                                                                                               | El optimizador de imágenes no se puede usar como proxy abierto                          |
| **404 en italiano** para rutas institucionales                                                                                                                                 | Ningún enlace lleva a una página rota sin explicación                                   |

## 8. Resultados de la auditoría

Informe completo, método y evidencias: [`docs/AUDIT.md`](../docs/AUDIT.md). Informes de Lighthouse: [`docs/lighthouse/version-a/`](../docs/lighthouse/version-a).

| Métrica                                                       | Móvil                     | Escritorio                | Objetivo |
| ------------------------------------------------------------- | ------------------------- | ------------------------- | -------- |
| Lighthouse Performance / Accessibility / Best Practices / SEO | **100 / 100 / 100 / 100** | **100 / 100 / 100 / 100** | ≥ 95     |
| LCP                                                           | **0,91 s**                | **0,27 s**                | < 2,5 s  |
| CLS                                                           | **0**                     | **0**                     | < 0,1    |
| TBT                                                           | **49 ms**                 | **0 ms**                  | —        |

Lighthouse 13.6, mediana de 3 ejecuciones, throttling simulado, build de producción en local.

| Accesibilidad                                                                                                                                                      | Resultado                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| axe-core (WCAG 2.0/2.1/2.2 A+AA + best practices) en 8 estados (375/768/1280/zoom 400 %, menú, estado vacío, diálogo, formulario con errores) + drawer del carrito | **0 violaciones**                                                   |
| Recorrido completo con teclado (1280 · 375 · 320×256)                                                                                                              | 55 · 51 · 51 paradas; foco visible en todas, 0 tapadas, sin trampas |
| Objetivos táctiles                                                                                                                                                 | mínimo **44 px**                                                    |
| Contraste del texto sobre el gradiente del hero (medido por píxeles)                                                                                               | peor caso **5,15 : 1**                                              |
| Reflow a 200 % / 400 %, espaciado de texto (1.4.12), movimiento reducido                                                                                           | sin pérdida de contenido; sin recortes; sin `translate`/`scale`     |

Pruebas: **141 unitarias/de componentes** (Vitest) · **77 e2e** funcionales y de auditoría (Playwright + axe, `npm run e2e`) · 21 de capturas (`npm run e2e:screenshots`). Capturas de referencia en
[`docs/screenshots/version-a/`](../docs/screenshots/version-a).

## 9. Limitaciones conocidas

- **Lighthouse** medido en local con throttling simulado; sin datos de campo (CrUX) ni servidor real. Se repetirá sobre la URL de despliegue.
- **Sin sesión manual con lector de pantalla** (NVDA/VoiceOver): la accesibilidad está verificada con axe, pruebas de teclado y semántica
  (nombres, roles, regiones vivas); sería el siguiente paso.
- **Avisos de Lighthouse no accionables**: JS sin usar (28 KiB) y JS legacy (14 KiB) están en el chunk del framework (polyfills de Next).
  Incrustar el CSS (`inlineCss`) se probó y **empeora** el LCP (A/B en `AUDIT.md` §2.2).
- **Deep links** con `?categoria=`: la página es estática, así que se renderiza “Tutti” y el filtro se aplica tras la hidratación (un instante).
- **Sin backend**: el formulario y el pedido se simulan; los enlaces institucionales del footer llevan a un 404 de demo; las redes sociales
  apuntan a las portadas de cada red.
- **Créditos de las fotos**: falta el nombre de los fotógrafos ([`docs/CREDITS.md`](../docs/CREDITS.md)); la API de Unsplash requiere clave.
- **Imágenes externas**: dependen de la disponibilidad de `images.unsplash.com`.

## 10. Documentación

| Documento                                                                                           | Contenido                                                                  |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [`docs/DESIGN-SPEC.md`](../docs/DESIGN-SPEC.md)                                                     | Sistema de diseño (refleja lo que hay en pantalla)                         |
| [`docs/PLAN.md`](../docs/PLAN.md)                                                                   | Plan por tareas y su estado                                                |
| [`docs/ASSUMPTIONS.md`](../docs/ASSUMPTIONS.md) · [`docs/IMPROVEMENTS.md`](../docs/IMPROVEMENTS.md) | Supuestos y mejoras                                                        |
| [`docs/AUDIT.md`](../docs/AUDIT.md)                                                                 | Auditoría de accesibilidad y rendimiento                                   |
| [`docs/HANDOFF-LARAVEL.md`](../docs/HANDOFF-LARAVEL.md)                                             | Todo lo necesario para la versión B (tokens, HTML, comportamientos, datos) |
