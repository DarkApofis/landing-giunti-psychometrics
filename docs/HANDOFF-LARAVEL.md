# Handoff → version-b (Laravel + Blade + jQuery)

Todo lo que la versión B necesita para ser **visualmente idéntica** a la A y comportarse igual.
Contrato visual completo: [`DESIGN-SPEC.md`](DESIGN-SPEC.md) (valores medidos en pantalla). Referencia de píxel:
[`screenshots/version-a/`](screenshots/version-a). Evidencias de accesibilidad que hay que igualar: [`AUDIT.md`](AUDIT.md).

**Regla de oro:** los textos, los datos, los tokens y los mensajes salen de los archivos de este directorio. Nada se reescribe a mano.

| Recurso | Archivo |
|---|---|
| Dataset de productos (12) | [`handoff/products.json`](handoff/products.json) — idéntico a `version-a/src/data/products.ts` |
| Textos, categorías, cualificaciones, navegación, footer, límites de validación | [`handoff/content.json`](handoff/content.json) |
| Tokens (fuente) | `version-a/src/styles/tokens.css` (Tailwind 4 `@theme`); versión en variables CSS planas en §1 |
| Regenerar ambos JSON | `cd version-a && npm run export:handoff` (el test `src/data/handoff.test.ts` falla si quedan desactualizados) |

---

## 1. Tokens finales

Si version-b usa **Tailwind 4** (recomendado: el markup de §4 se puede copiar casi literal), basta con copiar `tokens.css` y `globals.css`
de version-a. Si usa CSS propio/BEM, este bloque es el equivalente exacto:

```css
:root {
  /* Marca */
  --color-primary: #1b4f8a;  --color-ink: #0f2d52;  --color-accent: #0ea5e9;  --color-canvas: #eff6ff;
  /* Derivados */
  --color-primary-hover: #153f6f;  --color-primary-active: #10335a;  --color-primary-subtle: #dbeafe;
  --color-accent-strong: #0369a1;  --color-accent-subtle: #e0f2fe;  --color-surface: #ffffff;
  --color-ink-muted: #4a607d;  --color-border: #c7d7ec;  --color-border-strong: #6b84a3;
  --color-danger: #b42318;  --color-danger-subtle: #fef3f2;  --color-success: #1a7f37;  --color-success-subtle: #ecfdf3;
  --color-white: #ffffff;  --color-backdrop: rgb(15 45 82 / 0.5);
  /* Badges de formato (texto / fondo) */
  --color-format-cartaceo: #7a3e00;  --color-format-cartaceo-subtle: #fef0c7;
  --color-format-digitale: #0b4a6f;  --color-format-digitale-subtle: #e0f2fe;
  --color-format-online: #4a2c8f;    --color-format-online-subtle: #ede7fb;
  --color-format-presenza: #14532d;  --color-format-presenza-subtle: #dcfce7;
  /* Tipografía */
  --font-display: 'Figtree', 'Figtree Fallback', ui-sans-serif, system-ui, sans-serif;
  --font-sans: 'Noto Sans', 'Noto Sans Fallback', ui-sans-serif, system-ui, sans-serif;
  --text-display: clamp(2rem, 1.4rem + 3vw, 3.25rem);   /* lh 1.1, ls -0.02em */
  --text-h2: clamp(1.75rem, 1.5rem + 1vw, 2.25rem);      /* lh 1.2, ls -0.01em */
  --text-price: 1.5rem;                                   /* lh 1 */
  --text-eyebrow: 0.75rem;                                /* lh 1.2, ls 0.06em, uppercase */
  /* Layout */
  --container-page: 75rem;
  --header-h-mobile: 7.5rem;  --header-h: 4rem;  --header-h-lg: 4.5rem;
  /* Radios y sombras */
  --radius-sm: 6px;  --radius-md: 8px;  --radius-lg: 12px;
  --shadow-card: 0 1px 2px rgb(15 45 82 / 0.06), 0 1px 3px rgb(15 45 82 / 0.08);
  --shadow-card-hover: 0 8px 24px -6px rgb(15 45 82 / 0.18);
  --shadow-overlay: 0 16px 48px -12px rgb(15 45 82 / 0.35);
  /* Movimiento */
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --duration-fast: 150ms;  --duration-base: 200ms;  --duration-enter: 250ms;
}
```

| Grupo | Valores |
|---|---|
| Espaciado | Base 4 px. Contenedor 1200 px; gutter 16 / 24 (≥ 768) / 32 px (≥ 1280). Secciones 64 / 96 px (≥ 1024). Hero 64 / 80 / 96 px. Gap de grilla 24 px, 32 px ≥ 1280 |
| Tipografía | Escala completa con tamaños medidos: DESIGN-SPEC §2 |
| Radios | 6 (inputs) · 8 (botones) · 12 (cards, paneles, diálogos) · 9999 (pills, badges, círculos) |
| Sombras | `--shadow-card` (reposo) · `--shadow-card-hover` · `--shadow-overlay` (drawer, diálogo, menú, skip link) |
| Foco | `:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px }`; dentro de `.on-dark` → blanco |

