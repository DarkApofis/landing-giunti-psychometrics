# Mejoras sobre la consigna

Cada mejora incluye su justificación, para trasladarla al README.

| # | Mejora | Justificación |
|---|---|---|
| M1 | Carrito funcional: drawer `<dialog>`, cantidades, subtotal, ahorro y persistencia en localStorage | Convierte “Aggiungi al carrello” en un flujo real y verificable. `<dialog>` aporta trampa de foco y Esc de forma nativa y accesible. |
| M2 | Filtro en la URL (`?categoria=`) y enlaces del nav que aplican el filtro | Deep linking, botón atrás predecible y enlaces compartibles. |
| M3 | Contador de resultados en `aria-live` y estado vacío con “Azzera filtri” | Feedback para todos los usuarios; evita quedarse en un callejón sin salida. |
| M4 | Chip de descuento (−20 %) e información de ahorro en el carrito | Refuerza la jerarquía del precio que la prueba valora. |
| M5 | Badge de formato con icono + color + texto | No depende solo del color (WCAG 1.4.1) y se escanea más rápido. |
| M6 | Búsqueda que ignora acentos y mayúsculas | En italiano “età”/“eta” deben coincidir. |
| M7 | Hero sin foto (gradiente + SVG) | LCP en texto, menos bytes y mejor Performance. |
| M8 | Foco en el primer campo inválido y panel de éxito con foco gestionado | Recuperación de errores accesible. |
