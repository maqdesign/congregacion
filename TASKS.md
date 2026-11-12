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

**Evidencia:** consulta read-only GitHub, Vercel, Cloudflare API y documentación oficial. Sin deploy, preview, prueba HTTP anónima ni gastos en esta ejecución. 5/5 Node PASS solo sobre copia reconstruida de los archivos relevantes; suite completa no ejecutada. **SHA de preparación:** ver HEAD de esta rama al retomar; no confundir SHA documental con build publicado.

## Bloqueos de integración que NO cambian por hosting

- Core PR #33 / issue #27: P0 de claim-person y gates Auth/RLS pendientes; no habilitar contenido privado Normal.
- Reuniones y Servicio: feeds autorizados no confirmados en runtime; agenda privada permanece cerrada.
- Callback Supabase por origen Pages: requiere decisión Core antes de permitir login real. No editar Supabase compartido.

## Próximo responsable

**Mi Congregación/Codex:** ejecutar pruebas Node y verificar el adaptador en entorno local. **Core/Cloudflare:** resolver protección previa al primer deploy y revisar hostnames. **Propietario:** sin acción inmediata; no solicitar credenciales ni permisos adicionales para la auditoría.
