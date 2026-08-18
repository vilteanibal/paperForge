# Tareas de Implementación: 08-4-synctex-ui-sync

- [x] 1. Crear contratos TypeScript en `resources/js/types/synctex.d.ts`.
- [x] 2. Implementar hook `resources/js/hooks/useSyncTeX.ts` con funciones de conversión y peticiones API.
- [x] 3. Implementar componente de resaltado visual en `resources/js/components/pdf/PdfHighlightOverlay.tsx`.
- [x] 4. Actualizar `resources/js/components/pdf/PdfViewer.tsx` para soportar `onDoubleClick` e integrar la capa de resaltado y salto de página.
- [x] 5. Actualizar `resources/js/editor/monaco/MonacoCodeEditor.tsx` para exponer `jumpToLine` y comando de Forward Sync.
- [x] 6. Actualizar `resources/js/pages/Editor/Show.tsx` orquestando la sincronización bidireccional.
- [x] 7. Crear pruebas unitarias en Vitest en `resources/js/components/__tests__/syncTeXNavigation.test.ts`.
- [x] 8. Crear el registro de decisión de arquitectura en `docs/architecture/decisions/0011-synctex-bidirectional-ui-and-coordinate-math.md`.
- [x] 9. Ejecutar el pipeline `composer run qa` validando 100% de éxito.
