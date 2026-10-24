# Privacidad al cerrar sesión · contrato de acceso

## Regla aprobada de experiencia
Con Auth real habilitado y autorizado por Holoteles Core, Mi Congregación será una aplicación **cerrada por defecto**: sin identidad verificada no aparece el Tablero, Agenda, Yo, notificaciones ni información de congregación. En su lugar aparece una **página de acceso completa** con dos opciones: **Iniciar sesión** y **Crear cuenta**.

Al pulsar **Cerrar sesión**:
1. La interfaz se bloquea **antes** de esperar al proveedor Auth; se retira la navegación y se muestra la página de acceso.
2. Se limpian correo, contraseña, nombre, apellido, identidad visible y los contenedores marcados `data-private-content`.
3. Se emite `mi-congregacion:auth-locked`: futuros adaptadores de Reuniones/Servicio **deben** cancelar solicitudes pendientes, descartar respuestas tardías, vaciar estado en memoria y evitar restaurar datos desde almacenamiento/caché.
4. Se llama a `Holoteles Auth signOut`; si falla, se mantiene la página bloqueada y se informa que **no se pudo confirmar** la salida, sin volver a mostrar contenido privado.
5. Solo una verificación válida de `getUser()` puede desbloquear la interfaz. El cambio `SIGNED_OUT`, la ausencia de usuario, el vencimiento detectado o el fallo de verificación mantienen el bloqueo.

## Estados que deben cubrirse al integrar Core
- Inicio sin sesión, salida manual, sesión vencida, revocación y cambio de usuario → **página de acceso**, cero datos privados.
- Usuario autenticado pero sin congregación/permiso → pantalla de estado sin actividades ni asignaciones privadas; no confundir con agenda vacía.
- Cambio de cuenta en el mismo navegador → datos del usuario anterior purgados **antes** de cargar los del siguiente.
- Solicitud antigua que responde después de salir → descartar por versión de sesión y cancelar el trabajo en curso.
- Atrás, recarga, navegación offline, pestaña restaurada y caché del Service Worker → **nunca** deben reexponer contenido privado.
- El modo DEV de fixtures sigue explícito y aislado. No debe utilizarse como prueba de autorización real.

## Implementación preventiva
- `app/account-privacy-gate.mjs` encapsula el bloqueo y la página de acceso; `app/account-ui.mjs` lo activa **solo cuando** `configAllowed()` autorice Auth. Por ahora `app/holoteles-auth-config.mjs` mantiene `enabled:false` y `allowProduction:false`; por tanto, **la experiencia pública actual no cambia**.
- `app/sw.js` precachea el módulo público de acceso y no almacena respuestas Auth, API o privadas.
- Pruebas `tests/account-privacy-gate.test.mjs` describen el contrato. Se verificó parseo V8 y una simulación del bloqueo/desbloqueo, limpieza, diálogos y botones. **No equivale a QA real de Core/Auth/RLS ni Safari.**
- Antes de activar Auth en producción, Core debe aprobar autoridad, revocación, vinculación, permisos, aislamiento entre cuentas y pruebas Auth/PostgREST/RLS A/B. No habilitar el flag solo por tener la interfaz.
