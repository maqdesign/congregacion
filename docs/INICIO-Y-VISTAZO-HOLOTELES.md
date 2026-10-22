# Mi Congregación · Inicio que importa y Vistazo para Holoteles

**Estado:** propuesta de producto y contrato candidato; la app productiva v0.1 es estática, sin datos de dominio ni Cuenta Holoteles. **Fecha:** 2026-10-22.

## Promesa de los primeros cinco segundos

«Cuando abro Mi Congregación, quiero saber qué actividad viene y qué necesito hacer para participar o prepararme». La prioridad es la congregación concreta del usuario, no un tablero genérico de cifras.

## Inicio nativo: Tablero

1. **Lo siguiente**: actividad próxima de la congregación con título, día/hora y acción de abrir detalles, solo si la fuente publicó información válida y el usuario está autorizado. Si una reunión está en curso, tarjeta flotante minimizable, sin abrir Zoom automáticamente.
2. **Horarios habituales**: reunión entre semana, fin de semana y actividades de predicación vigentes; excepciones claramente separadas. Solo información aprobada, con fecha de vigencia y zona horaria.
3. **Mis asignaciones**: mostrar únicamente cuando la identidad y el registro de persona estén vinculados de forma verificada. No sustituir ausencia de datos por cero ni inventar asignaciones.

La Agenda nativa ofrece calendario y filtros; Yo muestra información propia autorizada. Las tarjetas de Reuniones y Servicio son proyecciones de dominios externos, no copias de sus bases ni nuevas fuentes de verdad.

## Un solo Vistazo candidato para «Mi panorama»

**`mi-congregacion.next-congregation-activity` — «Próxima actividad de mi congregación».**

- **Pregunta:** «¿Qué viene después en mi congregación?»
- **Visual:** fecha, hora, categoría, nombre corto y botón «Abrir en Mi Congregación». Tamaños compact y standard.
- **Fuente:** feed agregado de la próxima actividad ya publicada, de solo lectura; la app Mi Congregación compone el panorama especializado y Core recibe un resumen mínimo, **no** los datos crudos de VMC/Territorios.
- **Estado:** `concept`; no API, no acceso a datos reales, no widget activo.
- **Permiso propuesto:** `mi-congregacion.widget.next-activity.read`; opt-in, revocable, verificación backend de sesión, persona/congregación y alcance en cada lectura.
- **Privacidad:** no incluir nombres, direcciones privadas, participantes, enlaces Zoom, asignaciones personales ni información de terceros. Solo título/fecha/tipo aprobados para el usuario.
- **Estados:** `not-connected`, `permission-required`, `empty`, `ready`, `stale`, `offline`, `error`; no usar ejemplos como datos reales.
- **Evitar duplicación:** si «Mi día» o VMC/Territorios ya muestran el mismo evento, Core puede priorizar un único origen, con vínculo a Mi Congregación para la vista unificada.
- **Deeplink:** `/#tablero` en el dominio oficial validado.

## Por qué no más Vistazos ahora

Reunión en curso, «Mis asignaciones» y próxima salida ya tienen potenciales fuentes directas VMC/Territorios. Publicarlos otra vez desde Mi Congregación crearía redundancia y riesgo de versiones contradictorias. Reevaluar después de probar el flujo real con datos y consentimiento.

## Entrega y responsables

1. **Core:** consumir `contracts/app-registry.v1.json` para la tarjeta del catálogo de apps, usar URL pública e icono `/icon.svg`, estado Beta. No inferir que el registro ya actualizó automáticamente el frontend del Hub.
2. **Mi Congregación:** conservar Tablero/Agenda/Yo, mejorar accesibilidad y vinculación segura, validar iPhone/iPad; no introducir fixtures productivos.
3. **Core + VMC + Territorios:** acordar identidad, eventos publicados, zona horaria, deduplicación, revocación y permisos antes de implementar el Vistazo.
4. **Core:** solo añadir el Vistazo al catálogo visible cuando esté `verified`, exista snapshot validado y pase QA con dos identidades distintas.

**Hosting:** Vercel proyecto `mi-congregacion`; DNS Cloudflare, `congregacion.holoteles.app`; repositorio `maqdesign/congregacion` carpeta `app/`.
