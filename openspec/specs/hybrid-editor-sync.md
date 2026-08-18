# Especificación: Editor Híbrido & Sincronización Bidireccional

## 1. Contexto y Propósito
paperForge integra un entorno de edición híbrido que combina la precisión de Monaco Editor con la intuición de un editor visual WYSIWYG basado en el AST de LaTeX, sincronizados en tiempo real mediante Zustand.

## 2. Invariantes de Estado y Rendimiento
- **Seguimiento de Origen (*Origin Tracking*):** Las mutaciones declaran su origen (`'code'`, `'visual'`, `'disk'`, `'none'`) para eliminar bucles de retroalimentación infinita entre editores.
- **Latencia Sub-200ms:** Las actualizaciones y serializaciones se completan en menos de 20 ms.
- **Preservación Visual:** Los nodos no editables o macros complejas (`UnknownBlockNode`) se muestran como bloques protegidos de solo lectura.

## 3. Módulos y Componentes
- **Store Reactivo:** `resources/js/stores/useEditorStore.ts`
- **Editor de Código:** `resources/js/editor/monaco/MonacoCodeEditor.tsx`
- **Editor Visual:** `resources/js/editor/visual/VisualEditor.tsx` y nodos en `resources/js/editor/visual/nodes/`
- **Layout y Modos:** `resources/js/editor/layout/EditorLayout.tsx`, `ModeToggle.tsx`
