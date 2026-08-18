# Especificación: Motor de Parseo AST de LaTeX en TypeScript

## 1. Contexto y Propósito
paperForge implementa un analizador sintáctico y serializador de LaTeX bidireccional, idempotente y de alto rendimiento en TypeScript puro, desacoplado de React y del DOM.

## 2. Invariantes y Tolerancia a Fallos
- **Preservación Inmutable de Código:** Todo comando, macro personalizada o entorno no reconocido visualmente se preserva intacto dentro de un `UnknownBlockNode` con su cadena literal `rawContent`.
- **Fidelidad de Ida y Vuelta (*Round-Trip Accuracy*):** `serialize(parse(input)) === input` garantizado para preámbulos, macros no editadas, fórmulas y estructuras de documento.
- **Rendimiento:** Escáner lineal $O(N)$ carácter a carácter con tiempo de procesamiento menor a 15 ms para documentos de más de 50 páginas.

## 3. Estructura y Módulos
- **Tipos y Nodos:** `resources/js/editor/ast/types.ts`
- **Lexer / Tokenizador:** `resources/js/editor/ast/lexer.ts` (`tokenize`)
- **Parser:** `resources/js/editor/ast/parser.ts` (`parse`)
- **Serializador:** `resources/js/editor/ast/serializer.ts` (`serialize`)
