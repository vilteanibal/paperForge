import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSyncTeX, transformDomToPdfPoints } from '@/hooks/useSyncTeX';

describe('SyncTeX Coordinate Math & Navigation', () => {
    describe('transformDomToPdfPoints', () => {
        it('transforms DOM click coordinates to PDF points accurately according to scale', () => {
            const canvasRect = {
                left: 100,
                top: 50,
                width: 600,
                height: 800,
            };
            const scale = 1.5;

            // Click at clientX: 250, clientY: 200
            // Offset inside canvas: (150px, 150px)
            // In PDF points: 150 / 1.5 = 100pt, 150 / 1.5 = 100pt
            const result = transformDomToPdfPoints(250, 200, canvasRect, scale);

            expect(result.x_pt).toBe(100.0);
            expect(result.y_pt).toBe(100.0);
        });

        it('handles scale 1.0 identity mapping', () => {
            const canvasRect = {
                left: 0,
                top: 0,
                width: 500,
                height: 700,
            };
            const scale = 1.0;

            const result = transformDomToPdfPoints(123.45, 234.56, canvasRect, scale);

            expect(result.x_pt).toBe(123.45);
            expect(result.y_pt).toBe(234.56);
        });

        it('returns zero for non-positive scales or clicks outside boundary', () => {
            const canvasRect = { left: 100, top: 100, width: 500, height: 500 };
            const result = transformDomToPdfPoints(50, 50, canvasRect, 0);

            expect(result.x_pt).toBe(0);
            expect(result.y_pt).toBe(0);
        });
    });

    describe('useSyncTeX hook', () => {
        beforeEach(() => {
            vi.restoreAllMocks();
        });

        it('executes syncForward and updates highlightRect on success', async () => {
            const mockForwardResponse = {
                page: 2,
                x: 150.0,
                y: 320.0,
                width: 80.0,
                height: 25.0,
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockForwardResponse,
            } as Response);

            const { result } = renderHook(() => useSyncTeX('project-123'));

            let data;
            await act(async () => {
                data = await result.current.syncForward('main.tex', 42);
            });

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/synctex/project-123/forward',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ file: 'main.tex', line: 42 }),
                })
            );

            expect(data).toEqual(mockForwardResponse);
            expect(result.current.highlightRect).toEqual({
                page: 2,
                x: 150.0,
                y: 320.0,
                width: 80.0,
                height: 25.0,
            });
        });

        it('executes syncReverse and returns mapped source code position', async () => {
            const mockReverseResponse = {
                file: 'chapters/intro.tex',
                line: 18,
                column: 0,
            };

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockReverseResponse,
            } as Response);

            const { result } = renderHook(() => useSyncTeX('project-123'));

            let data;
            await act(async () => {
                data = await result.current.syncReverse(1, 100.5, 200.5);
            });

            expect(global.fetch).toHaveBeenCalledWith(
                '/api/synctex/project-123/reverse',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ page: 1, x: 100.5, y: 200.5 }),
                })
            );

            expect(data).toEqual(mockReverseResponse);
        });
    });
});
