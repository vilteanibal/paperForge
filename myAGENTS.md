# AGENTS.md — paperForge
## Documento de control para agentes autónomos (Google Antigravity / Cursor / Windsurf)

### COMANDOS DE INICIALIZACIÓN (ejecutar en orden)
```bash
composer install
cp .env.example .env
touch database/database.sqlite
php artisan key:generate
php artisan migrate --seed
npm install && npm run build

```

### ESTRUCTURA DE CARPETAS OBLIGATORIA

```
app/
├── DTOs/             # CompileResultDTO, FileMetadataDTO
├── Exceptions/       # PathOutOfBoundsException, CompilationFailedException
├── Http/
│   ├── Controllers/  # Orquestadores (ProjectController, FileSystemController, CompilerController)
│   ├── Requests/     # Anti-path-traversal validation rules
│   └── Resources/
├── Models/           # Project, ProjectSetting (SQLite)
└── Services/
    ├── Compiler/     # TexLiveOrchestrator
    └── Workspace/    # VirtualWorkspaceManager

resources/js/
├── components/       # Componentes visuales (shadcn/ui)
├── editor/           # Lógica central
│   ├── ast/          # LaTeX a JSON AST Parser (TypeScript)
│   ├── monaco/       # Integración Monaco Editor
│   └── visual/       # Renderizador WYSIWYG
├── stores/           # Zustand para estado bidireccional
└── pages/            # Inertia Views

```

### CONVENCIONES OBLIGATORIAS

* **Frontend pesando:** El backend Laravel se limita a proveer acceso a los archivos y arrancar el proceso `pdflatex`. TODO el procesamiento de qué significa el texto LaTeX, cómo se divide y cómo se pinta, se hace en `resources/js/editor/ast/`.
* **Arquitectura Local:** La aplicación es web pero se ejecuta localmente. Las latencias de red son nulas, pero el I/O de disco debe minimizarse.

### POLÍTICA DE SEGURIDAD (OFFLINE)

* **Aislamiento:** Cualquier ruta que contenga `../` enviada por el frontend debe ser rechazada inmediatamente con 403 Forbidden.
* **Ejecución de procesos:** Se prohíbe el uso de `exec()` o `shell_exec()`. Usar estrictamente `Symfony\Component\Process\Process` con un array de argumentos controlados y timeout explícito.

### POLÍTICA DE TESTS (DOBLE COBERTURA)

* **Backend:** Pest PHP (`php artisan test`). Focus en `VirtualWorkspaceManager` y seguridad de paths.
* **Frontend:** Vitest (`npm run test`). Focus en el parser AST y sincronía sin pérdida de datos.
