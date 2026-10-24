# PWA · conexión, versión nueva y caché público

## Comportamiento
- Se instala `/sw.js` en HTTPS. La caché contiene **solo recursos estáticos públicos**: shell, manifiesto, iconos, módulos de interfaz y fixtures sintéticos. No almacena API, tokens, sesiones, contraseñas, asignaciones reales ni respuestas de endpoints.
- Navegación de `/` o `/index.html`: **red primero**; si falla, se abre la última interfaz pública almacenada. Los módulos de demo pueden funcionar sin conexión si ya se instalaron.
- El aviso **Sin conexión** no afirma que los datos estén sincronizados. Al regresar Internet, aparece **Conexión restablecida** y se aclara que no se sincronizó información.
- Cuando se instala una versión nueva, se presenta **Actualizar ahora**. No se llama `skipWaiting()` al instalar: el usuario decide cuándo activar la versión. Solo entonces se recarga.
- Se comprueban actualizaciones al volver a la pestaña; no se hace polling continuo.
- El cambio de idioma en Configuración se refleja en los avisos. La app usa el idioma por dominio si no hay preferencia manual.

## QA y límites
- Prueba V8 con service worker simulado: parseo PASS, instalación de 12 recursos públicos PASS, no intercepción de ruta privada PASS, fallback offline `/index.html` PASS, no activación automática PASS, activación tras mensaje del usuario PASS.
- `tests/pwa-shell.test.mjs` y prueba anterior `tests/account-shell.test.mjs` actualizada; ejecución Node completa y Safari físico pendientes.
- **No es una PWA de sincronización offline**. La agenda privada, el login, permisos y la sincronización siguen pendientes de Core. El modo DEV sí permite explorar datos ficticios sin red.
- Futuras versiones deben actualizar el identificador `CACHE` de `app/sw.js` cuando cambie el shell; sin ello el cache-first de recursos estáticos conservaría archivos antiguos.
- No almacenar jamás endpoints Auth/PostgREST ni datos de cuentas en el worker. Antes de habilitar Auth real, revisar CSP, sesiones y comportamiento offline.
