# ADR-0007: Experiencia de Usuario Unificada y Pipeline de Calidad Estricto (*QA Gate*)

**Fecha:** 2026-08-17  
**Estado:** Aprobado  
**Decisores:** Staff Fullstack Architect, UX/DX Lead  
**Contexto:** paperForge (Editor LaTeX Local-First)

---

## Contexto del Problema
La integración final de paperForge reúne múltiples subsistemas complejos:
1. Sandboxing y aislamiento virtual del sistema de archivos local.
2. Orquestador de compilación TeX Live con defensas Anti-RCE y Anti-DoS.
3. Motor AST de LaTeX bidireccional tolerante a fallos en TypeScript puro.
4. Editor híbrido sincrónico (Monaco + Visual WYSIWYG).
5. Visor de PDF offline y panel de diagnósticos con saltos de línea interactivos.
6. Gestión de proyectos y explorador de archivos reactivo.

Sin una compuerta de calidad estricta e inmutable, futuras iteraciones o modificaciones pueden introducir regresiones silenciadas en el backend o en el frontend.

## Decisión de Arquitectura
1. **Centralización de Atajos de Teclado:**
   - El hook `useGlobalShortcuts` intercepta a nivel de ventana los comandos `Ctrl+S`/`Cmd+S` (Guardar archivo) y `Ctrl+Enter`/`Cmd+Enter`/`Ctrl+B` (Compilar), invocando `e.preventDefault()` y `e.stopPropagation()` para neutralizar los diálogos nativos del navegador.
2. **Explorador de Archivos Conectado:**
   - El componente `FileTree` refleja fielmente el árbol de disco emitido por `VirtualWorkspaceManager` y maneja la creación y eliminación segura de archivos.
3. **Pipeline de Calidad Unificado (`composer run qa`):**
   - Se formaliza un comando maestro de auditoría continua que ejecuta:
     - Formateo estricto con Laravel Pint.
     - Análisis estático PHPStan Nivel 8 (0 errores permitidos).
     - Comprobación de tipos en TypeScript (`tsc --noEmit`, 0 errores permitidos).
     - Suite completa de frontend en Vitest (100% verde).
     - Suite completa de backend en Pest PHP (100% verde).

## Consecuencias
- **Positivas:** 100% de confiabilidad, rendimiento fluido local-first y total blindaje contra vulnerabilidades de seguridad o regresiones de tipado.
- **Verificación:** Certificación exitosa de todos los checks en `composer run qa` y compilación limpia con `npm run build`.
