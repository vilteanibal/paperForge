# Diseño Técnico: 04-ast-parser-engine

## Arquitectura de Componentes

### 1. Sistema de Tipos (Discriminated Unions)
- `TokenType`: `COMMAND`, `TEXT`, `MATH_INLINE`, `MATH_DISPLAY`, `BRACE_OPEN`, `BRACE_CLOSE`, `BRACKET_OPEN`, `BRACKET_CLOSE`, `COMMENT`, `SPECIAL`, `EOF`.
- `ASTNode`: Unión discriminada por `type`:
  - `DocumentNode`: `children: ASTNode[]`
  - `PreambleNode`: `rawContent: string`
  - `SectionNode`: `level: number`, `title: string`, `starred: boolean`
  - `ParagraphNode`: `children: ASTNode[]`
  - `TextNode`: `value: string`
  - `InlineFormattingNode`: `format: 'bold' | 'italic' | 'underline' | 'monospace'`, `children: ASTNode[]`
  - `MathInlineNode`: `math: string`
  - `MathBlockNode`: `math: string`, `environment?: string`
  - `EnvironmentNode`: `name: string`, `children: ASTNode[]`, `rawContent?: string`
  - `MacroNode`: `name: string`, `args: string[]`, `optionalArgs: string[]`
  - `UnknownBlockNode`: `rawContent: string` (Inmutable, garantiza cero pérdida de datos)
  - `CommentNode`: `value: string`

### 2. Lexer Lineal (`LaTeXLexer`)
- Escaneo carácter a carácter mediante puntero indexado (`cursor`, `line`, `col`).
- Detección precisa de secuencias de escape `\`, modo matemático `$ ... $`, `$$ ... $$`, `\[ ... \]`, `\begin{equation} ... \end{equation}` y delimitadores `{`, `}`, `[`, `]`.
- Complejidad temporal: $O(N)$ con respecto al tamaño del texto.

### 3. Parser Recursivo Descendente (`LaTeXParser`)
- Consume tokens y produce un árbol `DocumentNode`.
- Estructura preámbulo vs cuerpo del documento (`\begin{document} ... \end{document}`).
- Mapea macros estándar (`\section`, `\textbf`, `\emph`, etc.) a sus nodos semánticos correspondientes.
- Cualquier macro o construcción no soportada visualmente se encapsula como `UnknownBlockNode` preservando el texto original exacto.

### 4. Serializador Idempotente (`LaTeXSerializer`)
- Recorre recursivamente el AST y reconstruye el string LaTeX.
- `UnknownBlockNode` emite su propiedad `rawContent` sin alteraciones de espaciado o sangría.
