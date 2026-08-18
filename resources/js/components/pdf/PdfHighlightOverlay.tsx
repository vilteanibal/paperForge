import React, { useEffect, useState } from 'react';
import type { HighlightRect } from '@/types/synctex';

export interface PdfHighlightOverlayProps {
    rect: HighlightRect | null;
    currentPage: number;
    scale: number;
}

export const PdfHighlightOverlay: React.FC<PdfHighlightOverlayProps> = ({
    rect,
    currentPage,
    scale,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (rect && rect.page === currentPage) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 1500);

            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [rect, currentPage]);

    if (!rect || rect.page !== currentPage || !isVisible) {
        return null;
    }

    const left = rect.x * scale;
    const top = rect.y * scale;
    const width = Math.max(24, rect.width * scale);
    const height = Math.max(16, rect.height * scale);

    return (
        <div
            className="absolute pointer-events-none rounded border-2 border-primary bg-primary/20 shadow-md transition-opacity duration-500 ease-out z-10"
            style={{
                left: `${left}px`,
                top: `${top}px`,
                width: `${width}px`,
                height: `${height}px`,
            }}
        />
    );
};