**Fuentes:** Figtree y Noto Sans **variables**, subset latin, `font-display: swap`, auto-hospedadas (p. ej. `@fontsource-variable/figtree`
y `@fontsource-variable/noto-sans` con Vite, o los `.woff2` de Google Fonts en `public/fonts`). Precargar solo el latin:
`<link rel="preload" as="font" type="font/woff2" crossorigin href="…">`. Para igualar el “sin salto” de next/font, declarar las
fuentes de fallback con las métricas que genera Next (compilado en `version-a/.next/static/chunks/*.css`):

```css
@font-face { font-family: 'Figtree Fallback'; src: local('Arial');
  ascent-override: 94.32%; descent-override: 24.82%; line-gap-override: 0%; size-adjust: 100.72%; }
```
(para Noto Sans, copiar el bloque `Noto Sans Fallback` del mismo CSS compilado).

**Base global** (de `globals.css`): `body { background: canvas; color: ink; font: 16px/1.6 var(--font-sans); -webkit-font-smoothing: antialiased }`;
`h1–h4 { font-family: var(--font-display); text-wrap: balance }`; `p { text-wrap: pretty }`;
`html { scroll-behavior: smooth }` solo con `prefers-reduced-motion: no-preference`; `scroll-padding-top` = alto del header + 1rem solo
con `@media (min-height: 30rem)`; `html:has(dialog[open]) { overflow: hidden }`; `main:focus { outline: none }`;
`input[type=search]::-webkit-search-cancel-button { appearance: none }`; reduced motion → transiciones/animaciones 1 ms.

---

## 2. Breakpoints

`sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 (mobile-first, `min-width`) + `min-height: 30rem` para el header sticky.

| | < 640 | ≥ 640 | ≥ 768 | ≥ 1024 | ≥ 1280 |
|---|---|---|---|---|---|
| Header | 2 filas: [logo · carrito · menú] / [buscador] (120 px) | = | 1 fila: logo · buscador (máx 28rem, flex 1) · Accedi · carrito · menú (64 px) | logo · nav · buscador (máx 20rem) · Accedi · carrito (72 px); sin hamburguesa | = |
| Hero | 1 col; CTAs apilados a ancho completo | CTAs en fila | = | 2 col (1,1fr / 1fr) + ilustración | = |
| Pills | 1 fila con scroll horizontal a sangre; contador debajo | = | wrap; contador a la derecha (alineado abajo) | = | = |
| Grilla | 1 col | 1 col | 2 col | 3 col | 3 col, gap 32 |
| Franja confianza | 1 col | 2 col | 2 col | 4 col | = |
| Contacto | 1 col; Nome/Email apilados; botón a ancho completo | Nome + Email en 2 col; botón auto | = | 2 col (2fr / 3fr) | = |
| Footer | 1 col; barra inferior apilada | 2 col (marca a ancho completo) | barra inferior en fila | 4 col | = |
| Drawer | ancho 100vw | = | 26rem | = | = |

Alto del viewport < 30rem (zoom 400 %, móvil horizontal): header **estático** y sin `scroll-padding-top`.

---

## 3. Mapa de la página → Blade partials

```
resources/views/
├─ layouts/app.blade.php            <html lang="it">, <head> (meta SEO/OG de content.json → site), fuentes, skip link
├─ partials/skip-link.blade.php
├─ partials/header.blade.php        logo · nav · search · Accedi · cart-button · mobile-menu
├─ partials/hero.blade.php
├─ partials/catalog.blade.php       head · category-filter · results-status · product-grid · empty-state
├─ partials/product-card.blade.php  @include por cada producto (variantes test / corso)
├─ partials/product-dialog.blade.php   un <dialog> único, rellenado por jQuery desde products.json
├─ partials/trust-strip.blade.php
├─ partials/contact.blade.php       channels + contact-form (estados editing / submitting / success)
├─ partials/footer.blade.php
└─ partials/cart-drawer.blade.php
pages/home.blade.php  →  header, <main id="main" tabindex="-1"> hero · catalog · trust-strip · contact </main>, footer, cart-drawer
```

Orden obligatorio en `<main>`: **hero → catálogo → franja de confianza → contacto**. Header y footer fuera de `<main>`.

## 4. HTML semántico resultante (estructura + bloques BEM)

Estructura extraída del DOM renderizado de version-a. Los nombres BEM son la propuesta para version-b; entre `{{ }}` los datos de
`content.json`/`products.json`. Atributos ARIA e `id` **obligatorios** tal cual (los usan las pruebas y los lectores de pantalla).

### 4.1 Skip link y header

```html
<a class="skip-link" href="#main">Vai al contenuto principale</a>

