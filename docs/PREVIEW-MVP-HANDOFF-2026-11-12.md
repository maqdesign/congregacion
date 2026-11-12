# Mi Congregación · Handoff MVP / Pages · 2026-11-12

## Estado de la iteración

Rama `chore/cloudflare-pages-private-preview-20261112`, base `4a7bf42de9d993c4622fba2778d1bc73ad0a35bd`. Se conserva el trabajo de PR #18 y se recuperaron selectivamente correcciones locales verificadas de `f51ba53e5d5c396584ab0e1f777e145094aa7ff3`, sin trasladar SQL ni tocar Core en esta iteración. El SHA publicado y deployment se registrarán tras el push.

## Diagnóstico de los cinco fallos históricos

Baseline real de esta rama: **109 casos, 104 PASS / 5 FAIL**; no los 94 del onboarding antiguo. Cuatro expectativas eran obsoletas: selector CSS de acceso, patrón del guard de generación, prohibición antigua de cualquier desbloqueo aunque exista decisión servidor, y versión literal de caché. Se actualizaron conservando/añadiendo pruebas funcionales de barreras y runtime. El quinto era fixture temporal de feed caducado: fechas relativas/controladas y reloj inyectado en pruebas puras, sin modificar reloj del sistema. Se mantiene rechazo exacto al expirar.

## Cambios funcionales y de seguridad

- `app/index.html`, `app/dev-ui.mjs`, `app/dev-membership-status-ui.mjs`: inicio guiado ES/EN, entrada explícita a datos ficticios como invitado, estados honestos, banner sin solapamiento, controles táctiles, foco tras navegación/confirmación y eliminación visual de acción no implementada. Solicitud/rechazo/aprobación son exclusivamente simulaciones rotuladas; volver a Normal cierra el contenido privado.
- `app/account-ui.mjs`, `app/holoteles-auth-config.mjs`: invalidación de operaciones antiguas al cambiar modo, limpieza de credenciales, bloqueo del SDK/Auth compartido en Pages mientras `pagesAuthApproved:false`; `allowProduction:false` conservado.
- `src/domain/agenda.mjs`, `src/integrations/authorized-feed.mjs`: conflictos/ambigüedad cerrados, hora preservada en cambio de lugar, validación estricta de identidad, caducidad, MIME, tamaño UTF-8 y cancelación. Adaptador de agenda no conectado a una API imaginada.
- `app/sw.js`: precache transitivo completo; rechaza redirects y respuestas private/no-store antes de almacenar; no intercepta consultas ni Authorization; actualización opt-in y shell ficticio offline.
- Handlers DEV duplicados idénticos en `api/` y `app/api/`: proveedor indisponible/redirect devuelve 503, no falso cierre de sesión. Fetch upstream manual sin seguir redirect. Adapter Pages añade encabezados de seguridad; static `_headers` añade noindex.
- `app/vercel.json`: desactiva únicamente deployments automáticos de esta rama de preview para evitar duplicar publicación Vercel; configuración de producción intacta.
- Pruebas nuevas de runtime de cuenta/PWA/recursos, Chromium responsive, HTTPS local y workerd en `tests/` y `scripts/`. Sin dependencia añadida al producto.

## Evidencia ejecutada

| Comprobación | Resultado |
| --- | --- |
| `node --test tests/*.test.mjs` | 27 archivos PASS, 0 FAIL / SKIP; exit 0 |
| Misma suite con `--test-isolation=none --test-reporter=tap` | 134 casos PASS, 0 FAIL / SKIP; exit 0 |
| `python3 tests/browser-smoke.py` | 386 comprobaciones PASS, 0 FAIL; 320/390/768/1440px, ES/EN, flujos ficticios, foco, HTTP local; cero requests externos/errores JS |
| `python3 tests/pwa-browser-smoke.py` | 15 PASS; instalación, actualización opt-in y offline; TLS sintético loopback, no QA TLS público |
| `node scripts/qa-pages-runtime.mjs` | 12 PASS con workerd/Miniflare fijado 4.20260730.0; todos los upstream sintéticos, cero Core real |
| `git diff --check`, handlers duplicados | PASS |
| Access/proyecto por API Cloudflare | Configuración verificada: hostname base + wildcard, política propietario sin bypass; main deployments false, solo rama autorizada |
| HTTP remoto anónimo/autenticado, assets/SW/Function servidos | PENDIENTE: proxy del entorno rechaza CONNECT pages.dev con 403; NO es evidencia de 403 de Access. Sin sesión propietaria disponible |
| Safari/iOS real, VoiceOver | PENDIENTE; Chromium responsive no equivale a dispositivos Apple |

Runtime local usa compatibilidad 2026-07-30 por límite de la versión instalada; Pages está configurado 2026-11-12. El build real y su SHA deben verificarse por API, no inferirse del runtime local. Reproducción de workerd: instalar `miniflare@4.20260730.0` en scratch externo al repo y pasar ruta `dist/src/index.js` al script. Los servidores locales se describen en AGENTS y `scripts/qa-https-server.py`.

## Contratos / producción NO-GO

NEXO revisado en rama Core `feat/holoteles-app-phase1` el 2026-11-12: decisión de hosting, sin contratos nuevos aprobados de solicitud/revisión/feed. No conectar RPC review-only ni habilitar agenda privada. Core candidato local `57569f8`, revalidado en `17e58ea`: 8 Node/18 SQL/24 Auth-RLS PASS en esquema parcial aislado; no aplicado ni revisado independientemente. No acredita corrección compartida del P0.

Antes de activar privado: Core revisa SECURITY DEFINER/sesión/ACL y esquema/consumidores, aplica solo con autorización separada, confirma QA real A/B y revocación; Servicio aprueba solicitud/revisión/retiro/rechazo; Reuniones/Servicio publican contrato de agenda filtrada; Core aprueba callbacks/origen; QA verifica Access con/sin sesión, caché, Safari/VoiceOver y rollback. Producción NO-GO.

## Continuidad

No repetir las suites Core ya completadas. Mantener la rama actual y commits de preview; no usar main. Comprobar SHA remoto y logs antes de repetir un push. Para pruebas remotas usar entorno que permita pages.dev y una sesión autorizada legítima; no alterar Access, crear bypass ni simular identidad propietaria. Versiones históricas de este documento y TASKS no sustituyen la evidencia más reciente.
