# Tareas de Implementación: 02-tex-compiler-orchestration

- [x] 1. Crear jerarquía de excepciones en `app/Exceptions/` (`CompilationFailedException`, `CompilerTimeoutException`, `CompilerBinaryNotFoundException`).
- [x] 2. Crear DTOs inmutables en `app/DTOs/` (`LaTeXDiagnosticDTO`, `CompileResultDTO`) e interfaces gemelas en `resources/js/types/compiler.d.ts`.
- [x] 3. Crear interfaces de contratos en `app/Contracts/` (`CompilerOrchestratorInterface`, `TeXBinaryResolverInterface`).
- [x] 4. Implementar `App\Services\Compiler\TeXBinaryResolver.php` con pruebas unitarias en `tests/Unit/Services/TeXBinaryResolverTest.php`.
- [x] 5. Implementar `App\Services\Compiler\LaTeXLogParser.php` con pruebas unitarias exhaustivas en `tests/Unit/Services/LaTeXLogParserTest.php`.
- [x] 6. Implementar el servicio central `App\Services\Compiler\TexLiveOrchestrator.php` con inyección forzosa de `-no-shell-escape` y pruebas de integración en `tests/Feature/Compiler/TexLiveOrchestratorTest.php`.
- [x] 7. Crear el registro de decisión de arquitectura en `docs/architecture/decisions/0002-tex-live-sandboxing.md`.
- [x] 8. Ejecutar formateo con `vendor/bin/pint --format agent` y verificación con `php artisan test --compact`.