<header class="site-header">                                <!-- sticky solo con min-height: 30rem -->
  <div class="site-header__bar container">
    <a class="logo" href="/"><svg class="logo__mark" aria-hidden="true">…</svg>
      <span>Giunti <span class="logo__accent">Psychometrics</span></span></a>

    <nav class="main-nav" aria-label="Navigazione principale">  <!-- visible ≥ 1024 -->
      <ul class="main-nav__list">
        <li><a class="main-nav__link" href="#catalogo" data-category="tutti">Test</a></li>
        <li><a class="main-nav__link" href="#catalogo" data-category="formazione">Formazione</a></li>
        <li><a class="main-nav__link" href="#risorse">Risorse</a></li>
        <li><a class="main-nav__link" href="#contatti">Contatti</a></li>
      </ul>
    </nav>

    <search class="site-search">                               <!-- 2ª fila a ancho completo < 768 -->
      <form class="site-search__form">
        <label class="sr-only" for="site-search-input">Cerca nel catalogo</label>
        <svg class="site-search__icon" aria-hidden="true">…</svg>
        <input id="site-search-input" class="site-search__input" type="search" name="q"
               placeholder="Cerca test o corsi…" autocomplete="off" enterkeyhint="search" spellcheck="false">
        <button class="site-search__clear" type="button" aria-label="Cancella la ricerca" hidden>…</button>
      </form>
    </search>

    <div class="site-header__actions">
      <div class="site-header__login"><button class="btn btn--secondary" type="button">… Accedi</button></div> <!-- ≥ 768 -->
      <button class="cart-button" type="button" aria-label="Apri il carrello, nessun articolo"
              aria-haspopup="dialog" aria-controls="cart-drawer">
        <svg aria-hidden="true">…</svg><span class="cart-button__badge" aria-hidden="true" hidden>0</span>
      </button>
      <span class="sr-only" role="status" aria-live="polite" data-cart-live></span>

      <div class="mobile-menu">                                 <!-- < 1024 -->
        <button class="mobile-menu__toggle" type="button" aria-label="Apri il menu"
                aria-expanded="false" aria-controls="mobile-menu-panel">…</button>
        <div class="mobile-menu__panel" id="mobile-menu-panel" hidden>
          <div class="mobile-menu__backdrop" aria-hidden="true"></div>
          <div class="mobile-menu__sheet">
            <nav aria-label="Navigazione principale"><ul>… mismos 4 enlaces (48 px) …</ul>
              <div class="mobile-menu__login"><button class="btn btn--secondary btn--block" type="button">Accedi</button></div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>
```

### 4.2 Hero

```html
<section class="hero on-dark" aria-labelledby="hero-title">
  <div class="hero__inner container">
    <div class="hero__content">
      <p class="eyebrow eyebrow--on-dark">{{ hero.eyebrow }}</p>
      <h1 class="hero__title" id="hero-title">{{ hero.title }}</h1>
      <p class="hero__lead">{{ hero.lead }}</p>
      <div class="hero__ctas">
        <a class="btn btn--on-dark btn--lg" href="#catalogo">{{ hero.primaryCta }} <svg aria-hidden="true">↓</svg></a>
        <a class="btn btn--on-dark-outline btn--lg" href="#catalogo" data-category="formazione">{{ hero.secondaryCta }} <svg aria-hidden="true">→</svg></a>
      </div>
      <dl class="hero__stats">                                  <!-- valores calculados del dataset: 8 · 4 · 46 -->
        <div class="hero__stat"><dt>test e questionari</dt><dd>8</dd></div>   <!-- visual: cifra arriba (column-reverse) -->
        …
      </dl>
    </div>
    <svg class="hero__illustration" aria-hidden="true">…</svg>   <!-- solo ≥ 1024; copiar el SVG de HeroIllustration.tsx -->
  </div>
