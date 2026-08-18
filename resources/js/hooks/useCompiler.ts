import { useCallback } from 'react';
import { useCompilerStore } from '@/stores/useCompilerStore';
import { useEditorStore } from '@/stores/useEditorStore';
import type { CompileResult } from '@/types/compiler';

export interface UseCompilerReturn {
    isCompiling: boolean;
    compileResult: CompileResult | null;
    pdfBlobUrl: string | null;
    diagnostics: ReturnType<typeof useCompilerStore.getState>['diagnostics'];
    rawLogs: string;
    triggerCompile: () => Promise<CompileResult | null>;
    clearPdf: () => void;
}

export function useCompiler(projectId: string): UseCompilerReturn {
    const {
        isCompiling,
        compileResult,
        pdfBlobUrl,
        diagnostics,
        rawLogs,
        setCompiling,
        setCompileResult,
        clear,
    } = useCompilerStore();

    const setEditorCompiling = useEditorStore((state) => state.setCompiling);

    const triggerCompile = useCallback(async (): Promise<CompileResult | null> => {
        if (!projectId) return null;

        setCompiling(true);
        setEditorCompiling(true);

        try {
            const response = await fetch(`/api/compile/${projectId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ timeout: 60 }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const failureResult: CompileResult = {
                    success: false,
                    pdfPath: null,
                    logContent: errorData.message || 'Compilation failed with server error.',
                    executionTimeMs: 0,
                    diagnostics: [
                        {
                            type: 'error',
                            severity: 'error',
                            message: errorData.message || 'Compilation failed.',
                            file: null,
                            line: null,
                            rawContext: null,
                        },
                    ],
                };
                setCompileResult(failureResult, null);
                return failureResult;
            }

            const result: CompileResult = await response.json();

            if (result.success) {
                // Fetch the compiled PDF binary
                try {
                    const pdfResponse = await fetch(`/api/compile/${projectId}/pdf`);
                    if (pdfResponse.ok) {
                        const blob = await pdfResponse.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        setCompileResult(result, blobUrl);
                        return result;
                    }
                } catch {
                    // Fallback if PDF fetch fails
                }
            }

            setCompileResult(result, null);
            return result;
        } catch (err: any) {
            const networkErrorResult: CompileResult = {
                success: false,
                pdfPath: null,
                logContent: err?.message || 'Network error occurred during compilation.',
                executionTimeMs: 0,
                diagnostics: [
                    {
                        type: 'error',
                        severity: 'error',
                        message: err?.message || 'Network error during compilation.',
                        file: null,
                        line: null,
                        rawContext: null,
                    },
                ],
            };
            setCompileResult(networkErrorResult, null);
            return networkErrorResult;
        } finally {
            setEditorCompiling(false);
        }
    }, [projectId, setCompiling, setCompileResult, setEditorCompiling]);

    return {
        isCompiling,
        compileResult,
        pdfBlobUrl,
        diagnostics,
        rawLogs,
        triggerCompile,
        clearPdf: clear,
    };
}
