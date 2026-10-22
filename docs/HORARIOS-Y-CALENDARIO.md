# Horarios habituales y calendario de Agenda

**Estado:** propuestas de interfaz, sin datos reales, autorización publicada ni conexión de backend.

## Diseños Figma (22-oct-2026)

- [Mi Tablero — horarios habituales compactos](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=31-374): pantalla conceptual de 390×890 px.
- [Agenda — calendario por mes, lista y año](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=31-448): pantalla conceptual de 390×1050 px.

Ambos diseños reutilizan instancia de la marca aprobada y componentes Lucide importados de biblioteca Figma. **Los controles dibujados aún no funcionan** y el calendario de enero de 2027 es una vista ilustrativa, no un programa congregacional confirmado.

## Decisiones de producto

- Navegación principal propuesta: **Tablero / Agenda / Yo**; búsqueda y Cuenta Holoteles arriba. Reuniones, Servicio e Informe siguen siendo dominios de origen, no necesariamente pestañas inferiores.
- **Tablero**: bloque permanente y compacto «Horarios habituales»: días, horas y lugares habituales de reuniones y salidas al ministerio. Los cambios excepcionales se destacan aparte para evitar confundirlos con el horario fijo.
- **Agenda**: calendario navegable por mes y año y vista de lista, con filtros Todo / Reuniones / Servicio / Mis asignaciones; eventos futuros visibles según permisos, sin imponer un horizonte artificial.
- **Yo**: informe personal y participaciones propias, incluidas asignaciones de reuniones, conducción de salidas al ministerio, enseñanza, limpieza y otras responsabilidades **solo cuando aplican**.
- Cada tarjeta debe informar lo esencial sin entrar: **qué, cuándo, dónde, participación propia, estado**. Al abrir se ven detalles.
- **Horarios de años posteriores**: almacenar versiones con `effectiveFrom`/`effectiveTo`, origen, aprobación, audiencia y fecha de publicación. Mostrar anuncio «Nuevo horario a partir de ...» solo cuando esté publicado por el coordinador o delegado autorizado; no sustituir el horario actual antes de su fecha efectiva. Las excepciones temporales no borran el horario recurrente.
- La regla de «primer lunes de enero» puede ser una **fecha efectiva propuesta por los responsables**, no un cálculo universal impuesto por la aplicación. No publicar sin confirmación.
- Los eventos (p. ej. visita del superintendente en enero) solo aparecen con fechas y detalles si hay información autorizada. Permitir información parcial confirmada y señalar los campos pendientes sin inventarlos.
- **Fuentes**: Reuniones (programas y limpieza), Servicio (salidas al ministerio), Holoteles Core (congregación, membresía y permisos), eventos aprobados. Control de acceso real en servidor, no solo ocultación visual.

## Próximas tareas

1. Acordar contrato de horarios recurrentes/versionados y eventos, con vigencia y aprobación.
2. Crear componente de horario compacto y estados: vigente, cambio futuro aprobado, excepción, sin información, cancelación.
3. Convertir calendario de concepto en vista navegable con filtros y detalle; validar accesibilidad móvil.
4. Conectar contratos cuando sean seguros y estén autorizados. **Sin despliegue, Preview, cambios de DNS ni gastos.**

Referencias: [PRODUCT-VISION](./PRODUCT-VISION.md), [AGENDA-ACTIVIDADES](./AGENDA-ACTIVIDADES.md), [NEXO](https://github.com/maqdesign/holoteles/blob/main/docs/ECOSYSTEM-INTEGRATION-CHAT.md).
