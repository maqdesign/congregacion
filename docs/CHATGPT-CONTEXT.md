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
