# PRD — paperForge (Local-First Híbrido)

## Versión: 1.0 | Fecha: 2026-08-15 | Metodología: RAALD v2 CRITICAL

### 1. CONTEXTO SEMÁNTICO DENSO

Sistema local-first offline operando sobre Laravel 13 y Nginx, acoplado vía Inertia.js a un frontend React/TypeScript. El cliente asume la carga computacional pesada integrando un parser AST (Abstract Syntax Tree) para LaTeX en memoria, logrando sincronización bidireccional (Visual ↔ Código vía Monaco Editor) con latencia estricta < 200ms. El backend PHP actúa exclusivamente como motor de I/O seguro, gestionando un Virtual Workspace aislado (`storage/app/projects`) y orquestando un contenedor/proceso de compilación TeX Live sanitizado bajo el principio Zero-Trust para mitigar riesgos de Remote Code Execution (RCE) y Path Traversal derivados de la compilación de archivos `.tex` introducidos por el usuario.

### 2. ESTRELLA DEL NORTE

* **Problema:** Los editores LaTeX tradicionales fuerzan la manipulación de código puro, creando fricción cognitiva frente a procesadores de texto WYSIWYG, mientras que los conversores visuales destruyen la pureza del código fuente `.tex`.
* **Solución:** Un entorno de edición híbrido que renderiza LaTeX visualmente manteniendo el archivo `.tex` original como única fuente de verdad inmutable.
* **Métrica de éxito:** Sincronización bidireccional visual-código validada con latencia < 200ms bajo carga de documentos de 50+ páginas.
* **Dominio crítico:** SÍ (RAALD-CRITICAL). El procesamiento y compilación de archivos `.tex` locales habilita vectores de ataque severos (`\write18`, macros maliciosas).

### 3. ACTORES DEL SISTEMA

| Actor | Descripción | Permisos clave |
| --- | --- | --- |
| LocalUser | Propietario de la instancia local. | Lectura/Escritura en Virtual Workspace, Ejecución de Compilador Sanitizado. |

### 4. HISTORIAS DE USUARIO EJECUTABLES

* **Como** LocalUser **Quiero** importar un directorio de mi disco local al Virtual Workspace **Para** gestionarlo sin alterar mis archivos originales fuera del entorno seguro. **Criterio de aceptación:** El sistema copia el directorio a `storage/app/projects/{uuid}` y bloquea symlinks que apunten fuera del storage.
* **Como** LocalUser **Quiero** editar un texto en el Modo Visual **Para** que se refleje inmediatamente en el Modo Código. **Criterio de aceptación:** El parser AST en React actualiza el nodo correspondiente en el Monaco Editor en < 200ms sin mutar comandos LaTeX no reconocidos.
* **Como** LocalUser **Quiero** compilar mi documento **Para** previsualizar el PDF. **Criterio de aceptación:** Laravel ejecuta TeX Live en un proceso aislado con la flag `-no-shell-escape` y retorna el binario PDF o un DTO de errores en caso de fallo.

### 5. CRITERIOS DE ACEPTACIÓN BINARIOS

* [ ] Latencia de renderizado y sincronización AST < 200ms (verificado vía Vitest Performance API).
* [ ] 100% offline. Cero dependencias de red externa en ejecución normal (verificado apagando interfaces de red).
* [ ] Cobertura de tests Pest PHP ≥ 95% para capas `Services` (Workspace y Compiler).
* [ ] Cobertura Vitest ≥ 90% para lógica de parseo AST en frontend.
* [ ] Ejecución del compilador LaTeX bloquea explícitamente `-shell-escape` y accesos fuera del Virtual Workspace.
* [ ] Invariabilidad de código fuente: Comandos LaTeX no soportados visualmente permanecen intactos en el `.tex` tras guardar.

### 6. ARQUITECTURA DE DATOS

#### Modelos Eloquent (SQLite local exclusivo para metadatos)

* `Project`: id (UUID), name, storage_path, last_opened_at, created_at, updated_at.
* `ProjectSetting`: id, project_id, compiler_engine (pdfLaTeX, XeLaTeX), main_file (default: main.tex).

#### Esquema de Migraciones Críticas

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    storage_path VARCHAR(255) UNIQUE NOT NULL,
    last_opened_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- FK y settings omitidos por brevedad
CREATE INDEX idx_projects_last_opened ON projects(last_opened_at);

```

#### Índices Obligatorios

* `projects` → `last_opened_at` → B-Tree → Ordenamiento rápido para el dashboard "Proyectos Recientes".

### 7. ARQUITECTURA DEL SISTEMA

#### Capas y responsabilidades

* **Frontend (React/Inertia):** Manejo de estado unificado (Zustand/Redux), parseo AST bi-direccional (LaTeX ↔ Visual), Monaco Editor, Visor PDF basado en WebGL/Canvas.
* **Backend (Laravel 13):**
* *Controllers:* Endpoints de API locales para lectura/escritura de archivos y disparos de compilación.
* *Services:* `VirtualWorkspaceManager` (manejo seguro de I/O), `TexLiveOrchestrator` (aislamiento de subprocesos con `Symfony\Component\Process\Process`).
* *Form Requests:* Validación estricta de rutas de archivos (regex anti path-traversal).



#### Mapa de Endpoints API (Local)

| Método | Ruta | Controller | Service | Auth | Rate Limit |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/projects/import` | `ProjectController` | `VirtualWorkspaceManager` | None (Local) | Local (100/m) |
| GET | `/api/fs/{project}/{path}` | `FileSystemController` | `VirtualWorkspaceManager` | None (Local) | Local (500/m) |
| PUT | `/api/fs/{project}/{path}` | `FileSystemController` | `VirtualWorkspaceManager` | None (Local) | Local (500/m) |
| POST | `/api/compile/{project}` | `CompilerController` | `TexLiveOrchestrator` | None (Local) | Local (20/m) |

### 8. MAPA DEL ECOSISTEMA LARAVEL

* `inertiajs/inertia-laravel` → Conexión monolítica con React → **Obligatorio**
* `laravel/pulse` → Monitoreo de latencias locales (I/O, Compilación) → **Obligatorio**
* `symfony/process` → Orquestación segura de binarios locales (TeX) → **Obligatorio**

### 9. INTEGRACIÓN GOOGLE ANTIGRAVITY + OFFLINE

*Override explícito:* Este proyecto requiere ejecución 100% offline. Google Antigravity actuará como agente de desarrollo IDE, pero **no** se integrarán servicios de runtime de GCP (Vertex, Cloud SQL, Secret Manager) en la arquitectura del producto. Antigravity debe enfocarse en la generación del parser AST en React y los algoritmos de sandboxing en PHP.

### 10. INVARIANTES DEL SISTEMA (NON-NEGOTIABLES)

1. **REGLA:** Parseo AST Exclusivo en Cliente. → **RAZÓN:** Evitar latencia de ida y vuelta HTTP para mantener sincronía < 200ms. → **CONSECUENCIA:** Rechazo de PRs que muevan lógica de conversión texto a PHP.
2. **REGLA:** Zero-Trust Filesystem. → **RAZÓN:** Riesgo crítico de lectura/escritura arbitraria. → **CONSECUENCIA:** Todo I/O debe validar explícitamente que la ruta resuelta está contenida dentro del `storage_path` del proyecto usando `realpath()`.
3. **REGLA:** Preservación de Código Desconocido. → **RAZÓN:** El `.tex` es la fuente de verdad. → **CONSECUENCIA:** Destruir o ignorar comandos LaTeX no soportados en el parser visual se clasifica como bug crítico (P0).