</section>
```

### 4.3 Catálogo, card, estado vacío

```html
<section class="catalog container" id="catalogo" aria-labelledby="catalogo-title">
  <div class="catalog__head">
    <p class="eyebrow">{{ catalog.eyebrow }}</p>
    <h2 class="section-title" id="catalogo-title">{{ catalog.title }}</h2>
    <p class="lead">{{ catalog.intro }}</p>
  </div>
  <div class="catalog__toolbar">
    <div class="category-filter" role="group" aria-label="Filtra per categoria">
      <ul class="category-filter__list">
        <li><button class="pill is-active" type="button" aria-pressed="true" aria-label="Tutti 12 prodotti" data-category="tutti">
          <svg class="pill__check" aria-hidden="true">✓</svg>Tutti <span class="pill__count" aria-hidden="true">12</span></button></li>
        <li><button class="pill" type="button" aria-pressed="false" aria-label="Clinica e Neuropsicologia 3 prodotti"
              data-category="clinica-neuropsicologia">Clinica e Neuropsicologia <span class="pill__count" aria-hidden="true">3</span></button></li>
        …
      </ul>
    </div>
    <div class="results-status">
      <p class="results-status__visible" aria-hidden="true">12 prodotti trovati</p>
      <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">12 prodotti trovati</p>
    </div>
  </div>

  <ul class="product-grid" role="list">
    <li class="product-grid__item" data-id="neura-q" data-category="clinica-neuropsicologia" data-search="neura q batteria di valutazione neurocognitiva">
      <article class="product-card" aria-labelledby="product-neura-q-title">
        <div class="product-card__media">
          <img class="product-card__img" src="…" alt="{{ image.alt }}" width="1200" height="800" loading="lazy" decoding="async"
               srcset="…?w=384 384w, …?w=750 750w, …?w=1200 1200w"
               sizes="(min-width:1280px) 360px, (min-width:1024px) 31vw, (min-width:768px) 46vw, calc(100vw - 2rem)">
          <span class="format-badge format-badge--cartaceo"><svg aria-hidden="true">…</svg>
            <span><span class="sr-only">Formato: </span>Cartaceo</span></span>
        </div>
        <div class="product-card__body">
          <p class="eyebrow eyebrow--muted">Clinica e Neuropsicologia</p>
          <h3 class="product-card__title" id="product-neura-q-title">NEURA-Q — Batteria di valutazione neurocognitiva</h3>
          <p class="product-card__desc">…</p>
          <dl class="product-card__meta">
            <div><dt>Autore</dt><dd>Laura Bettini</dd></div>        <!-- display: contents en el div -->
            <div><dt>Età</dt><dd>18–90 anni</dd></div>
            <div><dt>Qualifica</dt><dd>C</dd></div>
            <div><dt>Durata</dt><dd>75 min</dd></div>
            <!-- corso: Docente · Inizio <time datetime="2027-01-19">19 gennaio 2027</time> · Durata "24 ore · 24 crediti ECM" · Sede "Online"|ciudad -->
          </dl>
          <div class="product-card__footer">
            <div class="product-card__pricing">
              <p class="price">
                <span class="price__final"><span class="sr-only">Prezzo scontato: </span>1.062,50 €</span>
                <span class="price__original"><span class="sr-only">, prezzo originale: </span><s>1.250,00 €</s></span>
                <span class="price__saving"><span aria-hidden="true">−15%</span><span class="sr-only">, risparmi il 15%</span></span>
              </p>
              <!-- sin descuento: <p class="price"><span class="price__final"><span class="sr-only">Prezzo: </span>180,00 €</span></p> -->
              <p class="price__vat">IVA inclusa</p>
            </div>
            <!-- test -->
            <button class="btn btn--secondary btn--block" type="button" aria-haspopup="dialog"
                    aria-label="Scopri di più: {{ name }}" data-details="neura-q">… Scopri di più</button>
            <!-- corso -->
            <button class="btn btn--primary btn--block" type="button"
                    aria-label="Aggiungi al carrello: {{ name }}" data-add-to-cart="corso-dsa">… Aggiungi al carrello</button>
          </div>
        </div>
      </article>
    </li>
    …
  </ul>

  <div class="empty-state" hidden>
    <span class="empty-state__icon"><svg aria-hidden="true">…</svg></span>
    <h3 class="empty-state__title">Nessun prodotto trovato</h3>
    <p class="empty-state__text"><span data-empty-context></span>{{ catalog.empty.hint }}</p>
    <button class="btn btn--primary" type="button" data-reset-filters>… Azzera filtri</button>
  </div>
</section>
```

Imágenes: version-b no tiene `next/image`. Usar la URL del JSON cambiando `w=1200` por `w=384|750|1200` en `srcset` (Unsplash/imgix
redimensiona), `width`/`height` 1200×800 + `aspect-ratio: 3/2` en el contenedor (CLS 0), `loading="lazy"` en todas, `fm=avif` opcional.

### 4.4 Diálogo de ficha (tests) y drawer del carrito

```html
<dialog class="product-dialog" id="product-dialog" aria-modal="true" aria-labelledby="product-dialog-title">
  <button class="product-dialog__close" type="button" aria-label="Chiudi">✕</button>   <!-- PRIMERO en el DOM -->
  <div class="product-dialog__media">img 16:7 + format-badge</div>
  <div class="product-dialog__body">
    <p class="eyebrow eyebrow--muted">{categoría}</p>
    <h2 id="product-dialog-title">{name}</h2>  <p>{description}</p>
    <dl>Autore · Età · Somministrazione “circa N minuti” · Formato</dl>
    <div class="qualification-note"><p>Qualifica C</p><p>{qualifications.C.description}</p></div>
    <div class="product-dialog__footer">price + “IVA inclusa · acquisto previa verifica della qualifica”
      <a class="btn btn--primary" href="#contatti">… Richiedi informazioni</a></div>
  </div>
</dialog>

