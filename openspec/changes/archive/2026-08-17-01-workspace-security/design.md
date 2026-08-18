# Diseño Técnico: 01-workspace-security

## Arquitectura de Componentes

### 1. Jerarquía de Excepciones
- `App\Exceptions\PathOutOfBoundsException`: HTTP 403 Forbidden. Lanzada cuando una ruta resuelta no está contenida en el sandbox del proyecto.
- `App\Exceptions\InvalidSymlinkException`: HTTP 403 Forbidden. Lanzada cuando un enlace simbólico apunta fuera del sandbox.
- `App\Exceptions\ProjectNotFoundException`: HTTP 404 Not Found.
- `App\Exceptions\FileOperationException`: HTTP 422 / 500.

### 2. Contratos y DTOs
- `App\DTOs\FileMetadataDTO`: Inmutable (`readonly class`), campos: `string $path`, `string $name`, `string $extension`, `int $sizeBytes`, `string $mimeType`, `int $lastModified`, `bool $isDir`.
- `App\DTOs\WorkspaceTreeDTO`: Inmutable, campos: `string $projectId`, `string $rootPath`, `array $nodes`.
- `App\Contracts\WorkspaceManagerInterface`: Define `read`, `write`, `delete`, `tree`, `createDirectory`, `deleteDirectory`, `exists`.

### 3. Servicio `VirtualWorkspaceManager`
- Sandbox path: `storage_path('app/projects/' . $project->id)`.
- Algoritmo de resolución segura:
  1. Sanitizar entrada contra null bytes (`\0`) y control chars.
  2. Bloquear strings que inicien con `/` o contengan `../`.
  3. Resolver ruta absoluta candidata: `$root . '/' . ltrim($relativePath, '/')`.
  4. Ejecutar `realpath()` sobre el archivo o sobre el directorio padre si el archivo aún no existe.
  5. Validar que `str_starts_with($resolved, $rootRealpath)` sea estricto.
  6. Comprobar que `is_link()` no apunte a un target fuera de `$rootRealpath`.

### 4. Contrato TypeScript Gemelo
- `resources/js/types/workspace.d.ts` con interfaces exportadas coincidentes con los DTOs PHP.
