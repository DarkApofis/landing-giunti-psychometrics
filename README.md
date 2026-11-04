# Giunti Psychometrics Italia — Landing catálogo (prueba técnica)

Landing de catálogo de test psicológicos y cursos de formación para profesionales, implementada **dos veces con el mismo resultado visual**:
una versión headless moderna en Next.js y otra en el stack PHP/Laravel. Interfaz en italiano; todos los datos son ficticios.

## Estructura del monorepo

```
landing-giunti-psychometrics/
├─ version-a/   Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind CSS 4   → README propio
├─ version-b/   Laravel + Blade + jQuery (misma UI, mismos datos)                           → README propio
└─ docs/        Documentación compartida por ambas versiones
   ├─ DESIGN-SPEC.md        sistema de diseño (contrato visual)
   ├─ HANDOFF-LARAVEL.md    traspaso A → B: tokens, HTML semántico, breakpoints, comportamientos, accesibilidad
   ├─ handoff/              products.json + content.json (dataset y textos, generados desde version-a)
   ├─ PLAN.md · ASSUMPTIONS.md · IMPROVEMENTS.md · AUDIT.md · CREDITS.md
   ├─ lighthouse/version-a/ informes de Lighthouse (antes / después)
   └─ screenshots/version-a/ capturas de referencia 375 / 768 / 1280 y estados
```

| Versión | Stack | Estado | Documentación |
|---|---|---|---|
| **A** | Next.js 16.4.5 · React 19.3.0 · Tailwind 4.3.4 · TypeScript 5.9.3 · Node 24.16.0 | ✅ Completa y auditada (Lighthouse 100 ×4, axe 0 violaciones) | [`version-a/README.md`](version-a/README.md) |
| **B** | Laravel + Blade + jQuery | ⏳ Pendiente | [`version-b/README.md`](version-b/README.md) |

## Por dónde empezar

1. **Evaluar la versión A**: [`version-a/README.md`](version-a/README.md) → instalación, comandos, arquitectura, supuestos, mejoras y resultados.
2. **Decisiones de diseño**: [`docs/DESIGN-SPEC.md`](docs/DESIGN-SPEC.md).
3. **Calidad**: [`docs/AUDIT.md`](docs/AUDIT.md) (accesibilidad y rendimiento con evidencias).
4. **Versión B**: [`docs/HANDOFF-LARAVEL.md`](docs/HANDOFF-LARAVEL.md) es la especificación que debe cumplir.

## Inicio rápido (versión A)

```bash
cd version-a
nvm use            # Node 24.16.0 (.nvmrc)
npm ci
npm run dev        # http://localhost:3000
```

**Despliegue:** _pendiente (Prompt 9)._
