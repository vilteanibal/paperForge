# Diseño Técnico: 08-bibtex-parser-and-store

## Arquitectura de Componentes

### 1. Motor de Parseo BibTeX en PHP (`BibTeXParser`)
- Algoritmo de parseo: Escáner por bloques basado en tokens `@entryType{key, ...}`.
- Manejo de llaves anidadas y comillas en campos: `{Title with {Nested} Braces}` o `"Author Name"`.
- Tolerancia a fallos: Si una entrada contiene llaves no balanceadas o sintaxis inválida, se descarta únicamente esa entrada mediante `try/catch` interno o recuperación de cursor, continuando con el resto del archivo sin lanzar un Error 500.

### 2. Controlador de Bibliografía (`BibliographyController`)
- Escanea el directorio del workspace mediante `VirtualWorkspaceManager` buscando todos los archivos con extensión `.bib`.
- Concatena y parsea los contenidos asegurando lectura segura dentro del límite canónico.
- Retorna una colección de `BibEntryDTO` en JSON con status 200.

### 3. Store de Bibliografía en Frontend (`useBibliographyStore`)
- Estado en Zustand: `entries: BibEntry[]`, `isLoading: boolean`, `error: string | null`.
- Acción: `fetchEntries(projectId)` que consulta `GET /api/projects/{projectId}/bibliography`.
