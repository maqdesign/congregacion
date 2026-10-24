# Adopción del shell Holoteles — Mi Congregación

Fuente canónica: `maqdesign/holoteles/docs/ECOSYSTEM-SHELL-UX.md`.
El patrón común es **estructural**, no impone la identidad visual de Core.

| Elemento | Estado | Evidencia / límite |
|---|---|---|
| Logotipo propio a la izquierda | IMPLEMENTADO | SVG exportado de Figma, cabecera sticky |
| Omnibuscador | PARCIAL | Buscar secciones reales Tablero/Agenda/Yo; no buscar actividades ni otras apps sin contratos |
| Agregar (+) | BLOQUEADO | Control deshabilitado y explicado hasta existir creación autorizada |
| Campana | PARCIAL | Novedades reales de dos releases publicados, lectura individual y masiva persistida localmente; falta integración con notificaciones de dominio y pipeline de futuros releases |
| Avatar/Cuenta | PARCIAL | Menú sin identidad inventada; abre Yo y Acerca de. No hay Auth verificada |
| Punto de sincronización | NO APLICA HOY | Sin Cuenta/Cloud activa, avatar **sin punto**; no mostrar falso estado verde |
| Sincronizar ahora | BLOQUEADO | No ofrecer acción inoperante sin Cloud real; se añadirá dentro de Cuenta cuando Core autorice sync |
| Menú completo de Cuenta | BLOQUEADO | Perfil real, contraseña, conexiones, sync y cerrar sesión requieren Auth/contratos |
| Mobile navegación inferior | IMPLEMENTADO | Tablero/Agenda/Yo |
| Desktop/iPad menú lateral | NECESITA AJUSTE | La navegación sigue inferior; requiere siguiente pase responsive |
| Búsqueda cross-app | NO APLICA | No cruzar dominios privados |
| About / Holoteles | PARCIAL | Texto Beta, propósito, independencia/no afiliación y Powered by Holoteles; faltan instalación PWA y catálogo canónico |
| QA visual real | PENDIENTE | No se ha probado Safari/iPad/desktop físico |

## Garantías
- Sin usuarios, nombres, sesiones, eventos, sincronizaciones ni permisos ficticios.
- No se usa API, token ni endpoint de Core.
- Estado leído de novedades es **preferencia local de interfaz**, no sincronización Cloud.
- Ningún control deshabilitado pretende crear registros.
- Los cambios de Agenda privada siguen aislados en PR #4 hasta que Core complete gates de identidad y autorización.
