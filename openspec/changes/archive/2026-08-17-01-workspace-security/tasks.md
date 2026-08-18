# Tareas de Implementación: 01-workspace-security

- [x] 1. Crear jerarquía de excepciones en `app/Exceptions/` (`PathOutOfBoundsException`, `InvalidSymlinkException`, `ProjectNotFoundException`, `FileOperationException`).
- [x] 2. Crear DTOs inmutables en `app/DTOs/` (`FileMetadataDTO`, `WorkspaceTreeDTO`) y tipos gemelos en `resources/js/types/workspace.d.ts`.
- [x] 3. Crear interfaz `app/Contracts/WorkspaceManagerInterface.php`.
- [x] 4. Crear suite de pruebas TDD en `tests/Unit/Services/VirtualWorkspaceManagerTest.php` con casos de happy path y vectores de ataque.
- [x] 5. Implementar el servicio `App\Services\Workspace\VirtualWorkspaceManager.php` hasta que todos los tests pasen al 100%.
- [x] 6. Crear el registro de decisión de arquitectura en `docs/architecture/decisions/0001-virtual-workspace-isolation.md`.
- [x] 7. Ejecutar formateo con `vendor/bin/pint --format agent` y verificación con `php artisan test --compact`.
