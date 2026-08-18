# Especificación: Sincronización Bidireccional Código ↔ PDF Canvas

## 1. Contexto y Propósito
paperForge integra navegación bidireccional instantánea (SyncTeX Forward y Reverse) entre el editor de código Monaco y el visor de PDF (`pdfjs-dist`).

## 2. Invariantes de Transformación y Rendimiento
- **Capa de Resaltado Desacoplada (*Overlay Layer*):** El resaltado de cajas tipográficas tras un Forward Sync se renderiza en un contenedor absoluto sobre el Canvas (`PdfHighlightOverlay.tsx`) con desvanecimiento progresivo en 1.5s (*Highlight Decay*), sin disparar re-renderizados de `pdfjs-dist`.
- **Transformación Matemática Proporcional:** Las coordenadas del mouse capturadas con `onDoubleClick` se dividen por el nivel de escala activo (`scale`) para mapear con exactitud a puntos tipográficos ($72\text{ dpi}$) en el documento PDF.
- **Navegación Programática en Monaco:** Reverse Sync invoca `revealLineInCenter(line)` y `setPosition()`, centrando la línea sin deseleccionar el texto ni perder el foco.

## 3. Módulos y Componentes
- **Tipos:** `resources/js/types/synctex.d.ts`
- **Hook y Matemáticas:** `resources/js/hooks/useSyncTeX.ts`
- **Capa de Resaltado:** `resources/js/components/pdf/PdfHighlightOverlay.tsx`
- **Visor PDF:** `resources/js/components/pdf/PdfViewer.tsx`
- **Editor Monaco:** `resources/js/editor/monaco/MonacoCodeEditor.tsx`
- **Página de Estudio:** `resources/js/pages/Editor/Show.tsx`
