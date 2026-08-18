# ADR-0003: Validación en Frontera (*Border Patrol*) y Controladores Delgados

**Fecha:** 2026-08-17  
**Estado:** Aprobado  
**Decisores:** Staff API Architect, Security Gatekeeper  
**Contexto:** paperForge (Editor LaTeX Local-First)

---

## Contexto del Problema
En aplicaciones web locales que ofrecen interacción directa con el sistema de archivos y subprocesos de compilación, permitir que datos no sanitizados lleguen a la capa de controladores crea riesgos de degradación de seguridad, acoplamiento excesivo y fuga de responsabilidades.

## Decisión de Arquitectura
1. **Defensa en Profundidad (*Border Patrol Validation*):**
   - Se implementa la regla de validación custom `SafeRelativePathRule` aplicada en todos los Form Requests que reciben rutas.
   - Cualquier petición HTTP con cadenas maliciosas (`../`, prefijos absolutos `/`, `\`, caracteres nulos `\0`) es rechazada de inmediato en el límite HTTP con código `422 Unprocessable Entity` antes de tocar controladores o servicios.
2. **Controladores Delgados (*Thin Controllers*):**
   - Los controladores (`ProjectController`, `FileSystemController`, `CompilerController`) carecen de lógica de negocio o accesos directos al disco. Su única responsabilidad es recibir Form Requests validados, delegar en los servicios de dominio (`VirtualWorkspaceManager`, `TexLiveOrchestrator`) y retornar vistas de `Inertia::render()` o respuestas `JsonResponse`.
3. **Serialización Uniforme:**
   - La información de los proyectos y sus configuraciones se expone exclusivamente mediante `ProjectResource`, garantizando fechas ISO8601 estandarizadas y protegiendo campos internos.
4. **Protección de Tráfico Local:**
   - Se configuran limitadores de tasa `throttle:local_api` (500 req/min) y `throttle:compiler_api` (60 req/min).

## Consecuencias
- **Positivas:** Desacoplamiento total, validación robusta y trazabilidad completa de peticiones.
- **Verificación:** Pruebas unitarias y de integración en Pest PHP con 100% de éxito en todos los endpoints HTTP.
