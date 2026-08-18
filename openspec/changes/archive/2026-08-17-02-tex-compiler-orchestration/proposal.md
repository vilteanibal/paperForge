# Propuesta de Cambio: 02-tex-compiler-orchestration

## Propósito
Implementar la capa de orquestación segura del compilador TeX Live (pdflatex, xelatex, lualatex) y el analizador estructurado de logs de diagnóstico de LaTeX para paperForge.

## Alcance
1. Jerarquía de excepciones de compilación (`CompilationFailedException`, `CompilerTimeoutException`, `CompilerBinaryNotFoundException`).
2. DTOs inmutables para el resultado de compilación (`CompileResultDTO`) y diagnósticos (`LaTeXDiagnosticDTO`).
3. Servicio de resolución de binarios `TeXBinaryResolver` sin invocaciones inseguras de shell.
4. Analizador de logs `LaTeXLogParser` para extraer errores y advertencias línea a línea.
5. Orquestador central `TexLiveOrchestrator` confinado mediante `Symfony\Component\Process\Process` con banderas obligatorias `-no-shell-escape`, `-interaction=nonstopmode`, `-halt-on-error`, `-file-line-error`, `cwd` restringido y timeout de 60s.
6. Batería de pruebas Pest PHP para happy path, mitigación de RCE (`\write18`), control de DoS por bucles infinitos y parseo de logs.
