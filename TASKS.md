# Mi Congregación · Tareas activas

Actualizado: 2026-11-12. Rama de hosting `chore/cloudflare-pages-private-preview-20261112`. Continuidad MVP en `feat/dev-membership-status-ui-20261028`, PR #18 DRAFT. La auditoría completa y referencias están en `docs/CLOUDFLARE-PAGES-READINESS.md`.

## MC-HOST-001 · Migración gradual GitHub → Cloudflare Pages

**Estado: EN PREPARACIÓN / PREVIEW NO-GO (privacidad previa no demostrada).**

- [x] Leer decisión Core NEXO 2026-11-12 en `feat/holoteles-app-phase1`.
- [x] Auditar ramas/PR y SHA: `main` = `8dca8e1`; PR #18 DRAFT, base de esta rama `05551bd`.
- [x] Inventariar Vercel: proyecto `mi-congregacion`, último prod READY `dpl_ARUjxKLAfYU6cDqj2R9h6Ju2JNEb`, SSO `all_except_custom_domains`, dominios propios sin cobertura de ese ajuste.
- [x] Inventariar Cloudflare: cuatro proyectos Pages existentes, **ninguno de Mi Congregación**.
- [x] Auditar output estático `app/`, endpoint DEV estilo Vercel, SW/cache, Auth/callback, storage por origen y rollback.
- [x] Preparar adaptador Pages `functions/api/dev/membership-status.js`, rutas acotadas `app/_routes.json` y cinco pruebas Node en `tests/cloudflare-pages-hosting.test.mjs`. **5/5 PASS en copia reconstruida local Node 22; sin QA en checkout/Pages**.
- [x] Preparar `app/_headers` con encabezados estáticos de seguridad equivalentes a Vercel; sin smoke HTTP Pages.
- [ ] Ejecutar suite `node --test tests/*.test.mjs` y smoke local, corregir incompatibilidades sin debilitar seguridad.
- [ ] Demostrar que se puede proteger el hostname base y **todas** las previews Pages **antes del primer deploy**; sin prueba previa no crear Pages ni conectar Git.
- [ ] Configurar proyecto GitHub→Pages solo tras protección confirmada: raíz repo, output `app`, sin build command; rama productiva explícita, sin mover DNS.
- [ ] Comprobar 401/403 o redirección Access desde sesión anónima para hostname base, alias y hash antes de compartir URL.
- [ ] QA Functions, SW, PWA, móvil/desktop, Auth redirects aprobados, aislamiento de datos por origen y rollback; producción solo con autorización independiente.

**Evidencia:** consulta read-only GitHub, Vercel, Cloudflare API y documentación oficial. Sin deploy, preview, prueba HTTP anónima ni gastos en esta ejecución. 5/5 Node PASS solo sobre copia reconstruida de los archivos relevantes; suite completa no ejecutada. **SHAs de evidencia:** adaptador `e708f52902a3087f99be1318fabbd5c9066d5b77`; rutas `61f77d377f5e123eba635375db5a44d514bf5915`; headers `6b37a25d397ae6bffc52e238c791a49ee5a5a8e1`; tests 5 casos `d45df626b9c0b436be98c52f349b6d6559a36de0`; contexto `d7be359b8b76dd625156362a85a20bbba794f5a9`. Verificar HEAD al retomar. Ninguno es un build publicado.

## Bloqueos de integración que NO cambian por hosting

- Core PR #33 / issue #27: P0 de claim-person y gates Auth/RLS pendientes; no habilitar contenido privado Normal.
- Reuniones y Servicio: feeds autorizados no confirmados en runtime; agenda privada permanece cerrada.
- Callback Supabase por origen Pages: requiere decisión Core antes de permitir login real. No editar Supabase compartido.

## Próximo responsable

**Mi Congregación/Codex:** ejecutar pruebas Node y verificar el adaptador en entorno local. **Core/Cloudflare:** resolver protección previa al primer deploy y revisar hostnames. **Propietario:** sin acción inmediata; no solicitar credenciales ni permisos adicionales para la auditoría.


## MC-HOST-002 · Activación real de Pages/Access (2026-11-12)

- [x] Proyecto **Cloudflare Pages creado**: `mi-congregacion-preview` (`mi-congregacion-preview.pages.dev`), conectado por GitHub a `maqdesign/congregacion`, sin GitHub Actions.
- [x] Configurado `production_branch:main` con **production_deployments_enabled:false**; solo previews automáticas de `chore/cloudflare-pages-private-preview-20261112`; output `app`, build vacío.
- [x] **Cloudflare Access creado antes del primer despliegue**: aplicación `df3601f7-18cf-4392-9a8b-a168dff34adb`, hostnames `mi-congregacion-preview.pages.dev` y `*.mi-congregacion-preview.pages.dev`. Reutiliza política existente de propietario `f01794fc-82d3-4e2b-adf2-6760ebc8f9a0` (allow solo identidad del propietario). Sin acceso anónimo autorizado.
- [ ] Esperar deployment de preview de este push y verificar build, funciones y prueba HTTP anónima (Access 302/401/403).
- [ ] Probar como propietario, incluyendo PWA y assets, desde navegador autenticado; no tocar callbacks de Supabase.
- [ ] Conservar Vercel y dominios actuales sin cambios.
- [ ] Suite Node completa en Codex checkout real; pruebas locales aisladas previas 5/5 PASS.

**Esta sección actualiza el NO-GO previo de protección inicial:** el control Access **ya está configurado**, pero falta verificar respuesta HTTP del primer deployment. El nuevo proyecto no reemplaza producción Vercel.
