# Mi Congregación — primera fase funcional (candidato, no contrato Core adoptado)

**Estado:** implementación local pura y pruebas de regresión pendientes de ejecutar en un checkout. Rama `feat/phase1-contracts-agenda`. No backend, endpoints nuevos, Auth real, migraciones, datos reales, producción ni despliegue.

## Hallazgos al revisar repositorios y NEXO (22-oct-2026)

- **Core**: `docs/CONGREGATION-DOMAINS.md` ya es modelo canónico adoptado: `HolotelesOrganizationId`, `OrganizationMembership`, vínculo `HolotelesUserId → HolotelesPersonId` explícito, grupos y capabilities por ámbito. No duplicarlo ni crear membresías desde Mi Congregación.
- **Reuniones (VMC)**: propietario de programas, asignaciones, horarios de reuniones, limpieza y modalidad/Zoom. Su `docs/CURRENT-STATE.md` incluye estados históricos y validaciones parciales; no inferir que su API de agenda exista.
- **Servicio (Territorios)**: propietario de salidas al ministerio. `docs/AI-TASK.md` está **IN_PROGRESS TR-077** sobre conciliación local↔Cloud; no tocar ese repositorio ni activar flujos que afecten su sincronización.
- **Mi Congregación**: documentación y Figma, sin `package.json` ni backend propio. Esta fase agrega **solo lógica de proyección sin dependencias**, sin cambiar las otras apps.
- **NEXO**: autorización editorial/delegaciones y clasificación de datos aún son propuestas pendientes de revisión Core. No declarar aprobados flujos ni asumir permiso general para almacenamiento online.

## Contrato candidato de lectura (NO endpoint operativo)

La app consumidora debe recibir datos de un **endpoint autenticado que ya aplicó filtros de servidor**. `deliveredByAuthorizedEndpoint` es un marcador del adaptador para impedir proyección accidental de datos no validados; **no constituye autenticación ni defensa frente a un cliente malicioso**. La única barrera de seguridad es la verificación del backend productor/Core, incluida audiencia, revocación y clasificación.

Contexto mínimo: `authenticated: true`, `membership: {organizationId, status:'active'}`, `verifiedPersonId` opcional y explícitamente verificado. No se compara por nombres, correos ni coincidencias aproximadas.

Registros de horarios: `id`, `seriesId`, `organizationId`, `sourceApp: reuniones|servicio`, `category`, `effectiveFrom` (fecha local), `effectiveTo` (exclusiva), `weekdays` (lunes=1), `time` (hora local), `title`, `place`, `publicationStatus:'published'`, `publishedAt`, `classification:'non_confidential'`, `deliveredByAuthorizedEndpoint:true`. La **zona horaria IANA debe venir del contrato productor** antes de conectar eventos reales; en este incremento no se convierten horas a UTC.

Excepciones: `scheduleId`, `date`, `kind:'cancelled'|'changed'`, `time` y `place` opcionales en cambios; publicación y audiencia idénticas. Si existen dos excepciones o dos versiones con misma vigencia, se omite el horario ambiguo en lugar de adivinar.

Actividades: `id`, `sourceId`, `organizationId`, `sourceApp`, `category`, `date`, `time`, `title`, `place`, metadatos de publicación y autorización; las asignaciones privadas llevan `personId` verificado y `personalDelivery:true`. **No incluir datos de terceros en la entrega de «mis asignaciones»**. Clasificar informes y datos personales por separado antes de su uso online.

Filtros UI: `todo`, `reuniones`, `servicio`, `mis_asignaciones`. Eventos y limpieza aparecen en Todo. El calendario puede consultar meses/años por ventanas de hasta 367 días; no existe límite artificial a años futuros mientras el productor publique eventos válidos. La tarjeta del Tablero toma exclusivamente la versión vigente para el día consultado. La regla de primer lunes de enero **no se calcula ni impone**: los responsables publican `effectiveFrom`.

## Funciones locales

- `validDate`: valida fechas de calendario.
- `expandPublishedSchedules`: expande recurrencias semanales versionadas con excepciones publicadas.
- `currentSchedule`: horario vigente para una fecha.
- `projectAgenda`: filtra actividades ya autorizadas y asignaciones de la persona verificada.

Ejecutar en un checkout de la rama: `node --test tests/agenda.test.mjs` (Node >=18). **No se afirma PASS sin ejecución real**.

## Gates y siguientes responsables

1. **Core**: confirmar modelo de permisos por audiencia, delegación y clasificación de horarios/anuncios, formato de entregas y revocación.
2. **Reuniones**: definir API de lectura de horarios, asignaciones, limpieza y Zoom con publicaciones versionadas y cambios.
3. **Servicio**: definir API de salidas y asignaciones propias sin interferir con TR-077.
4. **Mi Congregación**: cuando existan APIs seguras, implementar adaptadores y validaciones autenticadas; QA offline/roles/horarios y vista móvil antes de producción.

No publicar enlaces Zoom en fixtures, caché compartida ni respuestas no autorizadas. No activar preview ni CI; no generar gastos.
