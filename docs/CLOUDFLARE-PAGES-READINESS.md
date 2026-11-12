# Mi Congregación · Auditoría GitHub → Cloudflare Pages

**Fecha:** 2026-11-12. **Estado:** PREPARACIÓN, **NO-GO para crear preview pública, mover DNS o cambiar producción**. Rama: `chore/cloudflare-pages-private-preview-20261112`, base `feat/dev-membership-status-ui-20261028` (PR #18 DRAFT). Decisión Core: `maqdesign/holoteles/docs/ECOSYSTEM-INTEGRATION-CHAT.md` rama `feat/holoteles-app-phase1`, entrada 2026-11-12.

## 1. Inventario observado (solo lectura)

- GitHub: `maqdesign/congregacion`, `main` SHA `8dca8e109a77cc117aa238318c33f96120587fd2`. PR #18 DRAFT rama `feat/dev-membership-status-ui-20261028` SHA previo `05551bdb122cf6bb1b19161a74b42d23bbbb57aa`; PR #4 agenda DRAFT. No fusionar trabajo no revisado en `main`.
- Vercel: proyecto `mi-congregacion`, producción `READY` deployment `dpl_ARUjxKLAfYU6cDqj2R9h6Ju2JNEb`, commit `8dca8e1`, dominio(s) `congregacion.holoteles.app`, `congregation.holoteles.app` y aliases Vercel. Protección SSO habilitada para `all_except_custom_domains`; esto **no** protege por sí mismo los dominios personalizados. No se hizo prueba anónima de esos dominios.
- Cloudflare Pages: cuenta inspeccionada, proyectos `grafo-git`, `servicio-preview`, `mandarinita` y `grafo-qa-temporal`. **No existe proyecto Pages de Mi Congregación**. No se creó ni publicó uno.
- Código: app estática sin `package.json`, sin comando de build; artefacto web es directorio `app/` con `index.html`, JS ESM, manifest, service worker y SVG. `app/vercel.json` contiene headers de Vercel. Los handlers `app/api/dev/membership-status.mjs` y `api/dev/membership-status.mjs` son de estilo Vercel/Node; no se convierten automáticamente en Pages Functions.
- Preparación de Pages en esta rama: `functions/api/dev/membership-status.js` adapta el **mismo** handler `handleMembershipStatus` (solo lectura, `privateAccess:false`); `app/_routes.json` limita Functions a `/api/dev/membership-status`; `tests/cloudflare-pages-hosting.test.mjs` contiene cuatro gates. No hay backend de membresía/aprobación real.
- Configuración Auth: `app/holoteles-auth-config.mjs` apunta a la autoridad Supabase compartida, con clave pública y `allowProduction:false`. `app/account-ui.mjs` usa `location.origin` para signup/recovery y SDK externo ESM; cada URL nueva requiere aprobación explícita en allowlist de redirect de Core antes de probar Auth. **No se modificó Supabase/Auth/RLS**.
- Datos locales: `localStorage` guarda preferencia de idioma y anuncios leídos; `sessionStorage` controla DEV/fixtures. Supabase JS puede persistir sesión bajo `mi-congregacion-holoteles-auth` cuando se habilite. El service worker `mi-congregacion-shell-v7-20261026` guarda solo shell y assets de cuenta, no API ni feeds privados. **Los datos de navegador y la sesión no migran automáticamente entre orígenes Vercel ↔ Pages**.
- Riesgo de seguridad externo: Core P0 person-claim (PR Core #33) no equivale a aprobación para desbloquear Normal. La migración de hosting no modifica ni resuelve ese gate.

## 2. Compatibilidad y build candidato (NO desplegado)

- Producto: **Cloudflare Pages con GitHub integration**, sin GitHub Actions, sin instalación de dependencias y sin nuevos servicios de datos.
- **Root directory:** raíz del repositorio; **framework preset:** None; **build command:** vacío; **build output directory:** `app`. Configurar la **production branch** como `main` solo en un proyecto cuyo primer despliegue esté ya protegido; de lo contrario, no conectarlo.
- Función API: `functions/api/dev/membership-status.js` importa la lógica existente. No publicar esta función sin validar en runtime Pages, incluida respuesta 401 anónima, 405 método inválido y 503 ante backend indisponible; jamás tratar su respuesta como autorización privada.
- `_routes.json` restringe invocaciones Functions al diagnóstico DEV; la entrega de assets estáticos no debe contar como invocación de función. Validar build de Pages y `/api/dev/membership-status` con pruebas reales antes de GO.
- `app/vercel.json` **no es** configuración de Cloudflare. Se añadió `app/_headers` para conservar los encabezados estáticos básicos en Pages; requiere smoke HTTP real en el deployment protegido.

## 3. Privacidad de previews: gate obligatorio antes de crear/compartir

**Cloudflare documenta que los previews Pages son públicos por defecto.** `Enable access policy` protege previews únicas, pero **no necesariamente** el dominio base `<proyecto>.pages.dev` ni custom domains. Para cubrirlos todos hay que configurar Access de forma específica (ver referencias).

**NO crear el proyecto ni conectar Git** si su primer build puede quedar público antes de aplicar Access. Primero obtener un procedimiento comprobable de **protección previa al primer deploy** para `<proyecto>.pages.dev` y `*.<proyecto>.pages.dev`; comprobar política default-deny y que no haya rutas alternativas. Si Cloudflare no ofrece esa garantía mediante la cuenta/herramientas actuales, **NO-GO** y preparar la protección por otra vía segura antes de desplegar.

Pruebas obligatorias antes de compartir URL:
1. Sin sesión: GET/HEAD a URL base, alias de rama, deployment hash y `/api/dev/membership-status` → redirección a Access o 401/403, **nunca HTML/JS/JSON de la app**.
2. Sesión autorizada: carga 200 de `/`, `/manifest.webmanifest`, `/sw.js`, los 15 assets de `SHELL`, y flujo DEV sin revelar datos reales.
3. Intento no autorizado desde otra sesión/dispositivo → bloqueado. Revisar Access app/policy para wildcard y hostname base por separado.
4. Comprobar sin bypass de cache/CDN ni enlaces alternos sin Access. No incluir enlaces a previews en documentación pública hasta PASS.

**No se ha podido verificar bloqueo anónimo porque no existe deployment Pages; por tanto, no hay preview privada para compartir.**

## 4. Callback, privacidad y continuidad de datos

- Mantener `allowProduction:false`; ningún `?dev=1` o fixture habilita Normal privado. No añadir dominios Pages a redirects Auth hasta aprobación Core y pruebas A/B con cuentas ficticias.
- En un cambio de origen, sesiones/localStorage/IndexedDB/service worker son por origen: respaldar o exportar únicamente preferencias no sensibles si se necesita; **no copiar tokens de Auth** ni datos privados del navegador. Evaluar transición con sesión nueva.
- Verificar logout, revocación, expiración de feed, 401/403 y ausencia de cache privado en SW/Pages. Prohibido alojar documentos confidenciales de congregación.

## 5. Rollback y gates

- **Rollback inmediato:** conservar `congregacion.holoteles.app` y `congregation.holoteles.app` en Vercel, sin tocar DNS; no desconectar el proyecto Vercel. Para preview: deshabilitar proyecto/branch Pages o revertir commit sin cambiar el host actual.
- **GO preview privada:** build Pages PASS + Functions PASS + protección de TODOS los hostnames y prueba anónima bloqueada, sin costes.
- **GO producción:** autorización aparte; seguridad Auth/RLS Core, endpoints reales y flujos críticos, callbacks aprobados, QA iPhone/Safari, sesiones y datos por origen, TTL/Cache-Control, restauración y retorno a Vercel ensayados.
- **Estado actual:** compatible para shell estático con adaptación API preparada, **NO-GO para preview/deploy** hasta garantía Access previa al primer build y pruebas runtime. Se ejecutaron **5/5 pruebas Node PASS en un directorio local reconstruido manualmente** con los contenidos del handler, adapter, rutas, headers y test (Node 22.16.0). **No equivale a checkout Git completo ni a ejecución Pages**. No se ejecutaron la suite completa, build Pages, smoke HTTP ni prueba anónima.

## Referencias

- Cloudflare Pages Git integration: https://developers.cloudflare.com/pages/configuration/git-integration/
- Cloudflare Pages build config: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Cloudflare Pages Functions routing: https://developers.cloudflare.com/pages/functions/routing/
- Previews + Access: https://developers.cloudflare.com/pages/configuration/preview-deployments/
- Protección dominio base Pages: https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain

**Responsable siguiente:** Mi Congregación/Codex ejecuta `node --test tests/*.test.mjs`, smoke HTTP estático y QA del adaptador; Cloudflare/Core valida método de protección de previews **antes** de crear el proyecto. Sin cambios Supabase/Auth/RLS, producción, DNS, gastos o GitHub Actions.
