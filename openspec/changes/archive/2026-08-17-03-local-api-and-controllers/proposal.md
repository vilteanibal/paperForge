# Propuesta de Cambio: 03-local-api-and-controllers

## Propósito
Exponer los servicios del Virtual Workspace y el Compilador TeX Live mediante una API local segura, Form Requests con validación estricta y controladores delgados integrados con Inertia.js para el frontend React.

## Alcance
1. Regla de validación personalizada `SafeRelativePathRule` para interceptar ataques de Path Traversal a nivel de payload HTTP (Border Patrol).
2. Form Requests tipados para operaciones de proyectos, sistema de archivos y compilación.
3. Recurso API `ProjectResource` para serialización estandarizada de proyectos y configuraciones.
4. Controladores delgados `ProjectController`, `FileSystemController` y `CompilerController`.
5. Definición de rutas nombradas en `routes/web.php` y `routes/api.php` con rate limiting local (`throttle`).
6. Batería de pruebas Pest PHP unitarias para la regla de validación y de integración (Feature) para todos los endpoints HTTP.
