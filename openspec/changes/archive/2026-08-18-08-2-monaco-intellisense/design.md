# Diseño Técnico: 08-2-monaco-intellisense

## Arquitectura de Componentes

### 1. Extractor de Etiquetas (`labelExtractor.ts`)
- Recorre el árbol AST en memoria (`SectionNode`, `MathBlockNode`, `UnknownBlockNode`) y complementa con un escaneo regex lineal $O(N)$ sobre `rawCode` para detectar `\label{<id>}`.
- Retorna un conjunto ordenado sin duplicados de identificadores (`string[]`).

### 2. Proveedores de Completado en Monaco (`completions/`)
- `citationProvider.ts`:
  - Detecta contexto `\\(?:cite|citep|citet|nocite|parencite)\*?\{([^}]*)$`.
  - Lee `useBibliographyStore.getState().entries` de forma sincrónica $O(1)$.
  - Genera sugerencias con `kind: Reference`, tarjeta Markdown de detalles y reemplazo preciso del prefijo.
- `referenceProvider.ts`:
  - Detecta contexto `\\(?:ref|eqref|autoref|pageref)\*?\{([^}]*)$`.
  - Sugiere etiquetas extraídas con `kind: Constant`.
- `environmentProvider.ts`:
  - Detecta contexto `\\begin\{([^}]*)$`.
  - Sugiere entornos (`equation`, `align`, `figure`, `table`, `itemize`, `enumerate`, `abstract`, `proof`, `theorem`, `tabular`, `bmatrix`) usando `InsertAsSnippet` con cuerpo `\begin{<env>}\n\t$0\n\\end{<env>}`.
- `macroProvider.ts`:
  - Sugiere comandos comunes de LaTeX con placeholders (`\section{$1}`, `\frac{$1}{$2}`, `\textbf{$1}`, etc.).

### 3. Orquestador de Registro y Ciclo de Vida (`registerCompletions.ts`)
- Registra el proveedor global mediante `monaco.languages.registerCompletionItemProvider('latex', ...)`.
- Asocia caracteres disparadores: `triggerCharacters: ['{', '\\']`.
- Retorna un manejador desechable (`IDisposable`) para limpiar el registro al desmontar el editor.
