# Cuenta Holoteles · UX, DEV y bloqueo real de autenticación

Fecha: 2026-10-23. Fuente: `maqdesign/holoteles/docs/ACCOUNT-SSO-ONBOARDING-STANDARD.md`, `docs/ECOSYSTEM-SHELL-UX.md`, `docs/HOLOTELES-ID-INTEGRATION-PLAYBOOK.md`.

## Correcciones de interfaz
- `Yo` se reserva para cuenta, identidad y asignaciones; `Acerca de` es diálogo independiente del menú de avatar.
- El idioma inicial depende del host: `congregacion.holoteles.app` → ES; `congregation.holoteles.app` → EN. Preferencia manual guardada **por origen** en navegador; se cambia en Configuración, no en header.
- Los símbolos SVG `search`, `plus` y `bell` faltaban realmente en el sprite; corregidos.
- Se establece fondo crema explícito para evitar superficies transparentes oscuras en ciertos navegadores.
- Acceso de primera vez presenta **Ya tengo cuenta** y **Crear cuenta**, distingue registro, confirmación de correo, membresía y permisos.
- No se muestra formulario de contraseña si la autoridad canónica no está configurada.

## DEV opcional en producción
- Activar en Configuración → Modo desarrollo, o visitar `?dev=1`. Desactivar con la preferencia o `?dev=0`.
- Estado guardado en `sessionStorage`, limitado al navegador/pestaña; **no es un entorno backend aislado** ni un nuevo deployment.
- DEV **no genera fixtures ni permisos**. Las funciones privadas permanecen desactivadas.
- La UI de cuenta puede probarse sin introducir credenciales reales. Para probar login de una cuenta existente se necesita habilitar un cliente Auth canónico y validar retorno/redirect en DEV.

## Adaptador listo, pero NO habilitado
- `app/holoteles-account-adapter.mjs`: `signIn`, `signUp`, `recover`, `getVerifiedUser`, `signOut`, inyección de cliente oficial Supabase Auth. `getUser()` valida identidad contra la autoridad, sin usar un snapshot local como prueba.
- `app/account-ui.mjs`: SDK `@supabase/supabase-js@2.90.0` cargado **solo** cuando se configura Auth; acceso solo en DEV salvo aprobación separada de producción.
- `app/holoteles-auth-config.mjs`: `enabled:false`, `allowProduction:false`, URL/key públicas vacías. **No configurar** service_role, tokens, contraseñas ni secretos en cliente.
- Hasta que Core autorice y entregue configuración pública, origen/redirect allowlist y QA A/B, la UI comunica **conexión pendiente**. No prometer SSO entre subdominios: cada origen tiene sesión separada hasta que exista broker seguro.

## Dependencias exactas de Core (siguiente responsable)
1. Confirmar la **autoridad Supabase Auth canónica** para Holoteles ID y la URL + publishable key pública correcta, sin entregar credenciales privadas.
2. Aprobar redirect allowlist para ambos hosts de Mi Congregación y retorno PWA, con pruebas de creación, login, confirmación, recuperación, logout, expiración y revocación.
3. Verificar si puede usarse SDK ESM externo bajo CSP/offline; si no, empaquetar dependencia local en build.
4. Aportar sesión server-verified, vínculo `HolotelesUserId → HolotelesPersonId`, membresía org y consentimiento; no habilitar Agenda privada antes de gates Auth/RLS A/B.
5. Establecer criterio DEV aislado para usuarios reales: **modo DEV de UI no debe reutilizar datos de producción sin aislamiento/autorización**.
6. Tras QA, autorizar por separado `enabled:true` y `allowProduction:true` y publicar un único release; sin previews ni gastos.

## Pruebas
- Parseo JS inline y módulos: PASS en V8 aislado.
- Íconos SVG referenciados presentes: PASS.
- Adaptador con cliente ficticio inyectado: sign-in, sign-up, recover, sign-out y rechazo de email inválido PASS en V8.
- Tests Node escritos en `tests/account-shell.test.mjs` y `tests/holoteles-account-adapter.test.mjs`, ejecución completa Node y Safari físico pendientes.
- **No se ha probado login real** ni conectado datos de ninguna persona.
