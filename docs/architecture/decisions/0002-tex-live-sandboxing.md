# ADR-0002: Aislamiento y Banderas Anti-RCE en la Invocación de TeX Live

**Fecha:** 2026-08-17  
**Estado:** Aprobado  
**Decisores:** Staff Security Architect, Principal Lead Engineer  
**Contexto:** paperForge (Editor LaTeX Local-First)

---

## Contexto del Problema
El motor de compilación TeX Live (como `pdflatex`, `xelatex` y `lualatex`) incluye capacidades nativas para interactuar con la shell del sistema operativo a través de comandos como `\write18{...}`. En un entorno donde se procesan documentos LaTeX arbitrarios, permitir el escape a la shell genera un riesgo crítico de **Ejecución Remota de Código (RCE)** (CVSS 10.0). Además, bucles infinitos en macros de LaTeX pueden congelar los procesos del servidor o agotar la CPU del host.

## Decisión de Arquitectura
1. **Invocación Desacoplada y Segura:** Se utiliza exclusivamente `Symfony\Component\Process\Process` pasando los argumentos en forma de array (`list<string>`), eliminando cualquier riesgo de inyección de argumentos de shell. Se prohíbe terminantemente `exec()` o `shell_exec()`.
2. **Inyección Forzosa de Banderas Anti-RCE:**
   - `-no-shell-escape`: Desactiva por completo la ejecución de comandos externos en el sistema operativo.
   - `-interaction=nonstopmode`: Previene que el binario de TeX quede suspendido esperando entrada interactiva por `stdin`.
   - `-halt-on-error`: Fuerza la terminación del proceso ante el primer error crítico de compilación.
   - `-file-line-error`: Estandariza la salida en stdout/log para permitir diagnósticos estructurados por archivo y línea.
3. **Confinamiento de Directorio de Trabajo (`cwd`):** El subproceso se ejecuta de forma estricta dentro del directorio del proyecto (`VirtualWorkspaceManager::getRootPath($project)`).
4. **Control de Timeout Estricto (Anti-DoS):** Límite máximo de ejecución configurable (por defecto 60 segundos), disparando `CompilerTimeoutException` y abortando el subproceso con `SIGKILL` si excede el tiempo límite.
5. **Diagnósticos Estructurados:** Los logs generados se procesan mediante `LaTeXLogParser` para extraer errores y advertencias de forma tipada (`LaTeXDiagnosticDTO`).

## Consecuencias
- **Positivas:** Aislamiento total contra RCE y contención de DoS por consumo desmedido de CPU.
- **Verificación:** Pruebas automatizadas en Pest PHP verificando que `\write18` no ejecute comandos y que bucles infinitos sean abortados a tiempo.
