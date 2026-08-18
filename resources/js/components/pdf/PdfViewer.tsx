import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfToolbar } from './PdfToolbar';
import { PdfHighlightOverlay } from './PdfHighlightOverlay';
import { transformDomToPdfPoints } from '@/hooks/useSyncTeX';
import type { HighlightRect } from '@/types/synctex';
import { FileText, Loader2, AlertCircle } from 'lucide-react';

// Configure local static PDF.js worker (Zero CDN dependency, 100% Offline)
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

export interface PdfViewerProps {
    pdfUrl: string | null;
    isLoading?: boolean;
    className?: string;
    onPageChange?: (page: number, totalPages: number) => void;
    onRecompile?: () => void;
    onCanvasDoubleClick?: (page: number, x_pt: number, y_pt: number) => void;
    highlightRect?: HighlightRect | null;
    targetPage?: number | null;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
    pdfUrl,
    isLoading = false,
    className = '',
    onPageChange,
    onRecompile,
    onCanvasDoubleClick,
    highlightRect,
    targetPage,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.2);
    const [error, setError] = useState<string | null>(null);
    const [isRendering, setIsRendering] = useState(false);

    const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

    // Sync external target page (e.g. from Forward Sync)
    useEffect(() => {
        if (targetPage && targetPage > 0 && targetPage <= totalPages) {
            setCurrentPage(targetPage);
            onPageChange?.(targetPage, totalPages);
        }
    }, [targetPage, totalPages, onPageChange]);

    // 1. Load PDF document
    useEffect(() => {
        if (!pdfUrl) {
            setPdfDoc(null);
            setTotalPages(0);
            setCurrentPage(1);
            setError(null);
            return;
        }

        let isCancelled = false;
        setError(null);

        const loadDoc = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
                const doc = await loadingTask.promise;

                if (isCancelled) {
                    (doc as any).destroy?.();
                    return;
                }

                setPdfDoc((prevDoc) => {
                    if (prevDoc) {
                        (prevDoc as any).destroy?.();
                    }
                    return doc;
                });

                setTotalPages(doc.numPages);
                setCurrentPage(1);
                onPageChange?.(1, doc.numPages);
            } catch (err: any) {
                if (!isCancelled) {
                    setError(err?.message || 'Failed to load PDF document.');
                }
            }
        };

        loadDoc();

        return () => {
            isCancelled = true;
        };
    }, [pdfUrl, onPageChange]);

    // 2. Render current page to canvas
    const renderPage = useCallback(
        async (pageNumber: number) => {
            if (!pdfDoc || !canvasRef.current) return;

            // Cancel any in-flight render task
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }

            try {
                setIsRendering(true);
                const page = await pdfDoc.getPage(pageNumber);
                const viewport = page.getViewport({ scale });

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext('2d');
                if (!context) return;

                const outputScale = window.devicePixelRatio || 1;
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = Math.floor(viewport.width) + 'px';
                canvas.style.height = Math.floor(viewport.height) + 'px';

                const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

                const renderContext = {
                    canvasContext: context,
                    viewport,
                    canvas,
                    transform: transform || undefined,
                };

                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask;

                await renderTask.promise;
                renderTaskRef.current = null;
            } catch (err: any) {
                if (err?.name !== 'RenderingCancelledException') {
                    console.error('PDF Page render error:', err);
                }
            } finally {
                setIsRendering(false);
            }
        },
        [pdfDoc, scale]
    );

    useEffect(() => {
        if (pdfDoc && currentPage > 0) {
            renderPage(currentPage);
        }
    }, [pdfDoc, currentPage, scale, renderPage]);

    // Clean up render task on unmount
    useEffect(() => {
        return () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
            if (pdfDoc) {
                (pdfDoc as any).destroy?.();
            }
        };
    }, [pdfDoc]);

    const handlePrev = () => {
        if (currentPage > 1) {
            const next = currentPage - 1;
            setCurrentPage(next);
            onPageChange?.(next, totalPages);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            const next = currentPage + 1;
            setCurrentPage(next);
            onPageChange?.(next, totalPages);
        }
    };

    const handleZoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
    const handleZoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));
    const handleZoomFit = () => {
        if (containerRef.current && canvasRef.current) {
            const containerWidth = containerRef.current.clientWidth - 48;
            if (containerWidth > 200) {
                setScale(containerWidth / 600);
            }
        }
    };

    const handleCanvasDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current || !onCanvasDoubleClick) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const { x_pt, y_pt } = transformDomToPdfPoints(e.clientX, e.clientY, rect, scale);
        onCanvasDoubleClick(currentPage, x_pt, y_pt);
    };

    return (
        <div className={`flex h-full w-full flex-col bg-muted/30 ${className}`}>
            {/* Toolbar */}
            <PdfToolbar
                currentPage={currentPage}
                totalPages={totalPages}
                scale={scale}
                onPrevPage={handlePrev}
                onNextPage={handleNext}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onZoomFit={handleZoomFit}
                onReload={onRecompile}
                isCompiling={isLoading}
            />

            {/* Content Area */}
            <div
                ref={containerRef}
                className="relative flex-1 overflow-auto p-4 flex items-center justify-center min-h-0"
            >
                {isLoading && (
                    <div className="absolute inset-0 bg-background/70 backdrop-blur-xs flex flex-col items-center justify-center z-20 gap-2 text-primary">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-xs font-medium text-foreground">Compiling PDF document...</span>
                    </div>
                )}

                {error ? (
                    <div className="text-center p-6 bg-destructive/10 border border-destructive/20 rounded-lg max-w-sm">
                        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <p className="text-sm font-semibold text-destructive">PDF Render Error</p>
                        <p className="text-xs text-muted-foreground mt-1">{error}</p>
                    </div>
                ) : !pdfUrl ? (
                    <div className="text-center p-6 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">No PDF compiled yet</p>
                        <p className="text-xs text-muted-foreground/80 mt-1">
                            Click <strong className="text-foreground">Recompile</strong> to build the preview.
                        </p>
                    </div>
                ) : (
                    <div
                        onDoubleClick={handleCanvasDoubleClick}
                        className="relative shadow-lg rounded overflow-hidden bg-white dark:bg-zinc-900 border transition-all cursor-crosshair select-none"
                    >
                        <canvas ref={canvasRef} className="block" />
                        <PdfHighlightOverlay
                            rect={highlightRect || null}
                            currentPage={currentPage}
                            scale={scale}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
