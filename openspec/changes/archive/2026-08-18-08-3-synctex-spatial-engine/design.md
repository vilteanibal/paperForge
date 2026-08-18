# Diseño Técnico: 08-3-synctex-spatial-engine

## Arquitectura de Componentes

### 1. Orquestación TeX Live con SyncTeX
- `TexLiveOrchestrator::buildProcessArgs()`: Inyecta `-synctex=1` junto a `-no-shell-escape`, `-interaction=nonstopmode`, `-halt-on-error`, `-file-line-error`.

### 2. Motor de Streaming SyncTeX (`SyncTeXParser`)
- **Lectura en Streaming:** Usa `gzopen()`, `gzgets()`, `gzclose()` evitando cargar archivos `.synctex.gz` masivos en memoria de golpe (huella de RAM < 5MB).
- **Estructura de Gramática SyncTeX:**
  - `SyncTeX Version:1`
  - `Input:tag:filepath` $\rightarrow$ Mapeo de tag numérico a archivo fuente relativo.
  - `Sheet:page_number` $\rightarrow$ Establece la página PDF activa.
  - `[tag,line:x,y:w,h,d]` o `(tag,line:x,y:w,h,d)` $\rightarrow$ Cajas horizontales/verticales (*h-boxes* / *v-boxes*).
  - `x:tag,line:x,y` $\rightarrow$ Posiciones de caracteres (*void boxes* o *glue*).
  - `magnification:1000` y `unit:1` $\rightarrow$ Factor de conversión a puntos PDF tipográficos ($1\text{ pt} = 65536\text{ sp}$).

### 3. Consultas Espaciales
- **Forward Query:** `(sourceFile, line)` $\rightarrow$ Escanea hasta encontrar el tag del archivo y la línea más cercana, extrayendo `{ page, x, y, width, height }`.
- **Reverse Query:** `(page, x, y)` $\rightarrow$ Escanea las cajas de la página `page` calculando la distancia euclidiana mínima al punto `(x, y)` y devuelve `{ file, line, column }`.

### 4. API Endpoints
- `POST /api/synctex/{project}/forward`: `{ file: string, line: int }`
- `POST /api/synctex/{project}/reverse`: `{ page: int, x: float, y: float }`
