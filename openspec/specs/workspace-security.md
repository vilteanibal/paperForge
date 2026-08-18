# Especificación: Virtual Workspace & Security

## 1. Contexto y Propósito
paperForge opera sobre un sistema de archivos virtual confinado (`storage/app/projects/{uuid}`) donde se almacenan y gestionan los documentos y recursos LaTeX de cada proyecto de forma aislada y segura.

## 2. Invariantes de Seguridad
- **Aislamiento Zero-Trust:** Todo acceso I/O es mediado por `VirtualWorkspaceManager` implementando `WorkspaceManagerInterface`.
- **Validación Canónica:** Se ejecuta `realpath()` y se comprueba estrictamente que `str_starts_with($resolvedPath, $projectRootRealpath)` sea verdadero.
- **Protección contra Traversal:** Rechazo inmediato de secuencias `..`, prefijos absolutos `/` o `\`, y caracteres nulos `\0` mediante `PathOutOfBoundsException` (HTTP 403).
- **Protección contra Symlinks:** Bloqueo de enlaces simbólicos que resuelvan fuera del sandbox mediante `InvalidSymlinkException` (HTTP 403).

## 3. Interfaces y Contratos
- **Contrato PHP:** `App\Contracts\WorkspaceManagerInterface`
- **DTOs:** `App\DTOs\FileMetadataDTO`, `App\DTOs\WorkspaceTreeDTO`
- **Contrato TypeScript:** `resources/js/types/workspace.d.ts` (`FileMetadata`, `WorkspaceTree`)
