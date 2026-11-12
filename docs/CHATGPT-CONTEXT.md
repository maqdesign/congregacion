# Mi Congregación — Contexto de continuidad ChatGPT

Actualizado: 2026-10-29. Solo estado técnico, sin secretos ni datos personales.

## Regla Retoma
Ante «Retoma» o «Retoma: [tarea]»: leer primero este archivo en la rama indicada, README e instrucciones/tareas existentes del repositorio, documentación de la función y NEXO (maqdesign/holoteles/docs/ECOSYSTEM-INTEGRATION-CHAT.md). Comprobar rama, HEAD, PR, código y pruebas reales. Priorizar la tarea pedida o el siguiente pendiente seguro. Tras avances y antes del handoff, actualizar ESTE archivo, sin duplicarlo. No guardar la conversación completa, contraseñas, datos financieros, miembros ni tokens.

## Estado verificado
- Repositorio: maqdesign/congregacion. main revisado: 8dca8e109a77cc117aa238318c33f96120587fd2 (volver a verificar).
- Rama actual: feat/dev-membership-status-ui-20261028; HEAD previo a este documento: ff449b95c39e193860c82e9f9f39173e92f62403. PR #18 DRAFT: https://github.com/maqdesign/congregacion/pull/18. PR #4 Agenda también abierto.
- Este archivo está solo en la rama de trabajo para evitar un commit a main que pudiera desplegarse. Al retomar buscar expresamente esa rama.
- Mi Congregación se ocupa de UX frontend y QA; Core de Auth/SQL/autoridad/RLS; Servicio de revisión y aprobación; Reuniones de datos autorizados de agenda. Coordinar por NEXO y evitar duplicación.
- Cuenta Holoteles: en Safari iPad se observó identidad DEV verificada y estado no vinculado; NO significa membresía ni acceso privado. Normal privado sigue desactivado.
- PR #18: componente ficticio app/dev-membership-status-ui.mjs, integración exclusiva DEV fixtures en app/dev-ui.mjs y pruebas. Ocho estados: sin vínculo, solicitud pendiente, verificación requerida, rechazo, revocación, aprobado, indisponible, agenda sin permiso. Correcciones: renderMe(f,guided), estado visual según solicitud simulada, y no-permission → permission_limited.
- La rama feat/real-membership-request-20261027 contiene un adaptador RPC no conectado ni desplegado; NO mezclar sin contrato aprobado.
- Core #27 reporta bloqueo P0 en holoteles_verify_person_claim SECURITY DEFINER (retorno temprano antes de autorización). No habilitar solicitudes/aprobaciones reales ni duplicar RPC; Servicio tiene PR #25 draft.

## Pruebas y bloqueos
- V8 sintaxis y pruebas puras de estados PASS. 4/4 pruebas Node originales del componente reportadas PASS en copia textual aislada, NO checkout completo. 3 pruebas funcionales locales adicionales también pasaron pero NO son suite versionada.
- Sin evidencia de ejecutar conjuntamente las pruebas originales tests/dev-invitations.test.mjs y las nuevas tests/dev-membership-ui-integration.test.mjs en checkout. Sin QA DOM, Safari/VoiceOver, build/PWA ni Auth/RLS E2E.
- Executor local anterior tuvo bloqueo DNS de github.com; GitHub connector sí permite lectura/escritura. Validar accesibilidad y escenarios en navegador antes de considerar merge.

## Siguiente pendiente seguro
1. Ejecutar desde checkout: node --test tests/dev-membership-status-ui.test.mjs tests/dev-invitations.test.mjs tests/dev-membership-ui-integration.test.mjs; corregir fallos en rama.
2. QA sección Yo, foco, responsive, VoiceOver y aislamiento DEV fixtures / DEV Auth / Normal. Las pruebas deben comprobar el estado funcional, no solo regex.
3. Mantener PR #18 DRAFT hasta gates; documentar resultados y responsables aquí y en NEXO. Sin merges, deploys, previews, Actions, Supabase, DNS ni gastos no autorizados.

