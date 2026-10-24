# Laboratorio DEV · Mi Congregación

## Cómo abrirlo
- En `https://congregacion.holoteles.app/?dev=1`, o **avatar → Configuración → Modo desarrollo**.
- Selecciona un escenario en **Laboratorio DEV**. Navega entre **Tablero**, **Agenda** y **Yo**.
- Prueba mes anterior/siguiente, fechas, filtros Todo/Reuniones/Servicio/Mis asignaciones, simulación de ingreso/registro/salida, marcar una asignación hecha, añadir una actividad ficticia y Restablecer demo.
- Desactivar desde Configuración o `?dev=0` retira completamente los paneles de demostración del DOM.
- Idioma ES/EN funciona por dominio o Preferencias.

## 13 escenarios de prueba
| ID | Qué verificar |
| --- | --- |
| `full` | Cuenta verificada simulada, agenda publicada, próximas actividades, 3 asignaciones |
| `guest` | Primer acceso, sin cuenta ni datos |
| `unlinked` | Identidad ficticia sin congregación vinculada |
| `no-permission` | Cuenta sin permiso, no filtrar ni mostrar registros |
| `empty` | Conexión válida pero agenda legítimamente vacía |
| `offline` | Estado sin conexión, sin afirmar sincronización |
| `loading` | Estado de carga, sin datos filtrados |
| `cancelled` | Reprogramación y cancelación diferenciadas |
| `no-assignments` | Agenda pública visible, ninguna asignación personal |
| `signup-pending` | Registro ficticio pendiente de confirmar |
| `expired` | Sesión simulada vencida, sin agenda |
| `revoked` | Acceso revocado, sin información privada |
| `error` | Servicio no disponible y estado recuperable |

## Límites de seguridad
- No usa API, Supabase, Firebase ni datos reales; los registros están declarados en `app/dev-fixtures.mjs` y solo se importan al activar DEV.
- No se guarda contenido de actividades: `sessionStorage` conserva únicamente el estado DEV y el identificador del escenario. Las actividades añadidas y las asignaciones marcadas como hechas viven solo en memoria.
- La UI muestra **DEV · FIXTURES** y un banner permanente; las páginas impresas en DEV incluyen la marca **DATOS FICTICIOS**.
- `?dev=1&authTest=1` desactiva fixtures y reserva el modo DEV para pruebas de Auth real, que siguen bloqueadas por `enabled:false` hasta autorización de Core.
- Las actividades ficticias son solo una **simulación visual**; no validan RLS, sesiones reales, publicación ni vinculación a VMC/Servicio.
- Los datos reales de agenda permanecen desconectados hasta que Core apruebe identidad, autorización, vinculación y pruebas A/B.

## Estado de QA y siguiente trabajo
- Parseo JS inline, módulo DEV, módulo de datos y Auth: PASS en V8 aislado.
- Se verificaron los 13 estados, su clasificación y que estados sin autorización devuelven 0 actividades/0 asignaciones: PASS en V8.
- Pruebas Node `tests/dev-fixtures.test.mjs` escritas, ejecución de suite completa pendiente.
- Pendientes: QA de Safari real, navegación por teclado/VoiceOver, conexión del view model compartido a fuentes autorizadas, login real Holoteles, API Core, vínculos y Auth/RLS A/B.
- Siguiente responsable Core: resolver autoridad Auth y endpoints; Mi Congregación/Codex: QA Node, Safari y accesibilidad sin preview ni despliegues de prueba.

## Recorrido de primera cuenta (solo ficticio)
1. Escenario **Visitante sin cuenta** → sección **Yo** → **Crear cuenta ficticia**.
2. Escenario **Registro por confirmar** → **Confirmar correo ficticio** (no se envía correo).
3. Escenario **Cuenta sin congregación** → **Vincular congregación de ejemplo** (no se escribe en servidores).
4. Escenario **Todo conectado** → explora Tablero, Agenda y Mis asignaciones.

Las acciones son reversibles mediante **Simular salida** o **Restablecer demo**. No se solicitan credenciales, nombres ni correos reales. El foco del teclado se mueve al siguiente paso al cambiar el estado, para que el recorrido sea accesible. **No sustituye la validación del registro y autorización reales de Holoteles Core.**
