# Especificación: Orquestación TeX Live & Anti-RCE

## 1. Contexto y Propósito
paperForge provee una capa de compilación local y segura para documentos LaTeX (`pdflatex`, `xelatex`, `lualatex`), traduciendo los archivos `.tex` del workspace en binarios PDF y logs estructurados con diagnósticos legibles por el cliente.

## 2. Invariantes de Seguridad y Sandboxing
- **Mitigación Anti-RCE:** Inyección forzosa e inmutable de `-no-shell-escape` en cada compilación para bloquear llamadas externas y macros maliciosas (`\write18`).
- **Mitigación Anti-DoS:** Control de timeout estricto (60 segundos) mediante `Symfony\Component\Process\Process`, abortando loops infinitos con `CompilerTimeoutException` (HTTP 504).
- **Confinamiento de Proceso:** El subproceso opera con su `cwd` establecido estrictamente en la raíz del proyecto (`VirtualWorkspaceManager::getRootPath($project)`).
- **Prohibición de Shell Directo:** Prohibido el uso de `exec()`, `shell_exec()` o concatenaciones de comandos.

## 3. Interfaces y Contratos
- **Contratos PHP:**
  - `App\Contracts\CompilerOrchestratorInterface`
  - `App\Contracts\TeXBinaryResolverInterface`
- **Servicios:**
  - `App\Services\Compiler\TexLiveOrchestrator`
  - `App\Services\Compiler\TeXBinaryResolver`
  - `App\Services\Compiler\LaTeXLogParser`
- **DTOs:**
  - `App\DTOs\CompileResultDTO`
  - `App\DTOs\LaTeXDiagnosticDTO`
- **Contrato TypeScript:** `resources/js/types/compiler.d.ts` (`CompileResult`, `LaTeXDiagnostic`)
