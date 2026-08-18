# ADR-0011: Sincronización Bidireccional Código ↔ PDF y Aceleración por GPU

**Fecha:** 2026-08-18  
**Estado:** Aprobado  
**Decisores:** Staff Frontend Architect, UI/Math Specialist  
**Contexto:** paperForge V2 (Arquitectura Científica)

---

## Contexto del Problema
En un entorno de edición interactiva de LaTeX, el resaltado de cajas tipográficas tras un Forward Sync debe ser fluido e instantáneo. Dibujar directamente sobre el Canvas de `pdfjs-dist` obligaría a repintar el documento PDF completo en cada navegación, provocando parpadeos y saturando la CPU/GPU.

Asimismo, la captura del evento de doble clic sobre el PDF requiere convertir con precisión los píxeles del viewport a puntos PDF tipográficos ($72\text{ dpi}$) considerando el nivel de zoom (`scale`).

## Decisión de Arquitectura
1. **Capa de Resaltado Aislada (*Overlay Layer*):**
   - Se implementa `PdfHighlightOverlay` como una capa DOM posicionada de forma absoluta sobre el Canvas. Las animaciones de aparición y desvanecimiento progresivo se gestionan mediante propiedades CSS nativas (`opacity`, `transform`) ejecutadas en la GPU, con un decaimiento automático a los 1.5 segundos (*Highlight Decay*).
2. **Transformación Matemática Proporcional:**
   - Las coordenadas recibidas en puntos tipográficos ($1/72\text{ inch}$) se escalan directamente multiplicando por la escala activa del visor (`scale`), garantizando coincidencia geométrica exacta en cualquier nivel de zoom.
3. **Navegación Fluida en Monaco:**
   - Las llamadas de Reverse Sync invocan `revealLineInCenter(line)` y `setPosition()`, garantizando que la línea quede visible y centrada en el editor sin deseleccionar el texto ni perder el foco.

## Consecuencias
- **Positivas:** 60 FPS ininterrumpidos en animaciones, cero parpadeo del Canvas del PDF y navegación instantánea a doble clic.
- **Verificación:** Batería de pruebas en Vitest (`syncTeXNavigation.test.ts`) y certificación integral mediante `composer run qa`.
