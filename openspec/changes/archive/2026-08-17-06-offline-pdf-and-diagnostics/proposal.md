# Propuesta de Cambio: 06-offline-pdf-and-diagnostics

## Propósito
Implementar un visor de PDF 100% offline basado en `pdfjs-dist` con gestión manual de memoria y liberación de canvas, junto a un panel reactivo de diagnósticos y errores estructurados de compilación LaTeX con salto al cursor en Monaco Editor.

## Alcance
1. Configuración de `pdfjs-dist` con worker local estático servido por Vite (sin peticiones a CDNs externos).
2. Componentes del visor de PDF (`resources/js/components/pdf/PdfViewer.tsx` y `PdfToolbar.tsx`) con paginación, zoom, control de errores y limpieza estricta en el ciclo de vida de React (`useEffect` cleanup).
3. Componentes del panel de diagnósticos (`resources/js/components/diagnostics/DiagnosticsPanel.tsx` y `DiagnosticItem.tsx`) con filtrado por severidad y navegación al editor.
4. Hook y store de compilación (`resources/js/hooks/useCompiler.ts` / `useCompilerStore.ts`) que gestiona peticiones asíncronas hacia el backend (`/api/compile/{project}`).
5. Suite de pruebas en Vitest para el hook de compilación y los componentes de visualización y diagnósticos.
