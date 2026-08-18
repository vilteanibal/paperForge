# Propuesta de Cambio: 07-final-ui-and-gatekeeping

## Propósito
Ensamblar la experiencia de usuario completa de paperForge (Dashboard de Proyectos, FileTree reactivo con gestión de archivos, Editor Maestro integrado con atajos globales de teclado) e instituir el pipeline de auditoría y *Gatekeeping* de calidad de producción.

## Alcance
1. Hook de atajos globales de teclado `useGlobalShortcuts.ts` con interceptación de eventos del navegador (`e.preventDefault()` para `Ctrl+S`, `Cmd+S`, `Ctrl+B`, `Ctrl+Enter`).
2. Componentes del árbol de archivos del workspace `FileTree.tsx` con soporte para creación, eliminación, selección y navegación con iconos semánticos.
3. Vista completa del Dashboard `resources/js/pages/Dashboard/Index.tsx` con listado de proyectos recientes, modal de creación con plantillas LaTeX y eliminación con confirmación.
4. Vista maestra del Editor `resources/js/pages/Editor/Show.tsx` orquestando FileTree (Sidebar), Monaco + Visual WYSIWYG (Centro), PDF Viewer (Derecha) y Panel de Diagnósticos (Bottom).
5. Script de control de calidad unificado `"qa"` en `composer.json`.
6. Batería de pruebas finales en Vitest y Pest PHP.
