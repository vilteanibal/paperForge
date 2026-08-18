# Propuesta de Cambio: 01-workspace-security

## Propósito
Implementar la capa fundamental de seguridad y gestión de archivos en el Virtual Workspace (`storage/app/projects/{uuid}`) para paperForge.

## Alcance
1. Jerarquía de excepciones de seguridad del dominio.
2. DTOs inmutables para metadatos y árbol de archivos.
3. Servicio central `VirtualWorkspaceManager` con validación estricta `realpath()` y aislamiento Zero-Trust.
4. Batería de pruebas automatizadas Pest PHP con vectores de ataque de Path Traversal y Symlink Poisoning.

## Invariantes de Seguridad Críticas
- **SECURITY_INVARIANTS.md — Regla 2**: Ninguna operación de lectura, escritura o listado puede resolver rutas fuera del directorio base del proyecto.
- **.antigravityrules**: Validación mandatoria `str_starts_with($resolved, $projectStoragePath)` y bloqueo total de secuencias `../`, prefijos absolutos `/` y null bytes.
