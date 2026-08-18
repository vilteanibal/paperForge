# Diseño Técnico: 02-tex-compiler-orchestration

## Arquitectura de Componentes

### 1. Jerarquía de Excepciones
- `App\Exceptions\CompilationFailedException`: HTTP 422. Lanzada cuando el proceso de compilación retorna código de salida distinto de 0 o no genera el archivo PDF.
- `App\Exceptions\CompilerTimeoutException`: HTTP 504. Lanzada cuando el proceso excede el límite de tiempo (default: 60s).
- `App\Exceptions\CompilerBinaryNotFoundException`: HTTP 500. Lanzada cuando el binario del motor (`pdflatex`, etc.) no está instalado o no es ejecutable en el host.

### 2. Contratos y DTOs
- `App\DTOs\LaTeXDiagnosticDTO`: `public int|null $line`, `public string $type` ('error'|'warning'), `public string $message`, `public string|null $file`.
- `App\DTOs\CompileResultDTO`: `public bool $success`, `public string|null $pdfPath`, `public string $logContent`, `public int $executionTimeMs`, `public array $diagnostics`.
- `resources/js/types/compiler.d.ts`: Interfaces TypeScript exportadas (`LaTeXDiagnostic`, `CompileResult`).

### 3. Servicio `TeXBinaryResolver`
- Verifica ejecutabilidad de binarios en rutas conocidas (`/usr/bin`, `/usr/local/bin`, `/Library/TeX/texbin`, etc.) o mediante `Symfony\Component\Process\ExecutableFinder`.

### 4. Servicio `LaTeXLogParser`
- Expresiones regulares para capturar:
  - `^!\s+(?:LaTeX Error:\s+)?(.+)`
  - `^l\.(\d+)\s+(.+)`
  - `(?:LaTeX Warning|Package \w+ Warning):\s+(.+)`

### 5. Servicio `TexLiveOrchestrator`
- Argumentos inmutables: `[$binary, '-interaction=nonstopmode', '-halt-on-error', '-no-shell-escape', '-file-line-error', $mainFile]`.
- Directorio de trabajo: `VirtualWorkspaceManager::getRootPath($project)`.
- Manejo de excepciones y captura de stdout/stderr/log.
