# Supuestos

Decisiones tomadas ante ambigüedades de la consigna. Cada una puede revertirse.

| # | Tema | Supuesto | Motivo |
|---|---|---|---|
| A1 | Carrito | El botón de la card es “Aggiungi al carrello” y añade a un carrito real en el cliente (drawer y localStorage). No hay checkout. | Confirmado con el usuario; ver IMPROVEMENTS. |
| A2 | Navegación | “Test” y “Formazione” llevan a `#catalogo` con el filtro aplicado (`?categoria=` en la URL). “Contatti” lleva a `#contatti`. “Risorse” lleva a la columna Risorse del footer (`#risorse`). | No hay una sección Risorse en la consigna. |
| A3 | Categoría ≠ formato | Las categorías son áreas temáticas (Valutazione cognitiva, Età evolutiva, Clinica e personalità, Formazione). El formato (Cartaceo, Digitale, Corso online, In presenza) es otro eje y se muestra en el badge. | La consigna pide los dos. |
| A4 | Imágenes | Las fotos de Unsplash se descargan a `/shared/images` y se sirven en local, con créditos en `docs/CREDITS.md`. | Rendimiento, estabilidad y las mismas imágenes en version-b. |
| A5 | Carpeta `/shared` | Se añade `/shared` en la raíz (tokens, fuentes, imágenes, datos JSON) además de `/version-a`, `/version-b` y `/docs`. | Paridad visual sin duplicar. |
| A6 | Precios | Precios en EUR con IVA incluida. Algunos productos no tienen descuento y muestran un solo precio. | Realismo. |
| A7 | Búsqueda | Filtra por nombre (lo exigido). Ignora mayúsculas y acentos. | Consigna. |
| A8 | Accedi | Solo visual: un botón sin acción, sin modal. | Consigna. |
| A9 | LCP | El LCP es el h1 del hero (texto). Ninguna imagen lleva `priority`, salvo que las mediciones muestren que una imagen de la primera fila es el LCP; en ese caso, solo esa. | “priority solo en la imagen LCP”. |
| A10 | Tests | Vitest + Testing Library (unitarios y de componentes) y Playwright + axe-core (e2e y capturas en 375/768/1280). | Por defecto, aceptado. |
| A11 | Lighthouse | Se mide en local sobre el build de producción (`next build && next start`), sin deploy. | Por defecto, aceptado. |
| A12 | Git | `git init` en la raíz y un commit por tarea verificada. El remoto de GitHub se crea al final, previa confirmación. Commits en inglés (Conventional Commits). | Por defecto, aceptado. |
| A13 | Fechas | Las fechas de los cursos se muestran en formato italiano largo-abreviado (“12 gen 2027”) con `<time dateTime>`. | Legibilidad. |
| A15 | Subcarpetas extra | Además de `components/{ui,layout,sections}` se añaden `components/providers/` (contextos cliente) y `src/hooks/`. | Los providers no son UI ni sección; mezclarlos con `layout/` ensucia la intención. |
| A16 | Nombre del doc de diseño | El “DESIGN-SPEC.md” de los prompts es `docs/DESIGN-SPEC.md` (renombrado desde `DESIGN.md`). | Coherencia con los prompts. |
| A17 | Formateo | Precio y fecha con un formateador propio y determinista (sin `Intl`), con tests. | Evita diferencias de ICU entre servidor y navegador (riesgo R2 de PLAN). |
| A18 | Formulario | El envío simula ~600 ms de “Invio in corso…” antes del éxito. | No hay backend; da feedback de carga realista. |
| A14 | PHP | PHP no está instalado en la máquina: hay que resolverlo antes de empezar version-b. | Detectado el 2026-11-03. |
