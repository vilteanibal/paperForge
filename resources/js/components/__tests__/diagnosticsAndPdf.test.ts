import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCompilerStore } from '@/stores/useCompilerStore';
import type { CompileResult, LaTeXDiagnostic } from '@/types/compiler';

describe('useCompilerStore & Diagnostics Management', () => {
    beforeEach(() => {
        useCompilerStore.getState().clear();
    });

    it('initializes with clean compiler state', () => {
        const state = useCompilerStore.getState();
        expect(state.isCompiling).toBe(false);
        expect(state.compileResult).toBeNull();
        expect(state.diagnostics).toEqual([]);
        expect(state.pdfBlobUrl).toBeNull();
    });

    it('stores compile result and parses diagnostics list', () => {
        const mockDiagnostics: LaTeXDiagnostic[] = [
            {
                type: 'error',
                severity: 'error',
                message: 'Undefined control sequence \\nonExistent',
                file: 'main.tex',
                line: 12,
                rawContext: '! Undefined control sequence.',
            },
            {
                type: 'warning',
                severity: 'warning',
                message: 'Reference `fig:1` undefined',
                file: 'main.tex',
                line: 25,
                rawContext: 'LaTeX Warning: Reference `fig:1` undefined',
            },
            {
                type: 'badbox',
                severity: 'badbox',
                message: 'Overfull \\hbox (12.4pt too wide)',
                file: 'main.tex',
                line: 40,
                rawContext: 'Overfull \\hbox (12.4pt too wide) in paragraph at lines 40--45',
            },
        ];

        const mockResult: CompileResult = {
            success: false,
            pdfPath: null,
            logContent: 'Mock TeX Live log output...',
            executionTimeMs: 1240,
            diagnostics: mockDiagnostics,
        };

        useCompilerStore.getState().setCompileResult(mockResult, null);

        const state = useCompilerStore.getState();
        expect(state.compileResult).toEqual(mockResult);
        expect(state.diagnostics).toHaveLength(3);
        expect(state.rawLogs).toBe('Mock TeX Live log output...');

        const getSeverity = (d: LaTeXDiagnostic) => d.severity || d.type || 'error';
        const errors = state.diagnostics.filter((d) => getSeverity(d) === 'error');
        const warnings = state.diagnostics.filter((d) => getSeverity(d) === 'warning');
        const badboxes = state.diagnostics.filter((d) => getSeverity(d) === 'badbox');

        expect(errors).toHaveLength(1);
        expect(warnings).toHaveLength(1);
        expect(badboxes).toHaveLength(1);
        expect(errors[0].line).toBe(12);
    });

    it('handles blob url cleanup when setting new PDF url', () => {
        const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

        useCompilerStore.getState().setPdfBlobUrl('blob:http://localhost/first-uuid');
        expect(useCompilerStore.getState().pdfBlobUrl).toBe('blob:http://localhost/first-uuid');

        useCompilerStore.getState().setPdfBlobUrl('blob:http://localhost/second-uuid');
        expect(revokeSpy).toHaveBeenCalledWith('blob:http://localhost/first-uuid');
        expect(useCompilerStore.getState().pdfBlobUrl).toBe('blob:http://localhost/second-uuid');

        revokeSpy.mockRestore();
    });
});
