export type DiagnosticSeverity = 'error' | 'warning' | 'badbox';

export interface LaTeXDiagnostic {
    type: DiagnosticSeverity;
    severity?: DiagnosticSeverity;
    line: number | null;
    message: string;
    file: string | null;
    rawContext?: string | null;
}

export interface CompileResult {
    success: boolean;
    pdfPath: string | null;
    logContent: string;
    executionTimeMs: number;
    diagnostics: LaTeXDiagnostic[];
}
