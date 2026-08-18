# Propuesta de Cambio: 08-2-monaco-intellisense

## Propósito
Implementar un subsistema modular de autocompletado inteligente (*IntelliSense Científico*) en Monaco Editor para paperForge, brindando sugerencias interactivas de citas BibTeX (`\cite{`), referencias cruzadas a etiquetas AST (`\ref{`, `\eqref{`), entornos estructurados con snippets tabulados (`\begin{`) y macros matemáticas/estructurales frecuentes.

## Alcance
1. Módulo extractor de etiquetas (`labelExtractor.ts`) que analiza tanto nodos AST en memoria como declaraciones `\label{...}` en código fuente.
2. Proveedores de completado dedicados para citas BibTeX (`citationProvider.ts`), referencias cruzadas (`referenceProvider.ts`), entornos con cierre automático (`environmentProvider.ts`) y macros comunes (`macroProvider.ts`).
3. Orquestador de registro del lenguaje LaTeX (`registerCompletions.ts`) con gestión de ciclo de vida e `IDisposable`.
4. Integración del autocompletado en `MonacoCodeEditor.tsx` sin degradación de tasa de refresco ni interferencia con el hilo principal de renderizado.
5. Batería de pruebas unitarias en Vitest (`completions.test.ts`).
