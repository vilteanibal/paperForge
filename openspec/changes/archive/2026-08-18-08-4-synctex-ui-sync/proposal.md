# Propuesta de Cambio: 08-4-synctex-ui-sync

## Propósito
Integrar la experiencia de usuario de sincronización bidireccional instantánea entre `MonacoCodeEditor` y `PdfViewer` (SyncTeX Forward y Reverse), transformando coordenadas matemáticas de pantalla a puntos tipográficos y renderizando cajas de resaltado animadas mediante una capa superpuesta (*Overlay Layer*) con desvanecimiento GPU.

## Alcance
1. Contratos TypeScript en `resources/js/types/synctex.d.ts` para respuestas `/forward` y `/reverse`.
2. Hook `useSyncTeX.ts` para orquestar consultas espaciales hacia el backend y gestionar el estado del rectángulo resaltado temporal.
3. Componente `PdfHighlightOverlay.tsx` superpuesto de forma absoluta al Canvas del PDF con animación de desvanecimiento tras 1.5s (*Highlight Decay*).
4. Modificaciones a `PdfViewer.tsx` para soportar `onDoubleClick` con transformación de coordenadas de mouse a puntos PDF, navegación a página por Forward Sync y renderizado de la capa de resaltado.
5. Modificaciones a `MonacoCodeEditor.tsx` para exponer atajo de Forward Sync y ref programática para `revealLineInCenter(line)`.
6. Modificación de `Editor/Show.tsx` como orquestador maestro que conecta los eventos entre ambos paneles.
7. Batería de pruebas unitarias en Vitest (`syncTeXNavigation.test.ts`).
