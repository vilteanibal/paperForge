# Propuesta de Cambio: 05-hybrid-editor-and-sync

## Propósito
Implementar el editor híbrido en React combinando Monaco Editor (Modo Código) y un renderizador visual interactivo WYSIWYG (Modo Visual), orquestados a través de Zustand con un motor de sincronización bidireccional con seguimiento de origen (*Origin Tracking*) para eliminar bucles infinitos y mantener la latencia < 200 ms.

## Alcance
1. Store reactivo global en Zustand (`resources/js/stores/useEditorStore.ts`) con origin tracking (`'code' | 'visual' | 'disk' | 'none'`).
2. Componente de edición en código `MonacoCodeEditor.tsx` configurado para sintaxis LaTeX.
3. Componente de edición visual `VisualEditor.tsx` con componentes memoizados para cada nodo AST (`SectionNodeView`, `ParagraphNodeView`, `MathNodeView`, `UnknownBlockNodeView`).
4. Motor de sincronización bidireccional `BidirectionalSyncEngine.ts` con debounce.
5. Layout modular de editor (`EditorLayout.tsx`, `ModeToggle.tsx`) con soporte para vistas *Code*, *Visual* y *Split*.
6. Suite de pruebas Vitest para verificar la reactividad del store y la prevención de bucles infinitos.
