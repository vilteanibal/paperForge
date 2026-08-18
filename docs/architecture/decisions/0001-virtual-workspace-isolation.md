# ADR-0001: Aislamiento Zero-Trust del Virtual Workspace

**Fecha:** 2026-08-17  
**Estado:** Aprobado  
**Decisores:** Staff Security Architect, Principal Lead Engineer  
**Contexto:** paperForge (Editor LaTeX Local-First)

---

## Contexto del Problema
paperForge permite a los usuarios crear, editar, subir y compilar documentos LaTeX locales. Un usuario o archivo malicioso importado podría intentar acceder o sobreescribir archivos confidenciales del host (como `.env`, claves SSH, archivos del sistema operativo o configuraciones de bases de datos) mediante:
1. Secuencias de escape en nombres de ruta (`../`, `....//`).
2. Rutas absolutas del sistema de archivos (`/etc/passwd`, `C:\Windows\`).
3. Inyecciones de bytes nulos (`\0`).
4. Enlaces simbólicos (*symlinks*) dirigidos hacia el exterior de la carpeta del proyecto.

## Decisión de Arquitectura
1. **Autoridad Única de I/O:** Se centraliza todo acceso al sistema de archivos en el servicio `VirtualWorkspaceManager` implementando `WorkspaceManagerInterface`. Ningún controlador o clase externa puede invocar directamente `File::get` o funciones de bajo nivel de PHP.
2. **Confinamiento de Espacio de Trabajo:** Cada proyecto reside de forma estricta en su propio subdirectorio aislado: `storage/app/projects/{uuid}`.
3. **Validación Sintáctica Previa:**
   - Rechazo fulminante de cadenas con bytes nulos (`\0`).
   - Rechazo de prefijos de ruta absoluta (`/`, `\`).
   - Rechazo de secuencias relativas de escape (`..`, `.`).
4. **Validación Canónica en Tiempo de Ejecución:**
   - Ejecución de `realpath()` sobre la ruta candidata.
   - Aserción mandatoria `str_starts_with($resolvedPath, $projectRootRealpath)`.
   - Inspección de `is_link()` para garantizar que enlaces simbólicos no apunten fuera de la frontera del sandbox.
5. **Jerarquía de Excepciones Segura:** Disparo de `PathOutOfBoundsException` (HTTP 403) e `InvalidSymlinkException` (HTTP 403) sin exponer rutas físicas del servidor.

## Consecuencias
- **Positivas:** Eliminación completa de vectores de *Path Traversal* (CWE-22) y *Symlink Following* (CWE-59).
- **Verificación:** Suite de pruebas automatizadas en Pest PHP con 100% de cobertura en vectores de inyección y happy paths.