## Prioridad de entrega · 2026-10-29
**Objetivo acordado:** primera versión **usable en producción** cuanto antes; dejar de extender fixtures. Alcance mínimo propuesto: Cuenta Holoteles, solicitud de vinculación con verificación de persona, revisión/aprobación autorizada vía Servicio y agenda autorizada de Reuniones/Servicio. Sin tableros personales ni publicaciones privadas sin contrato de servidor. No es autorización para modificar bases/datos reales.
**Corte de release:** Fase A = pruebas de regresión del shell DEV/Normal y cierre del PR #18 sin activar funciones reales; Fase B = Core corrige claim SECURITY DEFINER, verifica vínculo persona y RLS Auth A/B con dos organizaciones, revocación y backups; Servicio integra revisión y aprobación; Fase C = Mi Congregación consume contratos aprobados y verifica fail-closed, Safari iPad/iPhone y rollback antes de un único pase autorizado. Cada gate debe quedar documentado; NO-GO a Normal privado hasta completarlos.
**Estado de referencia:** 2026-10-29, main `8dca8e109a77cc117aa238318c33f96120587fd2`, rama de trabajo antes de esta actualización `5854eae7e63046357c3293238ccadd33c208ec5e`; PR #18 draft. Nueva coordinación se registra en Holoteles Core #27 y NEXO. Siguiente responsable inmediato: Core/Auth+DB corrige P0; Mi Congregación puede resolver QA aislada de PR #18 en paralelo.

## Avance de QA y entrega · 2026-10-29
- Rama PR #18 HEAD `f49b9250c1e7b7fdc243ee4a5a7ea8251ef4c057`. Se reforzó `tests/dev-membership-status-ui.test.mjs`: ocho estados sin botón real, separación de `permission_limited` vs `rejected`, y etiquetas accesibles sin IDs de título duplicados.
- Se recuperaron de GitHub los cuatro archivos de código implicados y los tres archivos de pruebas originales. En V8 se ejecutaron **14/14 cuerpos de test PASS** mediante un harness equivalente para aserciones síncronas. **No fue `node --test` ni checkout Git íntegro**; se mantiene bloqueo DNS local a github.com. No se probó DOM real, Safari/VoiceOver ni Auth/RLS.
- Próximo paso: executor Codex/QA con checkout ejecuta las tres suites Node y smoke navegador. PR #18 sigue DRAFT, NO-GO para merge/deploy. Core #27 debe confirmar corrección P0 y contrato de vinculación; después conectar MVP con Servicio y Reuniones.

## Core P0 avance · 2026-10-29
Core/ChatGPT auditó por SQL **solo lectura** la función real y confirmó retorno `person_id` antes de `person.claim.review` en `verified`; `authenticated` tiene EXECUTE. Se abrió **Core PR #33 DRAFT** https://github.com/maqdesign/holoteles/pull/33, rama `fix/person-claim-p0-review-20261029`, que endurece el archivo **review-only** existente reutilizando propuesta VMC (sin RPC nueva); 7/7 gates estáticos PASS en V8, NO Node/Postgres/Auth-RLS A/B. **No se ha aplicado SQL a la base**; el P0 sigue activo. Esperar validación backend aislada, aprobación y despliegue autorizado antes de habilitar solicitud/revisión reales. Mi Congregación puede avanzar QA UI sin datos privados.

## QA Core P0 · actualización 2026-10-29
Core PR #33 continúa DRAFT. SQL **review-only** añadió comprobación `membership_account_conflict` para no verificar un claim cuando su membresía de organización pertenece a otra cuenta; 8/8 tests estáticos PASS en V8, **sin Node/Postgres**. Core creó `docs/PERSON-CLAIM-P0-ISOLATED-QA.md` con 16 escenarios A/B y rollback. No existe Postgres aislado accesible en este entorno; no se aplicó SQL a Supabase compartido. Próximo: QA backend aislada por Codex, después autorización explícita de despliegue; Mi Congregación mantiene membresía real y agenda privada OFF.

## Meta autónoma Codex Cloud · 2026-11-06
- El usuario pidió un **goal autónomo** que Codex pueda perseguir sin consultas durante tareas locales reversibles. Instrucciones completas en `docs/AUTONOMOUS-MVP-GOAL.md` y `AGENTS.md`, enlazadas desde README. Rama de continuidad `feat/dev-membership-status-ui-20261028`, PR #18 DRAFT.
- Objetivo: MVP local/DEV comprobable, pruebas Node verdes, QA HTTP/PWA, accesibilidad, estados de cuenta/membresía, agenda autorizada en mocks y Normal cerrado sin backend real. No inventar autorización ni declarar GO de producción.
- Datos de fixture locales pueden regenerarse/borrarse; **Supabase y Core compartidos no son descartables**. No secrets, SQL remoto, despliegue, Actions, preview, merge, otros repos ni gastos.
- Al retomar: inspeccionar git y trabajo previo, seguir AGENTS y la meta, ejecutar tests reales, corregir fallos, registrar SHA y handoff; si falta Core, avanzar en tareas independientes sin preguntar al usuario.

