import { create } from 'zustand';
import type { CompileResult, LaTeXDiagnostic } from '@/types/compiler';

export interface CompilerState {
    isCompiling: boolean;
    compileResult: CompileResult | null;
    diagnostics: LaTeXDiagnostic[];
    rawLogs: string;
    pdfBlobUrl: string | null;
    activeTab: 'diagnostics' | 'logs';
    selectedDiagnostic: LaTeXDiagnostic | null;

    // Actions
    setCompiling: (isCompiling: boolean) => void;
    setCompileResult: (result: CompileResult | null, pdfBlobUrl?: string | null) => void;
    setPdfBlobUrl: (url: string | null) => void;
    setActiveTab: (tab: 'diagnostics' | 'logs') => void;
    setSelectedDiagnostic: (diagnostic: LaTeXDiagnostic | null) => void;
    clear: () => void;
}

export const useCompilerStore = create<CompilerState>((set, get) => ({
    isCompiling: false,
    compileResult: null,
    diagnostics: [],
    rawLogs: '',
    pdfBlobUrl: null,
    activeTab: 'diagnostics',
    selectedDiagnostic: null,

    setCompiling: (isCompiling: boolean) => {
        set({ isCompiling });
    },

    setCompileResult: (result: CompileResult | null, pdfBlobUrl: string | null = null) => {
        const prevUrl = get().pdfBlobUrl;
        if (prevUrl && prevUrl !== pdfBlobUrl && prevUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prevUrl);
        }

        set({
            compileResult: result,
            diagnostics: result?.diagnostics ?? [],
            rawLogs: result?.logContent ?? '',
            pdfBlobUrl: pdfBlobUrl ?? get().pdfBlobUrl,
            isCompiling: false,
        });
    },

    setPdfBlobUrl: (url: string | null) => {
        const prevUrl = get().pdfBlobUrl;
        if (prevUrl && prevUrl !== url && prevUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prevUrl);
        }
        set({ pdfBlobUrl: url });
    },

    setActiveTab: (tab: 'diagnostics' | 'logs') => {
        set({ activeTab: tab });
    },

    setSelectedDiagnostic: (diagnostic: LaTeXDiagnostic | null) => {
        set({ selectedDiagnostic: diagnostic });
    },

    clear: () => {
        const prevUrl = get().pdfBlobUrl;
        if (prevUrl && prevUrl.startsWith('blob:')) {
            URL.revokeObjectURL(prevUrl);
        }
        set({
            isCompiling: false,
            compileResult: null,
            diagnostics: [],
            rawLogs: '',
            pdfBlobUrl: null,
            activeTab: 'diagnostics',
            selectedDiagnostic: null,
        });
    },
}));
