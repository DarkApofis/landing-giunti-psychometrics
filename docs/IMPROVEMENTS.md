# Mejoras sobre la consigna

Cada mejora incluye su justificación, para trasladarla al README.

| # | Mejora | Justificación |
|---|---|---|
| M1 | Carrito funcional: drawer `<dialog>`, cantidades, subtotal, ahorro y persistencia en localStorage | Convierte “Aggiungi al carrello” en un flujo real y verificable. `<dialog>` aporta trampa de foco y Esc de forma nativa y accesible. |
| M2 | Filtro en la URL (`?categoria=`) y enlaces del nav que aplican el filtro | Deep linking, botón atrás predecible y enlaces compartibles. |
| M3 | Contador de resultados en `aria-live` y estado vacío con “Azzera filtri” | Feedback para todos los usuarios; evita quedarse en un callejón sin salida. |
| M4 | Chip de descuento (−20 %) e información de ahorro en el carrito | Refuerza la jerarquía del precio que la prueba valora. |
| M5 | Badge de formato con icono + color + texto | No depende solo del color (WCAG 1.4.1) y se escanea más rápido. |
| M6 | Búsqueda que ignora acentos, mayúsculas y puntuación, y encuentra las siglas con o sin guion (“neuraq” → NEURA-Q) | En italiano “età”/“eta” deben coincidir; las siglas se teclean de muchas formas. |
| M7 | Hero sin foto (gradiente + SVG) | LCP en texto, menos bytes y mejor Performance. |
| M8 | Foco en el primer campo inválido y panel de éxito con foco gestionado | Recuperación de errores accesible. |
| M9 | **Más información en la card**, con campos de datos propios: **tests** → `qualification` (Qualifica A/B/C: nivel profesional necesario para comprarlo) y `administrationMinutes` (tiempo de aplicación); **cursos** → `durationHours`, `ecmCredits` (crediti ECM, `null` si el curso no está acreditado) y `location` (ciudad si es presencial) | Es lo primero que necesita saber un profesional para decidir: si puede comprar el test, cuánto dura la aplicación y si el curso da créditos ECM obligatorios. Evita abrir una ficha de detalle. |
| M10 | `remotePatterns` restringido a la query exacta de Unsplash | El optimizador de imágenes no puede usarse como proxy abierto ni para generar variantes arbitrarias (abuso de CPU). |
| M11 | Ficha de detalle (`<dialog>` nativo) para los tests, con la cualificación A/B/C explicada antes de comprar | Evita compras que el profesional no podría usar; el `<dialog>` modal aporta trampa de foco, Esc y fondo inerte de forma nativa; el foco vuelve al botón de origen. |
| M12 | Conteos por pill que reflejan la búsqueda (“Formazione 4”) | El usuario sabe cuántos resultados hay en cada área antes de hacer clic. |
| M13 | `ProductCard` memoizada, **con medición** | Un test cuenta los renders: sin `memo`, cada tecla en el buscador re-renderiza las 12 cards; con `memo`, 0 (las cards visibles reciben las mismas props y un callback estable). |
| M14 | Enlaces “Test”/“Formazione” del nav y CTA “Scopri la formazione” que aplican el filtro | Atajos reales al contenido que se busca, sin recargar la página. |
