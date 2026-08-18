# Especificación: Visor de PDF Offline & Diagnósticos de Compilación

## 1. Contexto y Propósito
paperForge integra un visor de PDF 100% offline basado en `pdfjs-dist` con control de fugas de memoria y un panel interactivo de diagnósticos estructurados de TeX Live enlazados al editor.

## 2. Invariantes Offline y Gestión de Recursos
- **Worker Local:** `pdfjs-dist` se ejecuta estrictamente desde el worker estático local empaquetado en el bundle de Vite, sin realizar ninguna llamada a CDNs externos.
- **Liberación de Memoria Canvas:** En cada ciclo de re-compilación o desmontaje, se cancelan las tareas de renderizado pendientes (`renderTask.cancel()`), se destruyen las instancias del documento (`pdfDoc.destroy()`) y se revocan las URLs de Blob (`URL.revokeObjectURL`).
- **Navegación Interactiva de Errores:** Cada diagnóstico (`error`, `warning`, `badbox`) expone su número de línea y archivo para permitir el salto de cursor directo en Monaco Editor.

## 3. Módulos y Componentes
- **Store de Compilación:** `resources/js/stores/useCompilerStore.ts`
- **Hook Asíncrono:** `resources/js/hooks/useCompiler.ts`
- **Visor y Toolbar:** `resources/js/components/pdf/PdfViewer.tsx`, `PdfToolbar.tsx`
- **Panel y Filas de Diagnósticos:** `resources/js/components/diagnostics/DiagnosticsPanel.tsx`, `DiagnosticItem.tsx`
