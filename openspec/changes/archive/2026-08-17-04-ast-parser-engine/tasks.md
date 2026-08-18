# Tareas de Implementación: 04-ast-parser-engine

- [x] 1. Crear definiciones de tipos y nodos AST en `resources/js/editor/ast/types.ts`.
- [x] 2. Implementar tokenizador / lexer en `resources/js/editor/ast/lexer.ts` con suite de pruebas en `resources/js/editor/ast/__tests__/lexer.test.ts`.
- [x] 3. Implementar parser recursivo en `resources/js/editor/ast/parser.ts` con suite de pruebas en `resources/js/editor/ast/__tests__/parser.test.ts`.
- [x] 4. Implementar serializador idempotente en `resources/js/editor/ast/serializer.ts` con suite de pruebas en `resources/js/editor/ast/__tests__/serializer.test.ts`.
- [x] 5. Crear suite de pruebas de ida y vuelta (*Round-Trip Tests*) con documentos LaTeX reales en `resources/js/editor/ast/__tests__/roundtrip.test.ts`.
- [x] 6. Crear el registro de decisión de arquitectura en `docs/architecture/decisions/0004-fault-tolerant-ast-parsing.md`.
- [x] 7. Ejecutar `npm run test` (Vitest) y `npm run types:check` (TypeScript) para validar 100% verde y cero errores.
