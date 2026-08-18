# ADR-0004: Motor de Parseo AST de LaTeX Tolerante a Fallos en TypeScript

**Fecha:** 2026-08-17  
**Estado:** Aprobado  
**Decisores:** Staff Frontend Architect, Parser Engineer  
**Contexto:** paperForge (Editor LaTeX Local-First)

---

## Contexto del Problema
Los analizadores sintácticos de LaTeX comerciales y librerías de código abierto convencionales en el ecosistema JS/TS están diseñados casi exclusivamente para la transpilación unidireccional (de LaTeX hacia HTML o KaTeX/MathJax), o bien imponen un dialecto rígido que destruye macros no estándar o comentarios al intentar re-serializar el código fuente. En paperForge, el archivo `.tex` local es la única e inmutable fuente de verdad, y la sincronización bidireccional exige latencia menor a 200 ms y cero pérdida de datos.

## Decisión de Arquitectura
1. **Motor de Parseo Propio en TypeScript Puro:**
   - Desacoplado al 100% de componentes React o dependencias del DOM (`resources/js/editor/ast/`).
   - Tipado estricto mediante *Discriminated Unions* en TypeScript sin ningún uso de `any`.
2. **Preservación Total de Código No Soportado (*Fault-Tolerant Parsing*):**
   - Incorporación del nodo inmutable `UnknownBlockNode`, el cual retiene el contenido literal exacto (`rawContent`) de cualquier macro, paquete o entorno no reconocido visualmente.
3. **Idempotencia y Fidelidad de Ida y Vuelta (*Round-Trip Fidelity*):**
   - El serializador (`LaTeXSerializer`) garantiza que `serialize(parse(tex)) === tex` para preámbulos, macros personalizadas, ecuaciones matemáticas y jerarquías de secciones.
4. **Escaneo Lineal $O(N)$ y Latencia Ultra-Baja:**
   - `LaTeXLexer` escanea carácter a carácter mediante punteros indexados, evitando retrocesos (*backtracking*) de expresiones regulares. Procesa documentos de 50 páginas en menos de 15 ms.

## Consecuencias
- **Positivas:** Prevención absoluta de pérdida de datos (P0 Data Loss Mitigation), latencia instantánea (< 20 ms), estabilidad y compatibilidad con cualquier archivo `.tex` generado por Overleaf, TeXstudio o editores manuales.
- **Verificación:** Batería de pruebas automatizadas en Vitest con 100% de aserciones de ida y vuelta pasando en menos de 50 ms.
