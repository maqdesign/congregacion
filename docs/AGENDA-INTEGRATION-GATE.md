# Mi Congregación · Adaptador de Agenda entre aplicaciones

**Estado (2026-10-22): PREPARADO, NO CONECTADO.** Este repositorio no contiene todavía endpoint de backend, token compartido, sesión central ni datos reales. No usar fixtures en producción.

## Lo implementado

`src/integrations/authorized-feed.mjs` acepta únicamente `GET /api/congregation/agenda?from=YYYY-MM-DD&to=YYYY-MM-DD` en el **mismo origen**. Rechaza URLs externas, HTML en lugar de JSON, 401/403, respuestas grandes, snapshots vencidos, membresías no activas, otra organización, datos confidenciales, borradores, publicación futura, excepciones de otro productor y zonas horarias inválidas. Solicita `credentials:same-origin`, `cache:no-store`, sin IDs personales en URL. Usa `src/domain/agenda.mjs` para expandir horarios y filtrar asignaciones de la persona vinculada.

**Importante:** ningún filtro del navegador concede permiso. El backend debe verificar token/sesión real y membresía contra la autoridad, no confiar en el `context` del cliente, ni en `deliveredByAuthorizedEndpoint` (marcador de adaptación). La app no llama el endpoint hasta que Core confirme autorización, proveedor y despliegue. No insertar URL privada, Zoom ni credenciales en HTML.

## Respuesta candidata, NO API existente

```json
{
  "schemaVersion": 1,
  "state": "published",
  "organizationId": "<id canónico verificado>",
  "timeZone": "America/Santo_Domingo",
  "generatedAt": "<ISO UTC>",
  "expiresAt": "<ISO UTC posterior>",
  "schedules": [],
  "exceptions": [],
  "activities": []
}
```

El servidor llena los arrays **únicamente** con eventos de Reuniones/Servicio ya publicados, permitidos para la organización y usuario, con `publicationStatus:published`, `classification:non_confidential`, `publishedAt`, `sourceApp`, `organizationId` y `deliveredByAuthorizedEndpoint:true`. Los eventos de `asignaciones` requieren `personId` explícitamente verificado y `personalDelivery:true`, y nunca incluyen otros participantes.

**No aceptar este formato como decisión definitiva** hasta que Core, Reuniones y Servicio respondan en NEXO. No hay servidor ni escritura.

## QA

- Pruebas: `tests/authorized-feed.test.mjs` (9 casos) y `tests/agenda.test.mjs` (10 casos).
- Se ejecutaron **10 comprobaciones focales del módulo en JavaScript aislado** (10/10), no Node; `node --test tests/*.test.mjs` y pruebas reales Auth/RLS aún pendientes.
- Antes de GO real: dos sesiones/organizaciones sintéticas, aislamiento y revocación backend, respuestas con `Cache-Control:no-store`, expiración, validación de TZ y cambios excepcionales, QA iPhone/iPad, no secretos en service worker.

## Responsables

**Core:** especificar endpoint y claims verificables por servidor, scopes y organización. **Reuniones:** publicar feed versionado de reuniones y asignaciones autorizadas. **Servicio:** publicar feed de salidas autorizadas cuando TR-077 no esté en riesgo. **Mi Congregación:** conectar el frontend al endpoint operativo y ejecutar pruebas de integración; **no simular éxito de sincronización**.
