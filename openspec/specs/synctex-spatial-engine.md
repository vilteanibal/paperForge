# Especificación: Motor Espacial SyncTeX y Compilación

## 1. Contexto y Propósito
paperForge integra soporte para navegación bidireccional código $\leftrightarrow$ PDF mediante la emisión automática de archivos de sincronización `.synctex.gz` y un motor de consultas espaciales en streaming en el backend.

## 2. Invariantes de Streaming y Seguridad
- **Lectura en Streaming con `zlib`:** `SyncTeXParser` procesa archivos `.synctex.gz` línea por línea mediante `gzopen()` y `gzgets()` manteniendo la huella de memoria < 5MB en $O(N)$.
- **Conversión a Puntos PDF:** Las coordenadas en puntos escalados TeX ($1\text{ pt} = 65536\text{ sp}$) se normalizan a puntos estándar ($72\text{ dpi}$) directamente consumibles por `pdfjs-dist`.
- **Aislamiento Canónico:** Las consultas *Forward* validan los nombres de archivo fuente con `SafeRelativePathRule` para prevenir vectores de Path Traversal.

## 3. Módulos y Componentes
- **Orquestador TeX Live:** `app/Services/Compiler/TexLiveOrchestrator.php` (inyecta `-synctex=1`).
- **Contrato y Parser:** `app/Contracts/SyncTeXParserInterface.php`, `app/Services/Compiler/SyncTeXParser.php`.
- **DTOs Espaciales:** `app/DTOs/SyncTeXForwardDTO.php`, `app/DTOs/SyncTeXReverseDTO.php`.
- **Controlador y Endpoints:** `app/Http/Controllers/SyncTeXController.php` (`POST /api/synctex/{project}/forward`, `POST /api/synctex/{project}/reverse`).
