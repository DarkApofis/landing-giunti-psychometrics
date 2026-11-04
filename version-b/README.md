# Giunti Psychometrics Italia — Versión B (Laravel)

> 🚧 **En construcción.** Fase actual: esqueleto y pipeline (fases 0–2 de [`docs/PLAN-B.md`](../docs/PLAN-B.md)).
> Este README se completará al cerrar la versión B.

Objetivo: la misma landing que la [versión A](../version-a/README.md), **visualmente idéntica**, con Laravel + Blade + Stylus/BEM +
jQuery + Gulp. Especificación: [`docs/HANDOFF-LARAVEL.md`](../docs/HANDOFF-LARAVEL.md). Decisiones: [`docs/ASSUMPTIONS.md`](../docs/ASSUMPTIONS.md) (B1…).

## Versiones

Comprobadas el 2026-11-04 con `php -v`, `composer -V`, `node -v`, `npm -v` y `php artisan --version`.

| Herramienta | Versión | Fijada en |
|---|---|---|
| PHP | 8.4.0 | `composer.json` → `"php": "^8.4"` y `config.platform.php` = 8.4.0 |
| Composer | 2.8.12 | — |
| Laravel | 13.40.0 | `composer.lock` |
| Node | 24.16.0 | `.nvmrc` y `package.json` → `engines` |
| npm | 11.13.0 | `package.json` → `engines` |
| jQuery · Gulp · Stylus | 4.0.0 · 5.0.1 · 0.64.0 | `package.json` (versiones exactas) |

Extensiones de PHP: las de Laravel (ctype, curl, dom, fileinfo, filter, mbstring, openssl, session, tokenizer, xml). **No** hace falta
`intl`: los precios no usan `NumberFormatter` (HANDOFF §5). No hay base de datos.

## Puesta en marcha

```bash
cd version-b
nvm use                         # Node 24.16.0
composer install
cp .env.example .env && php artisan key:generate   # APP_KEY se genera; .env nunca se commitea
npm ci
npm run sync:handoff            # docs/handoff/*.json → resources/data
npm run build                   # Gulp → public/build (CSS/JS minificados con hash + manifest)
php artisan serve               # http://127.0.0.1:8000
```

`composer setup` encadena todo lo anterior salvo `serve`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Gulp en modo desarrollo (sourcemaps, sin minificar, watch) + `php artisan serve` |
| `npm run build` | Build de producción: Stylus → autoprefixer → cssnano; jQuery + módulos concatenados → terser; fuentes; hash + `rev-manifest.json` |
| `npm run clean` | Borra `public/build` |
| `npm run sync:handoff` | Copia `docs/handoff/*.json` a `resources/data` (una prueba falla si difieren) |
| `php artisan test` / `composer test` | PHPUnit |
| `composer lint` | Pint en modo comprobación |
