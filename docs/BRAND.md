# Mi Congregación — identidad visual v1

**Estado:** concepto A aprobado por el propietario (2026-10-21). Nombre oficial: **Mi Congregación**. No cambiar la identidad aprobada sin consultar.

## Referencias
- Imagen maestra aprobada: imagen compartida en la conversación del 21 de octubre de 2026, **concepto A**, tablero marrón claro con dos notas superiores, tarjeta inferior azul grisáceo con personas y chinchetas doradas/azul marino. **Debe incorporarse sin alteraciones en Figma** como referencia. GitHub no almacena aún el archivo binario original en este commit documental.
- [Figma · Mi Congregación — Identidad visual](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X). Se creó una reconstrucción geométrica editable inicial, **NO aprobada como trazado fiel**. Sigue pendiente incluir la imagen real y refinar vectores.

## Personalidad y límites
Tablero de anuncios minimalista, cálido, legible, nada de escenarios religiosos, fotografías de paisajes, versículos bíblicos o skeuomorfismo excesivo. Holoteles discreto en sesiones/cuenta/acerca de; evitar marketing en el producto. Intención de gratuidad permanente; comprobar sostenibilidad de infraestructura antes de afirmaciones contractuales.

## Elementos del logo
Isotipo: cuadrado redondeado tipo tablero; marco arena; papel principal claro con líneas marinas; nota secundaria cálida; tarjeta azul grisáceo con símbolo de personas; tres chinchetas. Logotipo: **Mi** dorado encima de **Congregación** azul marino.

## Cuatro variantes necesarias
1. Principal a color sobre claro.
2. Principal adaptada a fondo oscuro: lettering legible, isotipo cromático.
3. **Monocromática negra sobre blanco**: solo negro puro #000000, vacíos reales; sin sombras, transparencias, grises, degradados ni distintos tonos.
4. **Monocromática blanca sobre negro**: solo blanco puro #FFFFFF, vacíos reales; mismas restricciones.

También isotipos solos correspondientes, favicon y tamaños PWA.

## Guía de construcción preliminar (no medición exacta del original)
- Master isotipo 256×256 unidades, radio exterior aproximado 35, margen interno 16.
- Papel principal: ~122×140; nota secundaria ~69×93; tarjeta de personas ~121×76; chinchetas 20–24 de diámetro.
- Logotipo horizontal: separación símbolo/tipo 0.10–0.13 veces el lado del isotipo; bloque de dos líneas alineado ópticamente.
- Másters recomendados: 1024×1024; iconos 512×512, 128×128 y favicon 32×32.
- Colores provisionales de reconstrucción: marino #1A2E43, dorado #C99A42, arena #D7B58A, crema #F5EEE5, azul grisáceo #94A6B8. **Ajustar contra imagen maestra; aún no certificados como valores exactos**.
- Tipografía pendiente de ajuste fino; no asumir que Inter reproduce el lettering aprobado.

## Criterios de aceptación
Imagen maestra visible en Figma; vectors fieles y editables; las cuatro variantes; icono legible a 32 px; proporciones, espaciados y contraste verificados; QA visual antes de proclamar arte final.


## Figma — Componentes reutilizables (2026-10-21)

Archivo: https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X

- Conjunto de variantes **Mi Congregación / Logotipo** (Figma node `5:158`): Tema=Color, Oscuro, Negro, Blanco.
- Conjunto de variantes **Mi Congregación / Isotipo** (Figma node `5:159`): Tema=Color, Oscuro, Negro, Blanco.
- Las variantes Negro/Blanco usan solamente `#000000` o `#FFFFFF` con vacíos transparentes, sin degradados ni tonos grises.
- **Estado: COMPONENTES INICIALES REUTILIZABLES, NO MÁSTER FINAL.** Persisten dos deudas: poner la imagen aprobada en el Figma para cotejo directo y ajustar fidelidad del trazado/tipografía a ese original. No representar estos vectores como reproducción exacta del arte aprobado.


## Checklist de pulido — revisión 2026-10-21

- [x] Dos conjuntos Figma reutilizables: logotipo e isotipo, 4 temas cada uno.
- [x] Corregir orientación de 20 trazos de texto en 4 variantes a color/oscuro: papel principal -4°, secundario +6°; coherentes con sus respectivos papeles.
- [x] Reservar un nodo dedicado a la referencia aprobada en Figma (`6:2`).
- [ ] **Subir realmente la foto original**: la URL de carga fue emitida, pero el envío desde el entorno falló por falta de resolución de red a mcp.figma.com. El nodo de referencia sigue sin foto; no considerar terminado.
- [ ] Verificar papel + trazos y alinear ópticamente a la imagen maestra al 100%.
- [ ] Refinar ubicación de chinchetas, siluetas de personas y tipografía.
- [ ] Inspección visual de 8 variantes e icono a 32px.
- [ ] Comprobar que negro sobre blanco y blanco sobre negro no tengan grises ni falsas transparencias.
- [ ] Crear especímenes comparativos de instancias y aprobar máster final.

El logotipo sigue siendo **reconstrucción preliminar editable**, no reproducción final certificada.


## Pulido vectorial — 2026-10-21 (revisión 2)

- [x] Portada del primer frame: se retiró el arte obsoleto y se insertó instancia vinculada del componente principal Figma (`8:34`).
- [x] Añadidas líneas de texto inclinadas a las cuatro variantes monocromáticas (logotipo e isotipo), usando tinta única.
- [x] Sombras vectoriales geométricas discretas bajo las tres notas en las cuatro variantes cromáticas (logotipo e isotipo). Formas editables SVG-safe con desplazamiento y opacidad, sin blur.
- [x] Tipografía de los cuatro logotipos: Nunito Sans ExtraBold (propuesta aún por validar visualmente).
- [ ] Revisión visual / captura de los ocho másteres; comprobar orden de capas, exportación SVG, tamaños pequeños y ajuste tipográfico.
- [ ] Imagen aprobada sin insertar todavía en Figma por bloqueo anterior de subida; confirmar fidelidad del trazado cuando esté disponible.

**Estado:** cambios guardados en Figma, pendientes de QA y aprobación visual; no afirmar que el logotipo final está aprobado.


## Proporciones y composición vertical — 2026-10-21

- [x] Reequilibradas las cuatro variantes del componente horizontal `Mi Congregación / Logotipo`: isotipo reducido de 256 a ~187 px; tipografía ampliada a 72 px (Mi) y 49 px (Congregación), con menos distancia entre símbolo y nombre.
- [x] Creado conjunto reutilizable `Mi Congregación / Logotipo vertical` (Figma node `9:152`), cuatro variantes `Tema=Color, Oscuro, Negro, Blanco`. Símbolo centrado arriba y texto centrado abajo.
- [ ] Cotejar proporciones exactas con referencia aprobada y revisar render/exportación SVG en Figma.
