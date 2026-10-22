# Mi Congregación · Iconografía abierta y próxima integración

**Fecha:** 2026-10-22. **Estado:** implementación visual en rama; no se conectaron datos privados.

## Iconografía

- **Librería:** [Lucide](https://lucide.dev/), proyecto abierto, SVG de línea y trazos consistentes.
- **Distribución:** `app/lucide-icons.svg` contiene símbolos derivados de los archivos oficiales Lucide; `app/LUCIDE-LICENSE.txt` conserva los avisos ISC/MIT pertinentes.
- **Uso:** `<svg class="lucide" aria-hidden="true"><use href="/lucide-icons.svg#calendar-days"></use></svg>`. El icono complementa un texto visible; no reemplaza etiquetas accesibles.
- **Sin CDN ni paquete remoto en tiempo de ejecución.** Funciona desde el mismo origen y no requiere descargas a terceros. Revisar Safari/iOS en QA real.
- **Icono de la aplicación:** `app/icon.svg` es un isotipo de marca, no un icono de interfaz. Sigue siendo temporal hasta que se exporte/valide el isotipo aprobado de Figma; **no** declarar que la marca Figma ya se reemplazó.

## Horarios y Agenda

- `src/domain/agenda.mjs`: funciones puras que expanden horarios con vigencia, excepciones y actividades **ya autorizadas por servidor**.
- `tests/agenda.test.mjs`: 10 pruebas de regresión de fechas, permisos de proyección, excepciones, clasificación y pertenencia. **Se copiaron de la rama previa; falta ejecutar `node --test tests/agenda.test.mjs` en checkout real antes de desplegar datos.**
- `app/index.html` conserva estados honestos vacíos: **no se activa la proyección contra fixtures ni se inventa un endpoint**.
- Para datos reales faltan contratos de identidad y lecturas autenticadas, audiencia de horarios, zona horaria IANA, revocación, publicación y QA de dos usuarios/organizaciones.

## Pendientes por responsables

Solicitudes canónicas en `maqdesign/holoteles/docs/ECOSYSTEM-INTEGRATION-CHAT.md`. No duplicar las fuentes de verdad de Reuniones/VMC ni Servicio/Territorios.
