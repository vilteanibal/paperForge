# Especificación: Experiencia de Usuario, Atajos & Quality Gate

## 1. Contexto y Propósito
paperForge integra un Dashboard intuitivo, un explorador de archivos reactivo (FileTree), un editor maestro multipanel (Monaco + Visual WYSIWYG + PDF Viewer + Diagnostics) con atajos de teclado globales y una compuerta estricta de calidad para entrega a producción.

## 2. Invariantes de Calidad y Experiencia
- **Interceptación de Atajos:** `useGlobalShortcuts` intercepta `Ctrl+S`/`Cmd+S` y `Ctrl+Enter`/`Cmd+Enter`, bloqueando los diálogos nativos del navegador mediante `e.preventDefault()`.
- **Pipeline de Calidad (`composer run qa`):**
  - Laravel Pint (estilo PSR-12).
  - PHPStan Nivel 8 (0 errores).
  - TypeScript (`tsc --noEmit`, 0 errores).
  - Vitest (100% de pruebas de frontend pasando).
  - Pest PHP (100% de pruebas de backend pasando).
- **100% Local & Offline:** Sin dependencias de CDNs externos; todos los workers y assets están empaquetados localmente.

## 3. Módulos y Componentes
- **Dashboard:** `resources/js/pages/Dashboard/Index.tsx`
- **Editor Studio:** `resources/js/pages/Editor/Show.tsx`
- **Explorador de Archivos:** `resources/js/components/workspace/FileTree.tsx`
- **Atajos Globales:** `resources/js/hooks/useGlobalShortcuts.ts`
