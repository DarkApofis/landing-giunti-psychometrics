# Giunti Psychometrics Italia — Landing catálogo (prueba técnica)

Landing de catálogo de test psicológicos y cursos de formación para profesionales, implementada **dos veces con el mismo resultado visual**:
una versión headless moderna en Next.js y otra en el stack PHP/Laravel. Interfaz en italiano; todos los datos son ficticios.

| Versión | Stack | Estado | Documentación | URL |
|---|---|---|---|---|
| **A** | Next.js 16.4.5 · React 19.3.0 · Tailwind 4.3.4 · TypeScript 5.9.3 · Node 24.16.0 | ✅ Completa y auditada (Lighthouse 100 ×4, axe 0 violaciones) | [`version-a/README.md`](version-a/README.md) | https://giunti-psychometrics-a.vercel.app |
| **B** | Laravel 13.40.0 · PHP 8.4 · Blade · Stylus 0.64 + BEM · jQuery 4.0.0 · Gulp 5.0.1 · Node 24.16.0 | ✅ Completa y auditada (Lighthouse en producción 97/100/100/100, LCP 1,37 s; axe 0 violaciones, paridad con A: máx. 0,09 % de píxeles) | [`version-b/README.md`](version-b/README.md) | https://giunti-psychometrics-b.onrender.com |

## Estructura del monorepo

```
landing-giunti-psychometrics/
├─ version-a/     Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind CSS 4           → README propio
├─ version-b/     Laravel 13 + Blade + Stylus/BEM + jQuery 4 + Gulp 5 (misma UI, mismos datos)     → README propio
├─ tools/parity/  comparación A ↔ B (píxeles y valores computados) y Lighthouse
├─ render.yaml    Blueprint de Render para la versión B (Docker)
└─ docs/          documentación compartida por ambas versiones
   ├─ DESIGN-SPEC.md        sistema de diseño (contrato visual)
   ├─ HANDOFF-LARAVEL.md    traspaso A → B: tokens, HTML semántico, breakpoints, comportamientos, accesibilidad
   ├─ handoff/              products.json + content.json (dataset y textos, generados desde version-a; B los copia)
   ├─ PLAN.md · PLAN-B.md · ASSUMPTIONS.md · IMPROVEMENTS.md · CREDITS.md
   ├─ AUDIT.md (A) · AUDIT-B.md (B) · PARITY.md (A ↔ B)
   ├─ lighthouse/version-{a,b}/   informes de Lighthouse
   └─ screenshots/version-{a,b}/  capturas 375 / 768 / 1280 y estados
```

## Por dónde empezar

1. **Evaluar cada versión**: [`version-a/README.md`](version-a/README.md) y [`version-b/README.md`](version-b/README.md) → instalación,
   comandos, versiones, arquitectura, supuestos, mejoras y resultados.
2. **Decisiones de diseño**: [`docs/DESIGN-SPEC.md`](docs/DESIGN-SPEC.md).
3. **Calidad**: [`docs/AUDIT.md`](docs/AUDIT.md) (A) y [`docs/AUDIT-B.md`](docs/AUDIT-B.md) (B), con evidencias de accesibilidad y rendimiento.
4. **Paridad**: [`docs/PARITY.md`](docs/PARITY.md) mide cuánto se parecen A y B; [`docs/HANDOFF-LARAVEL.md`](docs/HANDOFF-LARAVEL.md)
   es la especificación que cumple B.
5. **Supuestos y mejoras**: [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) y [`docs/IMPROVEMENTS.md`](docs/IMPROVEMENTS.md).

## Inicio rápido

```bash
cd version-a && nvm use && npm ci && npm run dev            # A → http://localhost:3000
cd version-b && nvm use && composer setup && npm run dev    # B → http://127.0.0.1:8000 (requiere PHP 8.4 y Composer)
```

## Despliegue

| Versión | Plataforma | URL |
|---|---|---|
| A | Vercel (directorio `version-a`, Next.js) | https://giunti-psychometrics-a.vercel.app |
| B | Render (Docker: nginx + PHP-FPM; [`render.yaml`](render.yaml), [`version-b/Dockerfile`](version-b/Dockerfile)) | https://giunti-psychometrics-b.onrender.com |
