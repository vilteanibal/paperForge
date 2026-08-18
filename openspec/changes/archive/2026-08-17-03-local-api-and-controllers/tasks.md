# Tareas de Implementación: 03-local-api-and-controllers

- [x] 1. Crear regla de validación `App\Rules\SafeRelativePathRule.php` con suite de pruebas unitarias en `tests/Unit/Rules/SafeRelativePathRuleTest.php`.
- [x] 2. Crear los 6 Form Requests en `app/Http/Requests/` (`StoreProjectRequest`, `ImportProjectRequest`, `ReadFileRequest`, `WriteFileRequest`, `DeleteFileRequest`, `CompileRequest`).
- [x] 3. Crear recurso API `App\Http\Resources\ProjectResource.php`.
- [x] 4. Implementar los controladores delgados en `app/Http/Controllers/` (`ProjectController`, `FileSystemController`, `CompilerController`).
- [x] 5. Configurar el enrutamiento y rate limiters en `routes/web.php`, `routes/api.php` y `bootstrap/app.php`.
- [x] 6. Crear suite de pruebas de integración HTTP (Feature) para todos los endpoints en `tests/Feature/Http/`.
- [x] 7. Crear el registro de decisión de arquitectura en `docs/architecture/decisions/0003-thin-controllers-and-strict-validation.md`.
- [x] 8. Ejecutar formateo con `vendor/bin/pint --format agent` y verificación con `php artisan test --compact`.
