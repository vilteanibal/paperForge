# Diseño Técnico: 07-final-ui-and-gatekeeping

## Arquitectura de Componentes

### 1. Atajos de Teclado Globales (`useGlobalShortcuts`)
- Mapeo de eventos `window.addEventListener('keydown')`:
  - `Ctrl+S` / `Cmd+S`: Guardar archivo actual en el workspace local vía `POST /api/fs/{project}/write`.
  - `Ctrl+B` / `Ctrl+Enter` / `Cmd+Enter`: Disparar compilación TeX Live vía `useCompiler.triggerCompile()`.
  - `Escape`: Cerrar modales / paneles activos.
- Interceptación estricta con `event.preventDefault()` y `event.stopPropagation()` para neutralizar diálogos nativos del navegador.

### 2. Explorador de Archivos del Workspace (`FileTree`)
- Consume el árbol jerárquico `WorkspaceTree` provisto por `GET /api/fs/{project}/tree`.
- Mapeo de iconos por tipo/extensión:
  - `.tex` -> Icono de documento LaTeX con badge distintivo.
  - `.bib` -> Icono de bibliografía / citas.
  - `.sty`, `.cls` -> Icono de configuración / estilos.
  - `.png`, `.jpg`, `.pdf` -> Icono de imágenes/medios.
  - Directorios -> Iconos de carpeta expandible/colapsable.
- Acciones rápidas: "Nuevo archivo", "Nueva carpeta", "Eliminar archivo".

### 3. Vistas Integradas (Inertia React)
- `Dashboard/Index.tsx`:
  - Cabecera con estadísticas de proyectos locales y buscador.
  - Grid responsivo de tarjetas de proyecto con motor de compilación, última fecha de apertura y menú contextual.
  - Modal interactivo de creación de proyecto con selección de `pdflatex`, `xelatex`, `lualatex`.
- `Editor/Show.tsx`:
  - Orquestador maestro que carga el archivo principal (`main.tex`), inicializa los stores `useEditorStore` y `useCompilerStore`, maneja la selección de archivos en el `FileTree` y sincroniza las compilaciones con el visor PDF y el panel de diagnósticos.

### 4. Pipeline de Calidad Unificado (*QA Gate*)
- Comando `"qa"` en `composer.json` combinando:
  - `vendor/bin/pint --test`
  - `vendor/bin/phpstan analyse --memory-limit=512M`
  - `npm run types:check`
  - `npm run test` (Vitest)
  - `php artisan test --compact` (Pest)
