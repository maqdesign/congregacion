# Mi Tablero · Concepto móvil 01

Figma: https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=19-291

Diseño visual exploratorio de la pantalla principal (390×844). Contiene encabezado con nombre de congregación, próxima reunión, mis asignaciones, limpieza, anuncios, predicación/territorios y navegación inferior Tablero/Servicio/Informe/Cuenta. Paleta preliminar de marca y tipografía Nunito Sans.

**Importante:** horas, fechas, programación, pertenencia y estados usados en el boceto son ilustrativos; no son datos autenticados ni de producción. Nada se ha desplegado.

Próximo: revisar legibilidad/contraste y densidad móvil; sustituir los datos ilustrativos por contratos de Reuniones, Servicio y Holoteles; construir estados vacíos, pendientes y online/offline.


## V2 · Holoteles · 2026-10-21

[Figma V2 editable](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=22-291) (390 × 844, frame `22:291`).

- Encabezado: instancia del isotipo maestro de Mi Congregación, título, **búsqueda y cuenta arriba**.
- Barra inferior: **Tablero / Reuniones / Servicio / Informe**, sin Cuenta.
- Iconografía SVG lineal editable, sin emoji ni glifos de relleno; geometrías inspiradas en lenguaje Lucide, trazadas como SVG. Para desarrollo, instalar Lucide bajo su licencia ISC; no reclamar que los trazos manuales fueron importados de su paquete.
- Datos: textos neutros de contrato pendientes ("Consulta el programa", "Fecha, hora y modalidad") sin inventar asignaciones/horas reales. Diseño, **no interfaz autenticada ni conectada al backend**.
- La variante V1 se conserva como historial de exploración, V2 es la dirección actual.
- Contratos canónicos Holoteles: cuenta/congregación/rol/contexto en Core; Reuniones y Servicio alimentan tarjetas según autorización. Revisar NEXO antes de implementar.
- Pendientes: QA visual real en dispositivo, revisar contraste y escala tipográfica; conectar contratos cuando estén listos y cuando haya acceso autorizado.


## V3 · Tablero de relevancia dinámica · 2026-10-21

[Figma V3 — concepto desplazable](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=24-313), 390×1360.

- Se muestra información resumida antes de cada clic: evento prioritario, reunión de hoy, asignaciones, limpieza, anuncios, salidas para predicar e informe.
- Jerarquía adaptativa: evento próximo relevante (p. ej., asamblea de esta semana), reunión de hoy, compromiso personal inminente, novedades vigentes, resto cronológico. No hay prioridad fija de asamblea por encima de todo: depende del momento, pertenencia y urgencia real.
- Mismo encabezado de identidad + búsqueda + Cuenta Holoteles arriba; abajo Tablero, Reuniones, Servicio, Informe.
- Los textos como «Fecha y lugar por confirmar» son estados ilustrativos/plantillas. **No hay datos reales ni conexión al backend.** No atribuir fecha ni asistencia al usuario sin registros verificados.
- Propuesta de motor futuro: clasificar por vigencia, ventana temporal, audiencia/autorización y relevancia personal; mostrar solo elementos permitidos; resumen y acción de detalles, con estados vacíos, caducados y offline.
