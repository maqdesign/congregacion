# Codex · Mi Congregación

Este repositorio tiene una **meta autónoma vigente**: leer y ejecutar `docs/AUTONOMOUS-MVP-GOAL.md`. Antes de modificar código, leer también `docs/CHATGPT-CONTEXT.md` y `README.md`. Si los archivos faltan en el checkout, verificar rama y remotos; la rama de continuidad es `feat/dev-membership-status-ui-20261028`, no `main` ni una rama `work` desactualizada. No descartar cambios locales.

## Cómo trabajar
- **Objetivo:** llevar Mi Congregación al MVP local/DEV verificable, luego dejar la integración real preparada solo hasta donde existan contratos seguros. Continuar por iteraciones autónomas dentro de la misma tarea, sin pedir decisiones triviales al usuario.
- **Entorno:** checkout existente de Codex Cloud; Node 24 y Python 3. No hay `package.json` ni instalación de dependencias requerida. No crear worktrees innecesarios.
- **Tests:** `node --test tests/*.test.mjs`; investigar fallos reales y corregir causas sin ocultar resultados.
- **Servidor local:** `python3 -m http.server 8000 --bind 127.0.0.1 --directory app` desde la raíz del checkout; probar rutas y recursos del service worker. Solo datos ficticios.
- **Fuente de seguridad:** Core Holoteles es autoridad de identidad/membresía; Servicio administra solicitudes; Reuniones publica agenda. No inventar autorización en el frontend. El bloqueo P0 Core #27 / PR #33 impide aprobar acceso real sin QA y autorización separada.
- **Cambios:** solo este repo y rama de trabajo; commits pequeños, tests y handoff actualizado. No modificar producción, Supabase compartido, otros repositorios, DNS, Actions, previews, merges o gastos. No usar secretos ni datos de miembros reales. Los fixtures locales son descartables; los servicios compartidos NO.
- **Estado de entrega:** distinguir MVP local listo de producción NO-GO. Continuar con tareas locales independientes si una integración externa está bloqueada.

Para detalles, prioridades, casos de prueba y criterios de salida, **seguir el documento completo `docs/AUTONOMOUS-MVP-GOAL.md`**. No duplicar aquí el protocolo.
