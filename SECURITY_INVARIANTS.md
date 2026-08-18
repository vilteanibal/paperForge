# SECURITY_INVARIANTS.md
## Sistema: paperForge
## Clasificación: CRÍTICO — No modificar sin aprobación del Arquitecto Principal

### REGLA 1 — AISLAMIENTO DE COMPILACIÓN (ANTI-RCE)
- **NUNCA** permitir la compilación con `-shell-escape` habilitado. Esto permite la ejecución de comandos arbitrarios del SO host mediante LaTeX (`\write18{...}`).
- El compilador debe ejecutarse en el directorio base del proyecto (`working_dir`). La inclusión de paquetes externos fuera de las rutas estándar de TeX Live queda prohibida.
- Consecuencia de violación: Riesgo crítico (CVSS 10.0) de toma de control de la máquina del usuario.

### REGLA 2 — AISLAMIENTO DEL WORKSPACE (ANTI-PATH TRAVERSAL)
- El entorno PHP solo tiene autoridad de I/O sobre `storage/app/projects/`.
- Todos los archivos provistos por el usuario (comprimidos ZIP de proyectos importados, o archivos generados) deben desensamblarse y sanitizarse de manera que no existan Symlinks que apunten al directorio raíz del usuario host (`/home/user`, `C:\Users\`).
- Validación mandatoria post-resolución: `realpath($requested_file)` **DEBE** comenzar estrictamente con `realpath(storage_path('app/projects/' . $project_id))`.

### REGLA 3 — SEGURIDAD DE RED Y CORS
- Aunque el sistema se usa de forma local, el servidor Nginx y Laravel deben enlazar exclusivamente a `127.0.0.1` o `localhost`.
- Prohibido enlazar a `0.0.0.0`. Ningún otro dispositivo en la red local debe poder acceder a la interfaz web, ya que brindaría acceso directo al compilador y al disco del host.

### REGLA 4 — PRESERVACIÓN DE INTEGRIDAD DE DATOS (NO DESTRUCCIÓN)
- El editor de texto, al carecer de capacidad de renderizar el 100% de las macros de LaTeX, NO está autorizado bajo ninguna circunstancia a purgar o eliminar sintaxis desconocida durante el ciclo de vida de parseo y guardado (`Read -> AST -> Visual Edit -> Write`).
- Esta falla no es solo un bug de UX, se considera una violación de seguridad de datos (Data Loss).
