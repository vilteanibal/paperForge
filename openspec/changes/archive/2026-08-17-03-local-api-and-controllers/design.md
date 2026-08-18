# Diseño Técnico: 03-local-api-and-controllers

## Arquitectura de Componentes

### 1. Validación en Frontera (Border Patrol)
- `App\Rules\SafeRelativePathRule`: Implementa `Illuminate\Contracts\Validation\ValidationRule`. Bloquea:
  - Presencia de bytes nulos (`\0`).
  - Prefijos absolutos (`/`, `\`).
  - Secuencias de retroceso (`..`).
  - Referencias relativas (`.`).

### 2. Form Requests
- `StoreProjectRequest`: `name` (required, max 255), `compiler_engine` (nullable, Enum), `main_file` (nullable, SafeRelativePathRule).
- `ImportProjectRequest`: `archive` (required, file, mimes:zip, max 50MB).
- `ReadFileRequest`: `path` (required, SafeRelativePathRule).
- `WriteFileRequest`: `path` (required, SafeRelativePathRule), `content` (required, string).
- `DeleteFileRequest`: `path` (required, SafeRelativePathRule).
- `CompileRequest`: `timeout` (nullable, integer, 1-300).

### 3. API Resources & Controladores
- `ProjectResource`: Serializa `id`, `name`, `storage_path`, `last_opened_at`, `setting`, `created_at`, `updated_at`.
- `ProjectController`:
  - `index()`: Retorna vista Inertia `Dashboard/Index` con proyectos recientes.
  - `store()`: Crea registro en PostgreSQL, inicializa workspace y crea `main.tex` base.
  - `show()`: Actualiza `last_opened_at`, retorna vista Inertia `Editor/Show` con árbol de archivos.
  - `destroy()`: Purga archivos físicos y elimina registro en cascada.
- `FileSystemController`: Endpoints JSON para `read`, `write`, `delete`, `tree`.
- `CompilerController`: Endpoints JSON para `compile` y `downloadPdf` (stream binario).

### 4. Rutas y Rate Limiting
- Agrupadas con prefijos `/api/` y nombres consistentes (`projects.*`, `fs.*`, `compiler.*`).
- Rate limiting local con `throttle:local_api` y `throttle:compiler_api`.
