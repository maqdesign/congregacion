# Agenda de actividades · Mi Congregación

**Estado:** diseño de interfaz en Figma; sin conexión a datos reales ni despliegue.

## Pantalla móvil

[Figma — Agenda de actividades](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=28-349)

- Marco editable: `28:349`, 390 × 1390 px.
- Marca: instancia vinculada del isotipo original de Mi Congregación.
- Encabezado Holoteles: búsqueda y Cuenta arriba. Navegación inferior: Tablero, Reuniones, Servicio e Informe.
- Filtros visuales: Todos, Reuniones, Para mí. No son interactivos todavía.
- Tarjetas de agenda: reunión de entre semana, mis asignaciones, limpieza, asamblea y visita del superintendente. Cada una muestra categoría, título, estado de información y enlace de detalle.
- Componentes Figma: `28:396`, `28:408`, `28:420`, `28:433`, `28:445` (primera exploración; unificar después en variantes reutilizables).
- Iconos **Lucide Icons (Community)** importados como instancias de componentes reales de Figma: búsqueda, usuario, calendario, reloj, flecha, asignaciones y grupo.
- Estilo: Nunito Sans; navy #182F4B, oro #C7942F, fondo #F7F4F0; sin emojis.

## Reglas de datos

**No se inventan reuniones, fechas, asignaciones, miembros ni lugares.** Las tarjetas muestran expresamente estados pendientes de sincronización, y no deben interpretarse como datos autenticados.

- **Reuniones (VMC)**: programación, asignaciones, discursos y limpieza. Modalidad habitual presencial, con acceso a Zoom condicionado por autorización.
- **Servicio (Territorios)**: reuniones para predicar, horarios y lugares, cuando se incorporen a la agenda.
- **Holoteles Core**: organización canónica, membresía, persona vinculada y permisos explícitos. No vincular por nombre; no exponer datos reservados en un enlace compartido.
- **Eventos**: asambleas y visitas según información aprobada y vigente; prioridad dinámica en Mi Tablero, sin duplicar propiedad de datos.

## Próximo desarrollo

1. Unificar tarjetas como variantes de un componente de agenda con auto-layout y estados: confirmado, pendiente, modificado, cancelado, sin acceso.
2. Diseñar la pantalla de detalle, búsqueda, filtros y calendario; accesibilidad para personas mayores y estados vacíos.
3. Integrar solo contratos autorizados de Reuniones/Servicio/Core; nunca datos de producción como fixtures de diseño.
4. QA visual en dispositivo y revisión de NEXO antes de implementación. Sin Preview, DNS, backend ni gastos.

Referencias: [visión del producto](./PRODUCT-VISION.md), [Mi Tablero](./MI-TABLERO.md), [NEXO](https://github.com/maqdesign/holoteles/blob/main/docs/ECOSYSTEM-INTEGRATION-CHAT.md).