<dialog class="cart-drawer" id="cart-drawer" aria-modal="true" aria-labelledby="cart-title">
  <div class="cart-drawer__inner">
    <div class="cart-drawer__head"><h2 id="cart-title">Il tuo carrello <span>(N)</span></h2>
      <button type="button" aria-label="Chiudi il carrello">✕</button></div>
    <ul class="cart-drawer__list" aria-label="Articoli nel carrello">
      <li class="cart-line">
        <img alt="" width="64" height="64"> <p class="cart-line__name">…</p> <p>Corso online · 19 gen 2027</p> <p>382,50 € / cad.</p>
        <div class="stepper" role="group" aria-label="Quantità di {name}">
          <button type="button" aria-label="Diminuisci la quantità di {name}" aria-disabled="true">−</button>
          <output aria-label="Quantità: 1">1</output>
          <button type="button" aria-label="Aumenta la quantità di {name}">+</button></div>
        <p class="cart-line__total"><span class="sr-only">Totale riga: </span>382,50 €</p>
        <button class="cart-line__remove" type="button" aria-label="Rimuovi {name} dal carrello">… Rimuovi</button>
      </li>
    </ul>
    <div class="cart-drawer__foot">
      <dl><div><dt>Subtotale</dt><dd>…</dd></div><div class="is-saving"><dt>Risparmi</dt><dd>−…</dd></div></dl>
      <p>{{ cart.vat }}</p>
      <button class="btn btn--primary btn--block" type="button" aria-describedby="cart-demo-note">Procedi all’ordine</button>
      <p id="cart-demo-note">Demo: l’ordine non viene inviato.</p>
      <button class="btn btn--ghost btn--block btn--danger-text" type="button">… Svuota il carrello</button>
    </div>
    <!-- vacío: icono · “Il carrello è vuoto” · texto · <a class="btn btn--primary" href="#catalogo" data-category="formazione">Scopri i corsi</a> -->
  </div>
</dialog>
```

### 4.5 Franja de confianza, contacto y footer

```html
<section class="trust" aria-labelledby="trust-title">
  <h2 class="sr-only" id="trust-title">Perché sceglierci</h2>
  <ul class="trust__list container">
    <li class="trust__item"><span class="icon-circle icon-circle--lg"><svg aria-hidden="true">truck</svg></span>
      <div><h3 class="trust__title">Spedizione gratuita</h3><p class="trust__text">…</p></div></li> …
  </ul>
</section>

<section class="contact container" id="contatti" aria-labelledby="contatti-title">
  <div class="contact__intro">eyebrow · <h2 id="contatti-title">…</h2> · lead ·
    <ul class="contact__channels"><li>icon-circle + <span>Email</span> <a href="mailto:…">assistenza@example.com</a></li> …</ul></div>
  <div class="contact__panel">
    <form class="contact-form" novalidate aria-labelledby="contact-form-title" aria-describedby="contact-form-note">
      <h3 id="contact-form-title">Scrivici un messaggio</h3>
      <p id="contact-form-note">I campi contrassegnati con * sono obbligatori.</p>
      <div class="contact-form__grid">
        <div class="field">
          <label class="field__label" for="contact-nome">Nome<span aria-hidden="true">*</span><span class="sr-only"> (obbligatorio)</span></label>
          <div class="field__control-wrap">
            <input class="field__control" id="contact-nome" name="nome" autocomplete="name" maxlength="80" aria-required="true">
          </div>
          <!-- con error: aria-invalid="true" aria-describedby="contact-nome-error" + -->
          <!-- <p class="field__error" id="contact-nome-error"><svg aria-hidden="true">!</svg><span>Inserisci il tuo nome.</span></p> -->
        </div>
        <div class="field">… Email: <p class="field__hint" id="contact-email-hint">Ti risponderemo a questo indirizzo.</p>
          <input type="email" inputmode="email" spellcheck="false" autocomplete="email" maxlength="254"
                 aria-describedby="contact-email-hint" …></div>
        <div class="field">… Messaggio: hint “Almeno 10 caratteri.” · <textarea rows="5" maxlength="2000" …></textarea></div>
      </div>
      <p class="form-alert" role="alert" hidden><svg aria-hidden="true">!</svg>Il modulo contiene 3 errori: correggi i campi evidenziati.</p>
      <button class="btn btn--primary contact-form__submit" type="submit"><svg aria-hidden="true">send</svg>Invia messaggio</button>
      <p class="sr-only" role="status"></p>
    </form>
    <div class="form-success" role="status" hidden>
      <svg aria-hidden="true">✓</svg><h3 tabindex="-1">Grazie! Il tuo messaggio è stato inviato.</h3>
      <p>{nome}, ti risponderemo al più presto. Nel frattempo puoi continuare a esplorare il catalogo.</p>
      <button class="btn btn--secondary" type="button">Invia un altro messaggio</button>
    </div>
  </div>
</section>

