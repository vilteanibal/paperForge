# Propuesta de Cambio: 04-ast-parser-engine

## Propósito
Implementar un motor de parseo de LaTeX a Árbol de Sintaxis Abstracta (AST) y serializador bidireccional idempotente en TypeScript puro (zero React coupling), de alto rendimiento (latencia < 200ms) y tolerante a fallos mediante nodos inmutables `UnknownBlockNode`.

## Alcance
1. Definición estricta de tipos de tokens y nodos AST con *Discriminated Unions* en `resources/js/editor/ast/types.ts`.
2. Lexer / Tokenizador lineal carácter a carácter en `resources/js/editor/ast/lexer.ts`.
3. Parser recursivo descendente con preservación de sintaxis no soportada en `resources/js/editor/ast/parser.ts`.
4. Serializador determinista e idempotente en `resources/js/editor/ast/serializer.ts`.
5. Batería de pruebas unitarias y de ida y vuelta (*Round-Trip Accuracy tests*) en Vitest (`resources/js/editor/ast/__tests__/`).
