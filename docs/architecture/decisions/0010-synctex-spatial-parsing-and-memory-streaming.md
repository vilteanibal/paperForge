# ADR-0010: Parseo Espacial SyncTeX en Streaming en el Backend

**Fecha:** 2026-08-18  
**Estado:** Aprobado  
**Decisores:** Staff Backend Architect, Data Streaming Expert  
**Contexto:** paperForge V2 (Arquitectura Científica)

---

## Contexto del Problema
La navegación bidireccional entre el editor de código LaTeX y el visor de PDF requiere mapear con precisión las líneas de código a las coordenadas físicas de las cajas tipográficas renderizadas (y viceversa). Los compiladores de TeX Live generan archivos `.synctex.gz` que contienen miles de registros comprimidos.

Cargar estos archivos completos en memoria en el frontend provocaría un consumo excesivo de RAM y degradación de rendimiento en navegadores cliente.

## Decisión de Arquitectura
1. **Inyección Automática de `-synctex=1`:**
   - Se asegura que todas las ejecuciones de compilación sandboxed (`pdflatex`, `xelatex`, `lualatex`) produzcan el archivo de sincronización `<main>.synctex.gz`.
2. **Parser en Streaming con `zlib` (`gzopen`/`gzgets`):**
   - En PHP 8.3, `SyncTeXParser` lee el archivo comprimido línea por línea en $O(N)$, manteniendo la huella de memoria por debajo de 5 MB independientemente del tamaño del documento.
3. **Endpoints Ligeros JSON:**
   - `/api/synctex/{project}/forward`: Mapea `(file, line)` $\rightarrow$ `(page, x, y, width, height)`.
   - `/api/synctex/{project}/reverse`: Mapea `(page, x, y)` $\rightarrow$ `(file, line, column)` utilizando minimización de distancia euclidiana.
4. **Protección de Frontera (Border Patrol):**
   - Validación obligatoria mediante `SafeRelativePathRule` para prevenir vectores de Path Traversal a través del parámetro `file`.

## Consecuencias
- **Positivas:** Respuestas en < 5ms, consumo de memoria ultrabajo, cero sobrecarga en el navegador del usuario y aislamiento seguro.
- **Verificación:** Batería de pruebas en Pest (`SyncTeXParserTest`, `SyncTeXControllerTest`) y certificación mediante `composer run qa`.
