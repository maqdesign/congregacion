# Mi Congregación · implementación de identidad en la PWA

## Fuente de verdad
- Identidad aprobada: **concepto A**, tablero de anuncios, papel principal, nota secundaria, tarjeta de personas y tres chinchetas. Referencia maestra descrita en `docs/BRAND.md`.
- SVG exportados **sin redibujarlos** desde los componentes ya existentes en [Figma](https://www.figma.com/design/RJoeAJYlYDBLqIDR7Ef45X): logotipo horizontal color (`5:24`), variante oscura (`5:47`), isotipo color (`5:104`).
- Tokens de la guía de referencia: azul profundo `#182F4B`, dorado `#C7942F`, arena `#D8B48A`, crema `#F6EFE6`, azul grisáceo `#8FA5BD`.
- El lettering/vector de Figma sigue siendo una **reconstrucción preliminar**; `docs/BRAND.md` indica que aún no ha sido cotejada al 100% con la imagen maestra. No se presenta como logotipo final certificado.

## Cambios
- Encabezado con logotipo real exportado desde Figma, en lugar del libro genérico.
- Tablero con isotipo, jerarquía visual, tarjetas y navegación cálida, alto contraste, foco visible, responsivo y reducción de movimiento.
- Favicon e icono PWA usan el isotipo de Figma; `purpose:any` para no prometer safe-area maskable sin prueba.
- Sin fuentes externas ni imágenes decorativas, anuncios inventados, sesiones ficticias o conexiones al backend.
- Holoteles sigue discreto y visible solo en contexto de producto/cuenta.

## QA antes de producción
1. Ejecutar `node --test tests/brand-shell.test.mjs` en checkout y las pruebas existentes. **No ejecutadas desde el conector**.
2. Revisar visualmente en iPhone/iPad, modo claro, tamaño de texto aumentado y contraste del logotipo sobre encabezado.
3. Comprobar icono de PWA instalado en Safari y estado offline. El isotipo SVG puede requerir PNG Apple Touch para iOS: no inventar equivalencia.
4. Comparar el logotipo exportado con la imagen maestra aprobada y completar QA de Figma antes de declarar identidad final.
5. Aprobar merge de esta rama independiente de la integración Auth/BFF. No se realizó preview ni deployment.
