# ADR-0009: IntelliSense Científico y Autocompletado en Monaco Editor

**Fecha:** 2026-08-18  
**Estado:** Aprobado  
**Decisores:** Principal Language Server Architect, Editor Integration Specialist  
**Contexto:** paperForge V2 (Arquitectura Científica)

---

## Contexto del Problema
La redacción académica en LaTeX requiere el uso constante de citas bibliográficas (`\cite`), referencias a etiquetas (`\ref`, `\eqref`) y bloques estructurales (`\begin{...}`). Forzar al usuario a recordar claves exactas o buscar en archivos independientes ralentiza el flujo de trabajo. Sin embargo, realizar consultas asíncronas lentas o suscripciones reactivas pesadas dentro de los callbacks de completado de Monaco puede provocar tartamudeo (*typing lag*) y violar el estándar de 60 FPS.

## Decisión de Arquitectura
1. **Proveedores Modulares e Independientes:**
   - Se divide el subsistema en 4 proveedores especializados:
     - `citationProvider`: Conectado a `useBibliographyStore`.
     - `referenceProvider`: Conectado a `useEditorStore` y `labelExtractor`.
     - `environmentProvider`: Snippets tabulados para entornos estándar.
     - `macroProvider`: Comandos comunes LaTeX.
2. **Acceso a Memoria Sincrónico $O(1)$:**
   - Los proveedores leen directamente el estado en memoria mediante `getState()`, sin dependencias reactivas ni re-renderizado de componentes.
3. **Cálculo Dinámico de Rangos:**
   - Cada sugerencia calcula su `Range` de reemplazo desde el carácter delimitador (`{` o `\`) hasta la columna actual del cursor, evitando duplicaciones de prefijos.
4. **Snippets con Cierre Automático:**
   - Los entornos se expanden automáticamente con su correspondiente `\end{...}` utilizando `CompletionItemInsertTextRule.InsertAsSnippet` y tabstops.

## Consecuencias
- **Positivas:** Escritura fluida e instantánea, autocompletado enriquecido con metadatos y cero duplicación de texto.
- **Verificación:** Batería de pruebas en Vitest (`completions.test.ts`) y pipeline `composer run qa`.
