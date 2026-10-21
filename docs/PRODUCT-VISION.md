# Mi Congregación — visión y decisiones iniciales

**Fecha:** 2026-10-21. **Estado:** especificación funcional, no implementación.

## Propósito
Centro de información personal de una congregación, no sustituye JW Hub, JW.org ni el tablero físico; útil para personas mayores, sin obligar a instalar otras apps. Gratis por intención de producto y sin publicidad. Marca Holoteles discreta.

## Productos y propiedad
- **Mi Congregación**: portal privado de información, anuncios, reuniones, eventos, asignaciones e informe.
- **Servicio** = aplicación **Territorios** renombrada, *no una app aparte*: publicadores, grupos, salidas para predicar, predicación pública, territorios personales, informes y anuncios/administración autorizada.
- **Reuniones** = Planificador **VMC** renombrado: horarios/programas, asignaciones, discursos públicos, modalidad de reunión y limpieza.
- **Tareva**: registro personal opcional, no requerido para enviar informe.
- **Holoteles Core**: cuentas, identidad canónica de congregación, grupos, membresías, permisos y contratos entre dominios. Nunca vincular personas por nombre automáticamente ni mezclar bases por compartir login.

## Información y acceso
Cuenta Holoteles y membresía aprobada para ver contenido reservado de la congregación. Identidad de congregación por ID canónico (nunca por nombre solo) para prevenir colisiones. Sin modo local independiente sin cuenta; caché offline *protegida y revalidable* únicamente de información previamente autorizada. Verificación inicial separada de PIN de desbloqueo local de 4 dígitos; control de intentos, recuperación y revocación. Biometría del dispositivo/passkeys sin almacenar datos biométricos en Holoteles. PIN solo no da identidad ni permisos.

## Anuncios y permisos
- El coordinador del cuerpo de ancianos suele publicar; puede designar anciano delegado temporal o por alcance, incluso si un operador autorizado le ayuda a escribir. Diferenciar autor, aprobador, delegado y publicador efectivo, con auditoría.
- El coordinador puede aprobar una vez un **flujo recurrente** delimitado por origen, tipo, destinatario y vigencia (programas de reuniones, salidas, discursos). Un anuncio nuevo o fuera de flujo requiere revisión puntual. Flujo revocable.
- Servicio tendrá editor de mensajes rápidos, fecha inicio/expiración (24 h, semana, personalizada, hasta retiro), destinatarios **todos / solo ancianos / ancianos y siervos ministeriales**, histórico y retiro anticipado. Audiencias protegidas en servidor, no solo en interfaz.
- Solo anuncios para toda la congregación generan propuesta de mensaje/enlace para WhatsApp general. Primera versión: compartir/copia manual; API de Meta no supone acceso genérico a comunidad existente ni verificación automática de membresía WhatsApp. Un enlace reenviado nunca concede acceso.
- IA puede agrupar mensajes relacionados importados/copied con revisión humana y conservar texto de origen; nunca publicar sin autorización.
- Avisos urgentes sin texto privado en pantalla bloqueada, caducidad de notificaciones y corrección de cambios.

## Reuniones y actividades
Presencial es modalidad habitual, con opción Zoom reservada a usuarios autorizados; excepción solo Zoom para una fecha, periodo o indefinido, con actualizaciones rápidas. Agenda de asambleas, visitas del superintendente y otros eventos. Limpieza semanal por grupos y general, reglas recurrentes granulares (primer/último sábado, cada 2/3/5 semanas, excepciones), horarios, lugares y tareas. Salidas/puestos de predicación pública desde Servicio.

## Mis asignaciones
Desde Reuniones, filtradas por persona verificada: Tesoros de la Biblia (azul), Seamos Mejores Maestros (amarillo), Nuestra Vida Cristiana (rojo), fin de semana (color por decidir). Incluye estudiante, enseñanza, presidencia, discursos locales/externos, compañeros y cambios. No depender solo de color.

## Informes
Formulario adaptado a la condición del publicador validada en Servicio: publicador (participó sí/no, cursos bíblicos, comentario opcional), precursor auxiliar/regular/especial (horas cuando proceda además de los campos respectivos). Vigencia temporal por mes para precursor auxiliar y no modificar informes históricos. Envío al superintendente de grupo autorizado (incluido el suyo), consolidación al secretario vía integración autorizada o exportación Excel; campos exactos sujetos a formulario vigente y revisión de confidencialidad.

## Seguridad y política de contenidos
Pauta organizativa aportada por propietario: «No hay ningún inconveniente en que se utilicen servicios de almacenamiento en línea para guardar documentos de carácter no confidencial, como los que se ponen en el tablero de anuncios. Sin embargo, la información sensible o confidencial, como la de asuntos atendidos por un comité de ancianos, nunca debe almacenarse en línea».
No extrapolar autorización genérica: evaluar datos personales/informes y excluir asuntos confidenciales de almacenamiento online. Los anuncios editoriales no sustituyen clasificación de datos. Consentimiento, mínimo acceso, revocación y auditoría.

## Diseño y estado
Marca concepto A aprobado. Inicio como tablero moderno informativo, sin citas bíblicas/paisajes ni visual religioso decorativo. Navegación accesible, tipografía grande y sencilla, app PWA e inicio fluido. La implementación requiere contratos y validaciones antes de tocar producción.

## Referencias canónicas
- [NEXO](https://github.com/maqdesign/holoteles/blob/main/docs/ECOSYSTEM-INTEGRATION-CHAT.md)
- [Congregation domains](https://github.com/maqdesign/holoteles/blob/main/docs/CONGREGATION-DOMAINS.md)
- [Figma](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X)
