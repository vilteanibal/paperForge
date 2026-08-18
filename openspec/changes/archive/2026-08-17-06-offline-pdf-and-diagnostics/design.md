# Diseño Técnico: 06-offline-pdf-and-diagnostics

## Arquitectura de Componentes

### 1. Visor de PDF Offline y Gestión de Memoria
- `PdfViewer`:
  - Worker local: `GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();`
  - Manejo de ciclo de vida con cancelación de `renderTask.cancel()` y destrucción del documento `pdfDoc.destroy()` ante desmontaje o cambio de PDF.
  - Soporte de escala/zoom (50% a 300%) y navegación multi-página.
- `PdfToolbar`:
  - Controles compactos de anterior/siguiente página, indicador numérico `Página X de Y` y botones de zoom `+`, `-`, `Fit Width`.

### 2. Panel de Diagnósticos de Compilación
- `DiagnosticsPanel`:
  - Pestañas de filtrado: *All*, *Errors* (Rojo), *Warnings* (Amarillo), *Badboxes* (Azul) y *Raw Logs*.
  - Vista colapsable/expandible al pie o lateral del editor.
- `DiagnosticItem`:
  - Fila interactiva que muestra severidad, archivo, número de línea y mensaje del error.
  - Al hacer clic, invoca `onDiagnosticClick(line, file)` para posicionar el cursor en Monaco.

### 3. Hook de Orquestación de Compilación
- `useCompiler(projectId)`:
  - Invoca `POST /api/compile/{projectId}` con timeout.
  - En caso de éxito (`success: true`), solicita el Blob binario desde `GET /api/compile/{projectId}/pdf` y genera una URL de objeto (`URL.createObjectURL(blob)`).
  - Almacena el resultado tipado `CompileResult` y la lista de `LaTeXDiagnostic` en Zustand.
