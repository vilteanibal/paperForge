# Tareas de Implementación: 08-3-synctex-spatial-engine

- [x] 1. Modificar `TexLiveOrchestrator.php` para inyectar `-synctex=1` en todas las compilaciones.
- [x] 2. Crear contrato `SyncTeXParserInterface` y DTOs `SyncTeXForwardDTO` y `SyncTeXReverseDTO`.
- [x] 3. Implementar servicio `SyncTeXParser` con lectura en streaming mediante `gzopen()`.
- [x] 4. Crear Form Requests `ForwardSyncRequest` y `ReverseSyncRequest` con validación `SafeRelativePathRule`.
- [x] 5. Implementar controlador `SyncTeXController` y registrar rutas en `routes/api.php`.
- [x] 6. Crear suite de pruebas Pest en `tests/Unit/Services/SyncTeXParserTest.php` y `tests/Feature/Http/SyncTeXControllerTest.php`.
- [x] 7. Crear el registro de decisión de arquitectura en `docs/architecture/decisions/0010-synctex-spatial-parsing-and-memory-streaming.md`.
- [x] 8. Ejecutar el pipeline `composer run qa` validando 100% de éxito.
