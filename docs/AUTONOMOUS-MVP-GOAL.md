# Mi Congregación · Meta autónoma de Codex (MVP)

**Fuente de trabajo:** repositorio `maqdesign/congregacion`, rama `feat/dev-membership-status-ui-20261028` (PR #18 DRAFT). Esta meta es un plan operativo; no declara aprobada la integración real con Holoteles Core. **No crear una segunda app, ni un nuevo servicio de identidad.**

## Resultado perseguido

Entregar el **MVP más completo, seguro y comprobable de Mi Congregación**, de forma autónoma, con pruebas verdes, interfaz accesible en móvil y escritorio, PWA funcional, flujo de cuenta/membresía coherente y agenda de lectura; **sin exponer datos privados ni simular que hay backend real cuando no lo hay**. Priorizar un producto usable y entendible sobre más fixtures, demos o documentación ornamental.

La meta tiene dos niveles claramente diferenciados:

1. **MVP local/DEV listo para evaluación**: debe quedar implementado, ejecutable y probado en este repositorio con datos sintéticos, sin dependencias de otros repositorios ni credenciales externas.
2. **MVP Normal conectado y publicable**: únicamente si existen contratos y endpoints reales ya aprobados, probados y seguros en Core, Servicio y Reuniones. Si falta alguno, dejar integración desacoplada y **Normal cerrado a contenido privado**. No fingir GO de producción.

## Fuentes de verdad, por prioridad

1. `AGENTS.md` (este repo) y este documento.
2. `docs/CHATGPT-CONTEXT.md` en esta rama; `README.md`, `docs/PRODUCT-VISION.md`, `docs/PHASE1-CONTRACTS.md`, `docs/AGENDA-INTEGRATION-GATE.md`, `docs/ACCOUNT-ONBOARDING-DEV.md`, `docs/ACCOUNT-SIGNOUT-PRIVACY.md`, `docs/PWA-LIFECYCLE.md`, `docs/BRAND.md`.
3. Código y tests reales; lo observado en ejecución prevalece sobre informes históricos.
4. Contratos Core/Reuniones/Servicio documentados, cuando ya estén disponibles localmente. **No exigir acceder a otros repositorios**; documentar la dependencia y seguir con tareas locales.

No tratar documentación histórica, mocks ni un estado `approved` de fixture como permisos reales.

## Bucle de ejecución sin interrupciones

1. Inspeccionar `git status --short`, rama, HEAD y cambios existentes. Preservar cualquier trabajo previo; no usar `reset --hard`, `clean -fd`, borrar historiales o sobrescribir cambios ajenos. No crear worktree si no se pidió.
2. Ejecutar `node --test tests/*.test.mjs` (Node 24 en onboarding). Registrar cantidad exacta PASS/FAIL/SKIP y exit code. Reparar fallos de código y expectativas obsoletas **sin desactivar pruebas, bajar seguridad, fijar el reloj del sistema o eliminar cobertura**.
3. Continuar por bloques pequeños, cada uno con cambios de código, pruebas de regresión y verificación. Después de cada bloque, reejecutar las pruebas relevantes; periódicamente la suite completa. No detenerse a solicitar permiso ni consultar al usuario por decisiones reversibles y locales: elegir el camino conservador y documentarlo.
4. Revisar la app estática: `python3 -m http.server 8000 --bind 127.0.0.1 --directory /workspace/congregacion/app` (o ruta real del checkout), probar `/`, `/?dev=1`, `/dev-ui.mjs`, `/manifest.webmanifest`, `/sw.js`, `/brand-isotype.svg` y todos los recursos de SHELL; validar 200/JSON y evitar rutas rotas. Si el entorno no permite socket, usar pruebas de archivos equivalentes e informar esa limitación; no crear enlaces localhost públicos.
5. Validar navegación móvil, teclado, foco, contraste, estados vacíos/error, accesibilidad básica, scroll y caché offline sin contenido privado. En DEV, activar modo por menú de avatar, no asumir que `?dev=1` por sí solo concede acceso.
6. Mantener DEV separado de Normal. Probar ocho estados de membresía, aislamiento de organizaciones A/B, rechazo, revocación, sesión caducada, cierre de sesión, borrado de caché privado y respuesta 401/403. **Nunca desbloquear contenido reservado mediante flags, URL, fixtures, datos de cliente, PIN o coincidencias de nombre.**
7. Revisar agenda: estados carga/vacío/error, horarios versionados, excepciones, zona horaria, caducidad de feed, asignaciones solo del `personId` verificado y filtros publicados; no revelar Zoom, informes ni terceros a usuarios sin permiso. Los datos de Reuniones/Servicio solo llegan por backend autenticado y filtrado en servidor cuando exista.
8. Corregir defectos de UX o pruebas que bloqueen MVP; evitar expandir el alcance hacia editor de anuncios, automatizaciones, Meta, roles nuevos o nuevas APIs no aprobadas.
9. Mantener cambios pequeños y reversibles. Crear commits locales por bloque y registrar SHA. Si ya hay permiso de push en la rama de trabajo y no activa despliegues/Actions/previews no deseados, publicar commits en esa misma rama; si no, conservarlos localmente y dejar instrucciones exactas. No merge a `main`.
10. Actualizar `docs/CHATGPT-CONTEXT.md` y un handoff de QA con resultado real, archivos, SHA, comandos, tests, errores y siguiente acción. Si hay tiempo/recursos en la tarea, continuar al siguiente bloque sin esperar una nueva orden.

## Fallos históricos de onboarding (revalidar, no asumir vigentes)

En el onboarding se reportaron 94 tests: 89 PASS y 5 FAIL. Áreas: expectativa CSS de `access-guidance`, guard de generación en `account-privacy-gate`, expectativa antigua de no-desbloqueo en `core-membership-gate`, versión de caché `dev-onboarding` (test v6 vs `sw.js` v7), y reloj de fixture vencido en `authorized-feed` (2026-11-01). Corregir la causa con pruebas temporales deterministas y comportamiento fail-closed, no maquillar resultados. Los números actuales deben salir de la ejecución real.

## Límites no negociables

- Se autoriza **crear, modificar y eliminar solo datos sintéticos locales desechables del entorno de QA**. Aunque la app aún no tenga usuarios finales, **Holoteles Core y Supabase son servicios compartidos**: nunca asumir que sus datos, tablas, usuarios, políticas o sesiones son descartables.
- Sin secretos, tokens privados, datos personales reales ni credenciales de producción; sin SQL remoto, Auth/RLS de producción, DNS, dominios, despliegues, merges, GitHub Actions, previews no autorizados o gastos.
- Sin cambios en otros repositorios. No solicitar conexiones adicionales; si una integración depende de Core/Servicio/Reuniones, dejar contrato, adapter y test de mock verificables y continuar en tareas independientes.
- No desactivar `allowProduction:false` ni habilitar autenticación real sin gates backend y autorización específica.
- No copiar material confidencial de congregación a servicios en línea. Evitar informes reales y datos de terceros en fixtures, logs, errores o service worker.
- No decir `PASS` a algo no ejecutado; distinguir unitarias, integración simulada, HTTP local, navegador real, Safari/iOS y Auth/RLS real.

## Criterios de finalización

**Listo para revisión del MVP local** cuando: (a) `node --test tests/*.test.mjs` termina con 0 FAIL; (b) app y assets esenciales sirven correctamente o hay evidencia de un bloqueo ambiental externo; (c) flujos DEV/membresía/agenda/PWA están cubiertos con tests y UX básica; (d) Normal permanece fail-closed sin backend seguro; (e) se registran commits y handoff reproducible.

**GO para MVP real** solo con QA de Auth/RLS y revocación entre organizaciones, contratos de Core/Servicio/Reuniones aprobados, seguridad de endpoints, revisión de caché, pruebas de dispositivo y autorización expresa para publicar. Si falta cualquier gate, reportar `MVP local PASS / producción NO-GO` con bloqueos específicos y tareas terminadas; **no detener el avance local por ese motivo**.

## Informe final corto

Entregar: rama/HEAD; cambios y commits; `PASS/FAIL/SKIP` reales; qué funciona; qué queda bloqueado externamente; ubicación del handoff y próxima acción autónoma. No pedir permiso para tareas locales reversibles. Si el entorno corta la ejecución por tiempo o cuota, dejar un checkpoint para retomar desde el siguiente bloque sin repetir lo terminado.
