# Especificación: API Local, Form Requests & Controladores

## 1. Contexto y Propósito
paperForge expone su motor de sistema de archivos virtual y su orquestador de compilación TeX Live a través de una API local y vistas de Inertia.js protegidas por validación en frontera (*Border Patrol*).

## 2. Invariantes de Seguridad y Validación
- **Defensa en Frontera (Border Patrol):** Validación estricta a nivel HTTP mediante `SafeRelativePathRule` en todos los Form Requests que reciben rutas, bloqueando `..`, prefijos absolutos `/`, `\`, caracteres nulos `\0` y segmentos `.` con código `422 Unprocessable Entity`.
- **Controladores Delgados (*Thin Controllers*):** `ProjectController`, `FileSystemController` y `CompilerController` delegan toda la lógica a los servicios de dominio (`VirtualWorkspaceManager`, `TexLiveOrchestrator`) y recursos API (`ProjectResource`).
- **Control de Tráfico Local:** Limitadores de tasa dedicados `throttle:local_api` (500 req/min) y `throttle:compiler_api` (60 req/min).

## 3. Endpoints Principales
- **Vistas Web (Inertia):**
  - `GET /` o `GET /dashboard` -> `ProjectController@index`
  - `GET /projects/{project}` -> `ProjectController@show`
- **API REST (JSON):**
  - `GET /api/projects`, `POST /api/projects`, `GET /api/projects/{id}`, `DELETE /api/projects/{id}`
  - `GET /api/fs/{project}/tree`, `POST /api/fs/{project}/read`, `POST /api/fs/{project}/write`, `POST /api/fs/{project}/delete`
  - `POST /api/compile/{project}`, `GET /api/compile/{project}/pdf`
