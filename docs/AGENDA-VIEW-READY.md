# Agenda · presentación preparada (sin conexión real)

La función pura `src/ui/agenda-view-model.mjs` prepara los elementos ya autorizados para Tablero y Agenda: próxima actividad, contadores por día, filtros, fecha seleccionada y estados diferenciados de conexión. No accede a red, cuentas, base de datos ni almacenamiento; no habilita `/api/congregation/agenda`.

Uso futuro: solo después de que Core complete BFF, autenticación y pruebas A/B, pasar `projectAuthorizedFeed(...).items` a `prepareAgendaView({status:"ready",items,...})`. `today` y `nowTime` deben calcularse en la zona horaria validada de la congregación, no asumir la del navegador. Para errores 401/403 usar `forbidden`; fallos de red/servidor `unavailable`; antes de sesión `unlinked`; durante carga `loading`. No convertir errores en `ready` vacío.

El modelo omite asignaciones sin `isMine:true` como defensa visual adicional, pero NO es autorización; el servidor debe filtrar previamente. Renderizar `title` y `place` con `textContent`, nunca `innerHTML`. Los contadores no deben persistirse offline antes de una política explícita de revocación.

Prueba local pendiente de ejecutar en checkout: `node --test tests/agenda-view-model.test.mjs`. No hay despliegue ni fixtures de producción.

## Canal privado de «Mis asignaciones» (23-oct-2026)

Se añadió `src/integrations/own-assignments.mjs` como **proyección pura** del sobre privado que produce Core `server/congregation-own-assignments.mjs`. Requiere organización y persona verificadas en el contexto, comprueba expiración, publicación, fechas, organización, persona, duplicados y clasificación; devuelve solo campos mínimos para UI, sin metadatos extra. No contiene `fetch`, ruta HTTP, almacenamiento ni credenciales; no se conecta a la Agenda general ni autoriza acceso. `tests/own-assignments.test.mjs`: **5/5 PASS** con `node --test` en entorno local aislado usando copia idéntica del módulo; suite completa del repositorio pendiente de checkout.

**Integración futura:** Core debe exponer y verificar un endpoint privado same-origin y definir su URL, con sesión revocable, `congregation.assignments.read_own`, vínculo persona canónica ↔ participante VMC, RLS y QA A/B. Solo entonces cablear la petición privada; jamás mezclar las asignaciones en el feed general ni guardar la respuesta en service worker.
