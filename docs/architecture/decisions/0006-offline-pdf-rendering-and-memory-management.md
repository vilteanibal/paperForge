# ADR-0006: Renderizado de PDF 100% Offline y Control de Fugas de Memoria

**Fecha:** 2026-08-17  
**Estado:** Aprobado  
**Decisores:** Staff Frontend Architect, WebGL/PDF Integration Expert  
**Contexto:** paperForge (Editor LaTeX Local-First)

---

## Contexto del Problema
En editores de LaTeX interactivos locales, los usuarios re-compilan el documento docenas de veces por sesión. El uso de visores estándar o iframes con plugins del navegador no ofrece control sobre la memoria ni permite sincronizar saltos de línea con Monaco. Además, muchas librerías de PDF cargan su worker desde CDNs remotos, lo que rompe el principio de funcionamiento autónomo sin internet (*Local-First Invariant*).

## Decisión de Arquitectura
1. **Worker de `pdfjs-dist` 100% Local:**
   - Se configura `pdfjsLib.GlobalWorkerOptions.workerSrc` apuntando al worker empaquetado en el bundle de Vite (`new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()`), asegurando funcionamiento offline absoluto.
2. **Ciclo de Limpieza de Canvas Estricto (*Memory GC*):**
   - Cada nuevo renderizado cancela activamente cualquier tarea previa (`renderTask.cancel()`) y destruye la instancia anterior del documento (`pdfDoc.destroy()`), previniendo fugas de memoria en la GPU/RAM.
3. **Mapeo Bidireccional de Diagnósticos:**
   - Los diagnósticos estructurados emitidos por el backend se enlazan con el estado de Monaco Editor, permitiendo que un clic en la advertencia mueva instantáneamente el cursor y el foco a la línea correspondiente.

## Consecuencias
- **Positivas:** Experiencia offline garantizada, consumo de memoria estable a lo largo de horas de uso y resolución instantánea de errores de compilación.
- **Verificación:** Batería de pruebas en Vitest verificando el flujo de compilación, URLs de blob y filtrado de diagnósticos.
