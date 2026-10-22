# Navegación unificada y reunión en curso

Estado: **Figma actualizado**; especificación funcional pendiente de implementación. No hay datos ni enlaces de Zoom reales.

## Navegación principal

La barra inferior canónica de Mi Congregación tiene **Tablero / Agenda / Yo**. Se actualizaron los siguientes marcos existentes:

- [Mi Tablero V1](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=19-291)
- [Mi Tablero V2](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=22-291)
- [Mi Tablero V3](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=24-313)
- [Agenda de actividades](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=28-349)
- [Mi Tablero · horarios habituales](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=31-374) y [Agenda · calendario](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=31-446) ya empleaban esta navegación.

Cuenta y búsqueda siguen arriba. Reuniones/VMC, Servicio/Territorios e Informe son fuentes/dominios, no pestañas principales. Agenda integra eventos, reuniones, ministerio, limpieza y asignaciones; Yo reúne informe y responsabilidades personales. La barra se actualizó también en bocetos históricos para evitar confusión visual.

## Reunión en vivo · tarjeta flotante

- [Figma: reunión en curso con Zoom opcional](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=33-476)
- [Figma: reunión en curso sin Zoom autorizado](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X?node-id=33-580)

**Diseño:** tarjeta compacta, persistente y minimizable, que no bloquee navegación ni cubra la barra inferior. Se muestra cuando hay una reunión de congregación en curso **según programación vigente, zona horaria y estado autorizado**. Resumen: nombre, estado «En curso», acceso a programa; botón «Unirse por Zoom» únicamente cuando exista enlace válido publicado para la audiencia autorizada.

**Reglas funcionales pendientes:**
1. Horario de inicio/fin con zona horaria congregacional y excepciones; no inferir reunión en vivo solo porque hoy hay reunión.
2. Un enlace Zoom no se debe inventar, deducir, mostrar en caché tras revocación ni revelar en notificaciones públicas. Resolver el acceso con autorización vigente de Holoteles Core/Reuniones; permitir que una reunión sea presencial, híbrida o excepcionalmente solo Zoom.
3. Si no hay Zoom aprobado o el usuario no tiene permiso, **ocultar botón Zoom** y mantener «Ver programa».
4. Minimizar sin perder el estado; mostrar una píldora persistente accesible mientras dura la reunión, con posibilidad de expandir.
5. Manejar reprogramación, cancelación, cambio de modalidad, fin de reunión, offline y recuperación de conectividad; evitar enlaces obsoletos.
6. Abrir Zoom con un enlace HTTPS verificado o la integración aprobada, mediante interacción explícita del usuario. No conectar ni iniciar sesión automáticamente.
7. Para accesibilidad, evitar animaciones intrusivas y no interrumpir formularios ni tareas.

Los botones del diseño Figma son **visuales, todavía no funcionales**. No se hizo deploy, se tocó producción ni se creó enlace Zoom.

## Siguiente paso

Diseñar variantes compacta/expandida y los estados de reunión: programada, en curso, finalizada, cancelada, solo presencial, Zoom disponible y sin acceso. Posteriormente conectar contratos de Reuniones y permisos Core, con QA en dispositivo.

Referencias: [PRODUCT-VISION](./PRODUCT-VISION.md), [AGENDA-ACTIVIDADES](./AGENDA-ACTIVIDADES.md), [HORARIOS-Y-CALENDARIO](./HORARIOS-Y-CALENDARIO.md), [NEXO](https://github.com/maqdesign/holoteles/blob/main/docs/ECOSYSTEM-INTEGRATION-CHAT.md).
