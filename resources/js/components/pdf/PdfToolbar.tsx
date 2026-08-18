import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, RotateCw } from 'lucide-react';

export interface PdfToolbarProps {
    currentPage: number;
    totalPages: number;
    scale: number;
    onPrevPage: () => void;
    onNextPage: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onZoomFit: () => void;
    onReload?: () => void;
    isCompiling?: boolean;
}

export const PdfToolbar: React.FC<PdfToolbarProps> = ({
    currentPage,
    totalPages,
    scale,
    onPrevPage,
    onNextPage,
    onZoomIn,
    onZoomOut,
    onZoomFit,
    onReload,
    isCompiling = false,
}) => {
    return (
        <div className="flex h-10 items-center justify-between border-b bg-card/80 px-3 text-xs text-foreground backdrop-blur-xs select-none">
            {/* Page Navigation */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={onPrevPage}
                    disabled={currentPage <= 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-40 transition-colors"
                    title="Previous Page"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="font-mono text-[11px] px-1 text-muted-foreground">
                    {totalPages > 0 ? `${currentPage} / ${totalPages}` : '0 / 0'}
                </span>

                <button
                    type="button"
                    onClick={onNextPage}
                    disabled={currentPage >= totalPages || totalPages === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-40 transition-colors"
                    title="Next Page"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Zoom & Fit Controls */}
            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    onClick={onZoomOut}
                    disabled={scale <= 0.5}
                    className="p-1 rounded hover:bg-muted disabled:opacity-40 transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut className="h-3.5 w-3.5" />
                </button>

                <span className="font-mono text-[11px] w-10 text-center text-muted-foreground">
                    {Math.round(scale * 100)}%
                </span>

                <button
                    type="button"
                    onClick={onZoomIn}
                    disabled={scale >= 3.0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-40 transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn className="h-3.5 w-3.5" />
                </button>

                <button
                    type="button"
                    onClick={onZoomFit}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ml-1"
                    title="Fit Width"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                </button>

                {onReload && (
                    <button
                        type="button"
                        onClick={onReload}
                        disabled={isCompiling}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors ml-1"
                        title="Reload PDF"
                    >
                        <RotateCw className={`h-3.5 w-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>
        </div>
    );
};
