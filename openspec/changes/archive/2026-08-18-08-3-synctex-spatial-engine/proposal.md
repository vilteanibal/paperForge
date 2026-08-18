# Propuesta de Cambio: 08-3-synctex-spatial-engine

## Propósito
Integrar la emisión automática de archivos `.synctex.gz` en `TexLiveOrchestrator`, implementar un parser de coordenadas espaciales basado en streaming con `zlib` (`gzopen`/`gzgets`) de bajo consumo de memoria (< 5MB) y exponer endpoints seguros para mapeo bidireccional código $\leftrightarrow$ PDF (*Forward* y *Reverse* SyncTeX).

## Alcance
1. Inyección de la bandera `-synctex=1` en el orquestador de compilación de TeX Live.
2. Contrato `SyncTeXParserInterface` y servicio de streaming `SyncTeXParser` en PHP 8.3.
3. DTOs inmutables `SyncTeXForwardDTO` y `SyncTeXReverseDTO`.
4. Form Requests `ForwardSyncRequest` y `ReverseSyncRequest` con validación estricta de rutas mediante `SafeRelativePathRule`.
5. Controlador `SyncTeXController` y rutas `POST /api/synctex/{project}/forward` y `POST /api/synctex/{project}/reverse` con rate limiting local.
6. Batería de pruebas unitarias y de integración en Pest PHP.
