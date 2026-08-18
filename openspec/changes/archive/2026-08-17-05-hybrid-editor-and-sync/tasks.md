# Tareas de Implementación: 05-hybrid-editor-and-sync

- [x] 1. Implementar store reactivo con Origin Tracking en `resources/js/stores/useEditorStore.ts`.
- [x] 2. Implementar componente de edición de código en `resources/js/editor/monaco/MonacoCodeEditor.tsx`.
- [x] 3. Implementar vistas de nodo del editor visual en `resources/js/editor/visual/nodes/` (`SectionNodeView.tsx`, `ParagraphNodeView.tsx`, `MathNodeView.tsx`, `UnknownBlockNodeView.tsx`).
- [x] 4. Implementar orquestador del editor visual en `resources/js/editor/visual/VisualEditor.tsx`.
- [x] 5. Implementar barra de herramientas y layout de vista dividida en `resources/js/editor/layout/` (`EditorLayout.tsx`, `ModeToggle.tsx`).
- [x] 6. Crear suite de pruebas de sincronización y mitigación de bucles infinitos en `resources/js/editor/__tests__/useEditorStore.test.ts`.
- [x] 7. Crear el registro de decisión de arquitectura en `docs/architecture/decisions/0005-bidirectional-sync-and-state-management.md`.
- [x] 8. Ejecutar `npm run test` (Vitest) y `npm run types:check` (TypeScript) para validar 100% de éxito.
