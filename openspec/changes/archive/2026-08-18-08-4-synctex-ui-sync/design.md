# Diseño Técnico: 08-4-synctex-ui-sync

## Arquitectura de Componentes

### 1. Transformación Matemática de Coordenadas
- **Mouse Click $\rightarrow$ PDF Points:**
  - Dado un evento `MouseEvent` en el Canvas:
    ```typescript
    const rect = canvas.getBoundingClientRect();
    const clickX_css = e.clientX - rect.left;
    const clickY_css = e.clientY - rect.top;
    // La escala del viewport de PDF.js convierte puntos a píxeles CSS: x_css = x_pt * scale
    const x_pt = clickX_css / scale;
    const y_pt = clickY_css / scale;
    ```
- **PDF Points $\rightarrow$ DOM Highlight Box:**
  - Dado `{ page, x, y, width, height }` retornado por `/forward`:
    ```typescript
    const left_css = x * scale;
    const top_css = y * scale;
    const width_css = Math.max(20, width * scale);
    const height_css = Math.max(14, height * scale);
    ```

### 2. Capa de Resaltado Acelerada por GPU (`PdfHighlightOverlay.tsx`)
- Renderiza un `div` con `position: absolute`, borde y fondo translúcido (`bg-primary/25 border-primary`).
- Temporizador de 1.5s que activa una clase CSS `opacity-0 transition-opacity duration-500` para que el cuadro desaparezca suavemente sin repintar el Canvas.

### 3. Sincronización en Monaco Editor
- En `MonacoCodeEditor`:
  - Expone método `jumpToLine(line: number, column?: number)`:
    - `editor.revealLineInCenter(line);`
    - `editor.setPosition({ lineNumber: line, column: column || 1 });`
    - `editor.focus();`
  - Añade atajo `F8` / `Ctrl+Click` / Context Menu action para invocar `onSyncForward(line)`.
