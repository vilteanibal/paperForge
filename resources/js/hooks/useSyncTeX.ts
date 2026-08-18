import { useState, useCallback } from 'react';
import type {
    SyncTeXForwardResponse,
    SyncTeXReverseResponse,
    HighlightRect,
} from '@/types/synctex';

export interface UseSyncTeXReturn {
    highlightRect: HighlightRect | null;
    isSyncing: boolean;
    syncForward: (file: string, line: number) => Promise<SyncTeXForwardResponse | null>;
    syncReverse: (page: number, x: number, y: number) => Promise<SyncTeXReverseResponse | null>;
    clearHighlight: () => void;
}

/**
 * Pure function: Convert DOM mouse click pixels to standard PDF points (72 dpi)
 */
export function transformDomToPdfPoints(
    clientX: number,
    clientY: number,
    canvasRect: { left: number; top: number; width: number; height: number },
    scale: number
): { x_pt: number; y_pt: number } {
    if (scale <= 0) return { x_pt: 0, y_pt: 0 };

    const clickX_css = clientX - canvasRect.left;
    const clickY_css = clientY - canvasRect.top;

    const x_pt = clickX_css / scale;
    const y_pt = clickY_css / scale;

    return {
        x_pt: Math.max(0, Math.round(x_pt * 100) / 100),
        y_pt: Math.max(0, Math.round(y_pt * 100) / 100),
    };
}

export function useSyncTeX(projectId: string): UseSyncTeXReturn {
    const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const syncForward = useCallback(
        async (file: string, line: number): Promise<SyncTeXForwardResponse | null> => {
            if (!projectId || !file || line < 1) return null;

            setIsSyncing(true);
            try {
                const response = await fetch(`/api/synctex/${projectId}/forward`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ file, line }),
                });

                if (!response.ok) {
                    return null;
                }

                const data: SyncTeXForwardResponse = await response.json();
                setHighlightRect({
                    page: data.page,
                    x: data.x,
                    y: data.y,
                    width: data.width,
                    height: data.height,
                });

                return data;
            } catch (err) {
                console.error('SyncTeX forward query failed:', err);
                return null;
            } finally {
                setIsSyncing(false);
            }
        },
        [projectId]
    );

    const syncReverse = useCallback(
        async (page: number, x: number, y: number): Promise<SyncTeXReverseResponse | null> => {
            if (!projectId || page < 1) return null;

            setIsSyncing(true);
            try {
                const response = await fetch(`/api/synctex/${projectId}/reverse`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ page, x, y }),
                });

                if (!response.ok) {
                    return null;
                }

                const data: SyncTeXReverseResponse = await response.json();
                return data;
            } catch (err) {
                console.error('SyncTeX reverse query failed:', err);
                return null;
            } finally {
                setIsSyncing(false);
            }
        },
        [projectId]
    );

    const clearHighlight = useCallback(() => {
        setHighlightRect(null);
    }, []);

    return {
        highlightRect,
        isSyncing,
        syncForward,
        syncReverse,
        clearHighlight,
    };
}
