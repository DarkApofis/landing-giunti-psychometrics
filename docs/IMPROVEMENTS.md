# Mejoras sobre la consigna

Cada mejora incluye su justificación, para trasladarla al README.

| # | Mejora | Justificación |
|---|---|---|
| M1 | **Mini-carrito** (implementado el 2026-11-04): contador en el header con `aria-live` (“1 articolo nel carrello”), drawer `<dialog>` modal con cantidades, subtotal y ahorro en formato italiano, quitar línea, vaciar, “Procedi all’ordine” solo visual, persistencia en localStorage | Convierte “Aggiungi al carrello” en un flujo real y verificable. Store mínimo (`useReducer` + context, sin librerías): una sola lista no justifica Redux/Zustand. `<dialog>` aporta `aria-modal`, fondo inerte y Esc de forma nativa; el hook `useModalDialog` añade trampa de Tab, clic fuera y retorno del foco. |
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
| M15 | Mensajes de error concretos (“ne mancano 6 caratteri”, ejemplo de email válido) y textos de ayuda visibles | El usuario sabe exactamente qué corregir; los textos de ayuda evitan el error antes de que ocurra. |
| M16 | Resumen de errores + foco en el primer campo inválido + revalidación en vivo solo tras el primer intento | No se muestran errores prematuros mientras se escribe por primera vez; tras el primer intento, el feedback es inmediato. |
| M17 | Página 404 en italiano para las rutas institucionales del footer | Ningún enlace lleva a una página rota sin explicación. |
| M18 | Dinero en **céntimos enteros** (`toCents` con normalización de ruido binario) | `19,99 × 3` en coma flotante da `59.97000000000001`; `1.005 × 100` da `100.4999…`. Con céntimos los totales son exactos (tests de TDD). |
| M19 | **Persistencia defensiva**: `try/catch` en todo acceso a localStorage, lectura que descarta JSON corrupto, ids desconocidos y cantidades inválidas, versión en el formato, sincronización entre pestañas (`storage`) | El carrito funciona aunque el almacenamiento esté bloqueado o lleno (probado con un `localStorage` que lanza excepciones) y nunca rompe por datos viejos o manipulados. |
| M20 | **Sin errores de hidratación**: SSR y primer render siempre con el carrito vacío; se restaura tras el montaje; el badge es absoluto (sin CLS) y la restauración **no** se anuncia | Evita el desajuste servidor/cliente típico de localStorage; el lector de pantalla solo anuncia cambios reales. |
| M21 | Gestión del foco en el drawer: al quitar una línea el foco pasa a la siguiente (o a la anterior, o a “Scopri i corsi” si queda vacío); “−” usa `aria-disabled` en 1 para no perder el foco | El usuario de teclado nunca se queda “en el vacío” (`<body>`). |
| M22 | Diálogo de los tests con “Richiedi informazioni” en lugar de compra directa | Los tests requieren verificar la cualificación A/B/C; los cursos sí se compran desde el carrito. |
