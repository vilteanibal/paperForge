# Especificación: IntelliSense Científico y Autocompletado en Monaco

## 1. Contexto y Propósito
paperForge provee autocompletado inteligente integrado en Monaco Editor para citas bibliográficas (`\cite`), referencias cruzadas (`\ref`, `\eqref`), entornos LaTeX tabulados con cierre automático (`\begin{`) y macros estándar.

## 2. Invariantes de Rendimiento y Rango
- **Acceso a Memoria Sincrónico $O(1)$:** Las consultas a bibliografía (`useBibliographyStore`) y AST/código (`useEditorStore`) se efectúan sincrónicamente mediante `getState()`, sin introducir llamadas asíncronas ni re-renderizados en React.
- **Cálculo Dinámico de Rangos:** Las sugerencias reemplazan con precisión la palabra escrita hasta el cursor, previniendo duplicaciones de prefijos.
- **Snippets con Cierre Automático:** Los entornos LaTeX insertan snippets formateados con tabstops (`$0`, `$1`) y la cláusula `\end{<env>}` de cierre.

## 3. Módulos y Componentes
- **Tipos y Contexto:** `resources/js/editor/monaco/completions/types.ts`
- **Extractor de Etiquetas:** `resources/js/editor/monaco/completions/labelExtractor.ts`
- **Proveedores de Completado:** `citationProvider.ts`, `referenceProvider.ts`, `environmentProvider.ts`, `macroProvider.ts`
- **Orquestador de Registro:** `registerCompletions.ts`
