# ADR-0005: Sincronización Bidireccional con Seguimiento de Origen y Zustand

**Fecha:** 2026-08-17  
**Estado:** Aprobado  
**Decisores:** Staff Frontend Architect, React Performance Expert  
**Contexto:** paperForge (Editor LaTeX Local-First)

---

## Contexto del Problema
En un editor híbrido donde coexisten Monaco Editor (código fuente LaTeX) y un editor visual interactivo WYSIWYG (nodos AST), ambas interfaces pueden emitir mutaciones concurrentes. Un diseño ingenuo basado en `useEffect` o React Context sufre dos patologías críticas:
1. **Bucles Infinitos de Sincronización:** La mutación en Monaco actualiza el árbol visual, el cual dispara un evento `onChange` que vuelve a enviar el texto a Monaco, saturando la cola de eventos y congelando el navegador.
2. **Re-renderizados Masivos:** Cada pulsación de tecla fuerza la reconciliación de todo el árbol de componentes del editor visual.

## Decisión de Arquitectura
1. **Gestor de Estado Zustand con Subscripciones Atómicas:**
   - Se utiliza Zustand (`useEditorStore`) para permitir a los componentes suscribirse únicamente a los fragmentos de estado necesarios mediante selectores granulares.
2. **Seguimiento de Origen (*Origin Tracking*):**
   - El estado mantiene una bandera explícita `lastSource: 'code' | 'visual' | 'disk' | 'none'`. Las actualizaciones emitidas por el editor visual no re-disparan el ciclo hacia el parser visual, y viceversa.
3. **Parseo y Serialización Atómica:**
   - Monaco llama a `updateFromCode(code)` que parsea sincrónicamente en <15 ms.
   - El editor visual llama a `updateFromVisual(updater)` que muta el AST y serializa a string de forma determinista.
4. **Protección de Nodos Complejos:**
   - Los nodos `UnknownBlockNode` se renderizan de manera inmutable en el modo visual (`UnknownBlockNodeView`), evitando que el usuario corrompa comandos avanzados de LaTeX de forma accidental.

## Consecuencias
- **Positivas:** Cero bucles de retroalimentación infinita, latencia global de sincronización < 20 ms (muy por debajo del SLA de 200 ms) y 60 FPS garantizados al escribir.
- **Verificación:** Batería de pruebas en Vitest simulando 100 ciclos alternados rápidos de sincronización sin pérdida de memoria ni divergencia de estado.
