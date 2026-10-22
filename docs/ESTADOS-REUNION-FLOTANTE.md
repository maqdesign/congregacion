# Estados de reunión flotante · Figma

**Fecha:** 22-oct-2026. **Estado:** diseño editable, sin implementación ni datos reales.

## Diseños

Se creó un **conjunto de componentes con cuatro variantes** en Figma: `34:491`, «Mi Congregación / Reunión flotante · Estados». Cada pantalla utiliza una instancia editable de su variante, con el menú unificado **Tablero / Agenda / Yo**:

| Estado | Pantalla |
|---|---|
| Programada | [Figma · Programada](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=34-492) |
| En curso | [Figma · En curso](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=34-570) |
| Minimizada | [Figma · Minimizada](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=34-650) |
| Finalizada | [Figma · Finalizada](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=34-725) |

Se conserva el [concepto anterior sin Zoom](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=33-580) como estado de permisos. El botón de Zoom en la variante «En curso» es **ilustrativo**: no hay URL real ni conexión funcional.

## Comportamiento esperado

- **Programada**: tarjeta contextual con nombre y acceso a programa; no anunciar «en curso» antes de la hora confirmada.
- **En curso**: tarjeta no bloqueante, con programa y «Unirse por Zoom» solo si existe enlace vigente publicado y el usuario está autorizado. El programa sigue disponible sin Zoom.
- **Minimizada**: píldora persistente, expandible, no cubre la navegación inferior ni campos de formulario; recordar la preferencia local durante esa sesión.
- **Finalizada**: retirar el estado de directo y el acceso contextual a Zoom; permitir consultar el programa si sigue autorizado; no mantener una alerta flotante indefinidamente.
- **Cancelada/reprogramada**: ocultar acciones inválidas, reflejar estado actualizado y respetar excepciones de horario.
- **Offline**: no asegurar que una reunión sigue en curso sin sincronización reciente; nunca exponer enlaces Zoom revocados desde caché.
- **Seguridad**: la comprobación de permisos ocurre en servidor; la congregación, zona horaria, rol y audiencia provienen de Holoteles Core y Reuniones/VMC, no de heurísticas visuales.
- **Accesibilidad**: foco lógico, controles con nombre, contraste adecuado, áreas táctiles cómodas, reducción de movimiento.

## Pendientes de implementación

1. Contrato de estados y programación de reuniones, incluidas excepciones.
2. Autorización de Zoom, enlaces seguros y tratamiento de caducidad/revocación.
3. Comportamiento persistente real (expandir, minimizar, cerrar) y navegación.
4. QA de accesibilidad, offline, reconexión, cambio de horario y roles.

**Sin despliegues, modificaciones de producción, backend ni gastos.** Referencia: [Navegación y reunión en vivo](./NAVEGACION-Y-REUNION-EN-VIVO.md).
