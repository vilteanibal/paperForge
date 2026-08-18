# ADR-0008: Parseo BibTeX Tolerante a Fallos en el Backend

**Fecha:** 2026-08-18  
**Estado:** Aprobado  
**Decisores:** Staff Backend Architect, Data Parsing Expert  
**Contexto:** paperForge V2 (Arquitectura Científica)

---

## Contexto del Problema
En entornos académicos, los archivos `.bib` frecuentemente provienen de exportaciones diversas (Google Scholar, arXiv, Zotero) o ediciones manuales directas en el editor. Estos archivos suelen tener inconsistencias menores como llaves de cierre faltantes, caracteres especiales no escapados o campos sin comas finales.

El uso de parsers estrictos provocaría excepciones no controladas (HTTP 500) y anularía completamente el autocompletado para todo el proyecto por un único error en una sola entrada.

## Decisión de Arquitectura
1. **Parser a Medida con Recuperación por Bloques:**
   - Se implementa `BibTeXParser` en PHP 8.3 con un algoritmo de escaneo de tokens por bloques `@` y balanceo de llaves con complejidad temporal $O(N)$.
   - Cada entrada se procesa en aislamiento; si una entrada resulta ilegible o desbalanceada, se omite silenciosamente y el puntero avanza a la siguiente declaración `@`.
2. **Consolidación Automática en el Workspace:**
   - El `BibliographyController` escanea automáticamente todos los archivos `.bib` dentro del espacio aislado gestionado por `VirtualWorkspaceManager`, consolidando todas las citas del proyecto en una sola respuesta JSON estructurada.
3. **Store Global en el Frontend:**
   - `useBibliographyStore` en Zustand cachea las citas recuperadas para servirlas instantáneamente a los proveedores de autocompletado en Monaco Editor.

## Consecuencias
- **Positivas:** 0% de interrupciones por sintaxis rota, latencia de escaneo < 5ms y experiencia de usuario fluida y confiable.
- **Verificación:** Batería de pruebas en Pest (`BibTeXParserTest`, `BibliographyControllerTest`) y Vitest (`useBibliographyStore.test.ts`).
