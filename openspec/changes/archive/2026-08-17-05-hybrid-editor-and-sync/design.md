# Diseño Técnico: 05-hybrid-editor-and-sync

## Arquitectura de Componentes

### 1. Estado Reactivo y Origin Tracking (Zustand)
- `useEditorStore`:
  - Estado:
    - `rawCode: string` (Código fuente actual)
    - `ast: DocumentNode | null` (Árbol sintáctico sincronizado)
    - `activeMode: 'code' | 'visual' | 'split'`
    - `lastSource: 'code' | 'visual' | 'disk' | 'none'`
    - `isDirty: boolean`
    - `filePath: string`
  - Acciones:
    - `initFile(filePath: string, content: string)`
    - `updateFromCode(code: string)`: Si `lastSource === 'visual'`, omite parseo redundante. Parsea con `parse(code)` y actualiza `ast`.
    - `updateFromVisual(ast: DocumentNode)`: Serializa con `serialize(ast)` y actualiza `rawCode`.
    - `setMode(mode: 'code' | 'visual' | 'split')`

### 2. Integración Monaco Editor
- `MonacoCodeEditor`:
  - Renderiza `<Editor />` con `language="latex"`.
  - Escucha `onChange` y despacha `updateFromCode`.
  - Configuración: `minimap: { enabled: false }`, `wordWrap: 'on'`, `lineNumbers: 'on'`, `fontSize: 14`, `automaticLayout: true`.

### 3. Editor Visual WYSIWYG
- `VisualEditor`:
  - Recorre `ast.children` y renderiza componentes de nodo memoizados con `React.memo`:
    - `SectionNodeView`: Título editable con jerarquía $H_1$ a $H_6$ y renderizado de hijos.
    - `ParagraphNodeView`: Párrafo editable con soporte de texto y formateo inline.
    - `MathNodeView`: Renderizado de fórmulas inline y bloques matemáticos.
    - `UnknownBlockNodeView`: Bloque inmutable estilizado como tarjeta protegida de código que no permite desestructuración accidental.
  - Al editar un nodo, clona el AST y llama a `updateFromVisual(newAst)`.

### 4. Layout y Split View
- `EditorLayout`: Contenedor responsivo con panel izquierdo (Árbol de Archivos), centro (Monaco / Visual / Split) y derecho (Visor PDF / Diagnósticos).
- `ModeToggle`: Botones con iconos para alternar entre *Code*, *Visual* y *Split*.
