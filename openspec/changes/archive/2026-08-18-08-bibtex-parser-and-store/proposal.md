# Propuesta de Cambio: 08-bibtex-parser-and-store

## Propósito
Implementar un motor de parseo BibTeX tolerante a fallos (`BibTeXParser`) en el backend y un store reactivo en Zustand (`useBibliographyStore`) en el frontend para extraer y servir metadatos de citas bibliográficas (`.bib`) de manera segura, sin riesgo de ReDoS ni caídas por sintaxis malformada.

## Alcance
1. Contrato `BibTeXParserInterface` y servicio `BibTeXParser` con procesamiento lineal y recuperación ante errores de sintaxis.
2. DTO inmutable `BibEntryDTO` con serialización a array JSON.
3. Controlador `BibliographyController` y ruta `GET /api/projects/{project}/bibliography` con rate limiting local (`throttle:local_api`).
4. Tipos TypeScript en `resources/js/types/bibliography.d.ts` y store global en `resources/js/stores/useBibliographyStore.ts`.
5. Pruebas unitarias y de integración en Pest PHP y Vitest.