<footer class="site-footer on-dark" id="risorse">
  <div class="site-footer__grid container">
    <div class="site-footer__brand">logo (variante on-dark) · tagline ·
      <ul class="social" aria-label="Social network"><li><a class="social__link" href="https://www.linkedin.com/" target="_blank"
          rel="noopener noreferrer" aria-label="Giunti Psychometrics su LinkedIn (si apre in una nuova scheda)"><svg aria-hidden="true">…</svg></a></li> …</ul></div>
    <nav class="site-footer__col" aria-labelledby="footer-Esplora"><h2 id="footer-Esplora">Esplora</h2><ul>…</ul></nav>
    <nav class="site-footer__col" aria-labelledby="footer-Azienda">…</nav>
    <nav class="site-footer__col" aria-labelledby="footer-Assistenza">…</nav>
  </div>
  <div class="site-footer__bottom"><div class="container">
    <div><p>© {{ date('Y') }} Giunti Psychometrics S.r.l. — progetto dimostrativo.</p><p>{{ footer.copy.disclaimer }}</p></div>
    <div><ul aria-label="Note legali">Privacy · Cookie · Termini di vendita</ul> <a href="#main">Torna su <svg aria-hidden="true">↑</svg></a></div>
  </div></div>
</footer>
```

Los SVG (logo, ilustración del hero, redes) se copian de `Logo.tsx`, `HeroIllustration.tsx` y `SocialIcon.tsx`; los iconos lucide,
del paquete `lucide-static` (mismo nombre que en DESIGN-SPEC §7).

---

## 5. Formatos (servidor, PHP) — salida exacta

| Dato | Salida | PHP recomendado |
|---|---|---|
| Precio | `1.250,00 €` (espacio duro U+00A0 antes de €; agrupa también 4 cifras) | `number_format($v, 2, ',', '.') . "\u{00A0}€"`. **No** usar `NumberFormatter('it_IT')` sin ajustes: ICU no agrupa 4 cifras en italiano (`1250,00 €`), el mismo fallo que se detectó en A |
| Fecha (card) | `19 gennaio 2027` | tabla fija de meses: gennaio, febbraio, marzo, aprile, maggio, giugno, luglio, agosto, settembre, ottobre, novembre, dicembre |
| Fecha (carrito) | `19 gen 2027` | gen, feb, mar, apr, mag, giu, lug, ago, set, ott, nov, dic |
| Edad | `6–14 anni` (guion largo U+2013), `18+ anni` si `max` es `null` | |
| Descuento | `round((1 − discount/original) × 100)` → `−15%` (signo menos U+2212); sin chip si `discountPrice` es `null` | |
| Dinero en el carrito | en **céntimos enteros**: `toCents(x) = round(round(x × 100, 6))` | `(int) round(round($x * 100, 6))` |

---

## 6. Comportamientos a replicar con jQuery

Implementación de referencia: `version-a/src/lib/*.ts` (funciones puras, testeadas) — portarlas 1:1 a un `app.js`.

### 6.1 Búsqueda + filtro combinado

```js
// search.ts → normaliza: sin acentos, minúsculas, puntuación → espacio
function normalize(s) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('it-IT')
          .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}
// Coincide si TODAS las palabras están en el nombre (cualquier orden) o si la consulta sin espacios
// está en el nombre sin espacios ("neuraq" → "NEURA-Q"). Consulta vacía → todo.
function matchesQuery(text, query) {
  var q = normalize(query); if (q === '') return true;
  var hay = normalize(text);
  if (q.split(' ').every(function (t) { return hay.indexOf(t) !== -1; })) return true;
  return hay.replace(/ /g, '').indexOf(q.replace(/ /g, '')) !== -1;
}
```

- Estado: `{ category: 'tutti' | id, query: '' }`. Visible = `(category === 'tutti' || p.category === category) && matchesQuery(p.name, query)`;
  conserva el orden del JSON (mostrar/ocultar `<li>` con `hidden`, no reordenar).
- **Conteos de las pills** = productos por categoría **con la búsqueda aplicada** (y “Tutti” = total); actualizar el número visible y el
  `aria-label` “{label} {n} prodotti”. Una pill con 0 sigue siendo pulsable.
- Pills: al pulsar → `aria-pressed` true solo en la activa, clase activa, icono check; si el scroller desborda, desplazar la pill activa a la
  vista (`left = pill.offsetLeft − scroller.offsetLeft − 16`). Al recibir foco: `this.scrollIntoView({ block: 'nearest', inline: 'nearest' })`.
  **Sin scroll-snap.**
- Contador: texto visible inmediato; región `aria-live` con **debounce de 400 ms**. Textos: `0 → "Nessun prodotto trovato"`,
  `1 → "1 prodotto trovato"`, `n → "{n} prodotti trovati"`.
- Vacío (0 visibles): ocultar la grilla y mostrar `.empty-state`, con contexto “Nessun risultato per «{query}» in {categoría}. ” (cada
  parte solo si aplica) + hint. “Azzera filtri” → `category = 'tutti'`, `query = ''`, vaciar el input y **mover el foco a “Tutti”**.
- Buscador: filtra en `input`; botón “Cancella la ricerca” visible solo con texto → vacía y devuelve el foco al input; `submit` (Enter) →
  `preventDefault` + `document.getElementById('catalogo').scrollIntoView({ block: 'start' })` (respeta el `scroll-behavior` del CSS).
- **URL**: `?categoria={id}&q={texto}` con `history.replaceState` (sin recargar); vacío si son los valores por defecto. Al cargar, leer la URL:
  categoría desconocida → “Tutti”; query cortada a 100 caracteres.
- Enlaces con `data-category` (nav “Test” → `tutti`, “Formazione”, CTA del hero, columna “Esplora” del footer, “Scopri i corsi” del carrito):
  al hacer clic aplicar la categoría y dejar que el ancla haga el scroll nativo.

### 6.2 Formulario (validación y estados)

Límites (`content.json → validation.limits`): nome 2–80, email ≤ 254, messaggio 10–2000. Se valida el valor **recortado**
(`trim`) y se cuentan **caracteres** (`Array.from(s).length`, no `s.length`).

| Campo | Condición | Mensaje exacto |
|---|---|---|
| Nome | vacío | `Inserisci il tuo nome.` |
| | < 2 | `Il nome deve contenere almeno 2 caratteri.` |
| | > 80 | `Il nome può contenere al massimo 80 caratteri.` |
| Email | vacío | `Inserisci il tuo indirizzo email.` |
| | no válido | `Inserisci un indirizzo email valido, ad esempio nome@dominio.it.` |
| Messaggio | vacío | `Scrivi il tuo messaggio.` |
| | < 10 | `Il messaggio deve contenere almeno 10 caratteri (ne manca 1).` · `… (ne mancano {n}).` |
| | > 2000 | `Il messaggio può contenere al massimo 2000 caratteri.` |

Regex de email (idéntica a A; ≤ 254 caracteres):
```js
/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/
```

Máquina de estados:
1. **editing**, sin errores visibles. **No** validar al salir de un campo antes del primer envío.
2. **submit** (`novalidate`, `preventDefault`): validar todo. Si hay errores → marcar cada campo (`aria-invalid="true"`, mensaje
   `#contact-{campo}-error`, `aria-describedby` = hint + error), mostrar `.form-alert` (`role="alert"`) con
   `"Il modulo contiene 1 errore: correggi il campo evidenziato."` / `"Il modulo contiene {n} errori: correggi i campi evidenziati."`,
   y **enfocar el primer campo inválido en orden visual** (nome → email → messaggio).
3. Tras el primer intento: revalidar el campo en `input` y en `blur`; ocultar `.form-alert` en cuanto el usuario escribe.
4. **submitting** (sin errores): el botón muestra spinner + `Invio in corso…`, `aria-disabled="true"` (**no** `disabled`), campos `readonly`,
   ignorar nuevos envíos, `role="status"` interno = `Invio in corso…`; esperar **900 ms**.
5. **success**: ocultar el formulario, mostrar `.form-success` (`role="status"`) con
   `Grazie! Il tuo messaggio è stato inviato.` + `"{nome recortado}, ti risponderemo al più presto. Nel frattempo puoi continuare a esplorare il catalogo."`
   y **enfocar su h3** (`tabindex="-1"`).
6. “Invia un altro messaggio” → formulario vacío, sin errores, foco en Nome.

(Validar también en Laravel con un `FormRequest` con las mismas reglas y mensajes si el formulario llega a enviarse al servidor.)

### 6.3 Menú móvil (< 1024)

Toggle: `aria-expanded` true/false, etiqueta `Apri il menu` ↔ `Chiudi il menu`, icono `Menu` ↔ `X`. Al abrir: quitar `hidden` del panel, foco al
primer enlace, `document.documentElement.style.overflow = 'hidden'`. Trampa simple: Tab desde el último control → toggle; Shift+Tab desde
el toggle → último control. **Esc** cierra y devuelve el foco al toggle. Clic en el fondo o en un enlace cierra (sin devolver el foco).
`matchMedia('(min-width: 64rem)')` → cerrar al pasar a escritorio.

### 6.4 Diálogos (ficha y carrito) — patrón común

`<dialog>` nativo con `showModal()` (da `aria-modal`, fondo inerte y Esc). Al abrir guardar `document.activeElement`; en el evento `close`
devolver el foco a ese elemento (si sigue en el DOM). Clic cuyo `target` es el propio `<dialog>` = clic en el fondo → `close()`.
`keydown` Tab/Shift+Tab: envolver entre el primer y el último control enfocable visible. Enlaces que llevan a otra zona (“Richiedi
informazioni”, “Scopri i corsi”) cierran **sin** devolver el foco. Ficha: rellenar desde `products.json` por `data-details`.

### 6.5 Carrito

- Solo **cursos** (`type === "corso"`). Estado `{ items: [{ productId, quantity }] }`; cantidades 1–99; añadir un existente suma 1.
- `localStorage` clave **`giunti-cart`**, formato `{"version":1,"items":[…]}`; **todo acceso en `try/catch`** (si falla, seguir en memoria).
  Lectura defensiva: JSON inválido/forma incorrecta → vacío; descartar ids que no existan en el dataset, cantidades no numéricas o < 1;
  truncar decimales; fusionar duplicados; limitar a 99. Escuchar `storage` para sincronizar pestañas. Primer render (Blade) = carrito vacío;
  restaurar en `$(function(){…})` **sin anunciar**.
- Totales en céntimos: `unit = toCents(discountPrice ?? originalPrice)`, `line = unit × qty`, `subtotal = Σ line`,
  `savings = Σ toCents(originalPrice) × qty − subtotal`.
- Botón del carrito: `aria-label` `Apri il carrello, nessun articolo` / `Apri il carrello, 1 articolo nel carrello` /
  `Apri il carrello, {n} articoli nel carrello`; badge visible si n > 0 (“99+” por encima de 99). Región `[data-cart-live]` (`aria-live="polite"`)
  = `Nessun articolo nel carrello` / `1 articolo nel carrello` / `{n} articoli nel carrello` solo cuando cambia.
- “Aggiungi al carrello”: añadir; anunciar `"{nombre} aggiunto al carrello"` en la región global; durante **2 s** el botón muestra el icono check,
  el texto `Aggiunto al carrello` y `aria-label="Aggiunto al carrello: {nombre}"`.
- Drawer: “−” con `aria-disabled` en 1, “+” en 99; “Rimuovi” → anunciar `"{nombre} rimosso dal carrello"` y mover el foco al “Rimuovi” de la
  línea siguiente (o anterior; si queda vacío, a “Scopri i corsi”). “Svuota il carrello” → anunciar `Carrello svuotato` y foco a “Scopri i corsi”.
  “Procedi all’ordine” no hace nada (solo visual).

### 6.6 Scroll suave

Solo CSS: `html { scroll-behavior: smooth }` dentro de `@media (prefers-reduced-motion: no-preference)` + `scroll-padding-top` (§1).
Las anclas son `<a href="#…">` normales: **no** animar con `$('html').animate()` (ignoraría la preferencia de movimiento reducido).

---

## 7. Patrones de accesibilidad que deben conservarse

- [ ] `lang="it"`; un solo `h1`; jerarquía h1 → h2 → h3 sin saltos (h2 `sr-only` en la franja de confianza; títulos de columna del footer = h2).
- [ ] Skip link como primer elemento enfocable → `#main` (`tabindex="-1"` en `<main>`).
- [ ] Landmarks: `header`, `nav` “Navigazione principale”, `search`, `main`, `section` con `aria-labelledby`, `footer` con 3 `nav` etiquetados.
- [ ] Foco visible (`:focus-visible`, 2 px `primary`, blanco sobre oscuro) en **todos** los controles; nunca `outline: none` sin sustituto.
- [ ] Objetivos ≥ 44 × 44 px (botones de icono, pills, enlaces del footer, enlaces de contacto, stepper).
- [ ] Contrastes de DESIGN-SPEC §1.4; `#0EA5E9` nunca como texto ni borde de control.
- [ ] Imágenes con `alt` descriptivo en italiano; iconos y SVG decorativos con `aria-hidden="true"`; miniaturas del carrito `alt=""`.
- [ ] Botones con nombre único: “Scopri di più: {nombre}”, “Aggiungi al carrello: {nombre}”, “Rimuovi {nombre} dal carrello”…;
      el `aria-label` siempre **contiene el texto visible** (label-in-name).
- [ ] Pills: `<button aria-pressed>` dentro de `role="group"` con `aria-label`.
- [ ] Regiones vivas: contador de resultados (polite, 400 ms), contador del carrito (polite), anuncios del carrito (polite), resumen de errores
      (`role="alert"`), envío y éxito (`role="status"`).
- [ ] Formularios: `<label for>` visible, `aria-required`, `aria-invalid`, `aria-describedby` (hint + error), foco al primer error,
      `aria-disabled` en lugar de `disabled` para no perder el foco.
- [ ] Diálogos: `<dialog>` modal, foco inicial en “Chiudi”, trampa de Tab, Esc, clic en el fondo, retorno del foco.
- [ ] Menú móvil: `aria-expanded` + `aria-controls`, Esc, trampa simple, retorno del foco.
- [ ] `prefers-reduced-motion`: sin `translate`/`scale` en hover, transiciones a 1 ms, scroll instantáneo.
- [ ] Reflow sin scroll horizontal a 320 px; header no sticky con alto < 30rem; espaciado de texto (1.4.12) sin recortes.

## 8. Verificación de paridad (recomendada)

Las pruebas e2e de version-a localizan por **rol, nombre accesible y texto**, no por clases de React, así que sirven para B:

```bash
cd version-a
E2E_BASE_URL=http://localhost:8000 npx playwright test e2e/catalog.spec.ts e2e/contact.spec.ts e2e/cart.spec.ts e2e/audit.spec.ts
```

Diferencias esperables que no son fallos de B: rutas específicas de Next y los nombres de
chunks. Comparar además las capturas de `docs/screenshots/version-a/` con las de B en 375 / 768 / 1280.
