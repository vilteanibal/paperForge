# Especificación: Parseo BibTeX y Gestión de Bibliografía

## 1. Contexto y Propósito
paperForge integra un servicio de extracción bibliográfica tolerante a fallos para procesar archivos `.bib` en el workspace del proyecto y suministrar citas estructuradas al frontend para autocompletado interactivo.

## 2. Invariantes de Parseo y Seguridad
- **Tolerancia a Fallos ($O(N)$):** Errores sintácticos en una entrada `.bib` (ej. llaves desbalanceadas) provocan el descarte únicamente de esa entrada, garantizando que el escáner se recupere en la siguiente declaración `@` sin lanzar excepciones no controladas ni bloquear el servidor.
- **Aislamiento Virtual:** El escaneo de archivos `.bib` se realiza exclusivamente dentro del sandbox local del proyecto mediante `VirtualWorkspaceManager`.
- **Acceso No Reactivo a Memoria:** El frontend expone las citas mediante `useBibliographyStore` para alimentar los proveedores de completado en Monaco en tiempo constante $O(1)$.

## 3. Módulos y Componentes
- **Contrato e Implementación:** `app/Contracts/BibTeXParserInterface.php`, `app/Services/Bibliography/BibTeXParser.php`
- **DTO Inmutable:** `app/DTOs/BibEntryDTO.php`
- **Controlador y Rutas:** `app/Http/Controllers/BibliographyController.php`, `GET /api/projects/{project}/bibliography`
- **Store Frontend:** `resources/js/stores/useBibliographyStore.ts`