## Hosting · Retoma NEXO Cloudflare Pages · 2026-11-12
- Se leyó decisión Core 2026-11-12 en `maqdesign/holoteles` rama `feat/holoteles-app-phase1`: migración gradual GitHub→Cloudflare Pages **solo hosting**, Supabase/Auth/RLS intactos, sin DNS/producción/Actions/gastos. Reuniones y Mipoki van en pase coordinado posterior.
- Rama de preparación **independiente**: `chore/cloudflare-pages-private-preview-20261112`, base PR #18 `feat/dev-membership-status-ui-20261028`. Archivo canónico de auditoría: `docs/CLOUDFLARE-PAGES-READINESS.md`; cola: `TASKS.md`.
- Inventario: Vercel `mi-congregacion` producción READY `dpl_ARUjxKLAfYU6cDqj2R9h6Ju2JNEb` (main `8dca8e1`); SSO no cubre custom domains. Cloudflare tiene cuatro proyectos Pages, **no Mi Congregación**. App estática `app/` sin build; endpoint Vercel necesita adaptador Pages.
- Preparación de código: `functions/api/dev/membership-status.js` reusa handler DEV read-only, `app/_routes.json` limita Functions a ruta DEV, `app/_headers` replica encabezados estáticos; `tests/cloudflare-pages-hosting.test.mjs` añade 5 gates. **5/5 PASS en Node 22 sobre copia local reconstruida**, NO checkout completo, build Pages ni prueba anónima.
- **PREVIEW NO-GO:** Pages previews públicas por defecto; Access de previews no cubre automáticamente hostname base. No se creó proyecto ni deployment hasta garantizar bloqueo previo de `<proyecto>.pages.dev` y `*.<proyecto>.pages.dev` y verificar visita anónima denegada. No compartir URL inexistente.
- Callbacks de Auth usan `location.origin` y requieren aprobación Core antes de permitir nuevo origen; `allowProduction:false`. `localStorage`, `sessionStorage` y SW son por origen, no se transfieren al pasar Vercel→Pages. Mantener Vercel como rollback sin cambiar DNS.
- Siguiente: Codex ejecutar suite completa y QA adapter; Core/Cloudflare demostrar protección de Pages previa al primer deploy. La integración real sigue sujeta a P0 Core #27/#33.

### Cloudflare Pages — primer preview publicado (2026-11-12)
- Decisión actualizada por usuario: avanzar con el patrón Grafo/Servicio, mantener preview con Access, sin exigir privacidad perfecta del shell ficticio. **No se autorizan datos privados reales, cambios de Supabase/Auth/RLS ni producción.**
- Proyecto Pages `mi-congregacion-preview`, GitHub `maqdesign/congregacion`, output `app`, sin build, `main` prod disabled, previews custom rama `chore/cloudflare-pages-private-preview-20261112`.
- Access app `df3601f7-18cf-4392-9a8b-a168dff34adb` con destinos hostname base + wildcard y política reusable owner `f01794fc-82d3-4e2b-adf2-6760ebc8f9a0` (reutilizada de Grafo). Configuración comprobada por Cloudflare API.
- **Preview deployment SUCCESS:** ID `361c1ca3-4b6e-44c4-bbad-6af39e8f162c`, commit `fbb3b334ac4c60227e427e2e7c9b905f999f356a`; Worker compilado, `_routes.json` aceptado, 1 regla headers, 21 assets. URL `https://361c1ca3.mi-congregacion-preview.pages.dev`; alias `https://chore-cloudflare-pages-priva.mi-congregacion-preview.pages.dev`.
- **NO probado:** HTTP status de visita anónima, flujo autorizado en navegador, runtime del endpoint DEV, PWA Safari, suite Node completa. La herramienta web no pudo abrir las URLs, pero no reportó status. No declarar 302/403 verificado.
- **Siguiente:** QA en navegador autenticado y sin sesión, `node --test tests/*.test.mjs` en Codex Cloud. Sin despliegue a producción. Ver `TASKS.md` y `docs/CLOUDFLARE-PAGES-READINESS.md`.
