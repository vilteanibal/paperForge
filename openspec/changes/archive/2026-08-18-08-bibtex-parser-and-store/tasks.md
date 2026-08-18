# Tareas de Implementación: 08-bibtex-parser-and-store

- [x] 1. Crear contrato `BibTeXParserInterface` y DTO `BibEntryDTO` en `app/Contracts/` y `app/DTOs/`.
- [x] 2. Implementar servicio de parseo tolerante a fallos `BibTeXParser` en `app/Services/Bibliography/BibTeXParser.php`.
- [x] 3. Implementar controlador `BibliographyController` y registrar la ruta `GET /api/projects/{project}/bibliography` en `routes/api.php`.
- [x] 4. Crear tipos TypeScript en `resources/js/types/bibliography.d.ts` y store Zustand en `resources/js/stores/useBibliographyStore.ts`.
- [x] 5. Crear batería de pruebas Pest en `tests/Unit/Services/BibTeXParserTest.php` y `tests/Feature/Http/BibliographyControllerTest.php`.
- [x] 6. Crear pruebas unitarias Vitest en `resources/js/stores/__tests__/useBibliographyStore.test.ts`.
- [x] 7. Crear el registro de decisión de arquitectura en `docs/architecture/decisions/0008-fault-tolerant-bibtex-parsing.md`.
- [x] 8. Ejecutar el pipeline `composer run qa` validando 100% de éxito.
