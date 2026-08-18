import React, { useState } from 'react';
import type { LaTeXDiagnostic } from '@/types/compiler';
import { DiagnosticItem } from './DiagnosticItem';
import {
    CaretDown,
    CaretUp,
    CheckCircle,
    TerminalWindow,
} from '@phosphor-icons/react';

export interface DiagnosticsPanelProps {
    diagnostics: LaTeXDiagnostic[];
    rawLogs?: string;
    onDiagnosticClick: (line: number, file: string | null) => void;
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
    diagnostics,
    rawLogs = '',
    onDiagnosticClick,
    isOpen = true,
    onToggle,
    className = '',
}) => {
    const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'badbox' | 'logs'>('all');

    const getSeverity = (d: LaTeXDiagnostic) => d.severity || d.type || 'error';

    const errors = diagnostics.filter((d) => getSeverity(d) === 'error');
    const warnings = diagnostics.filter((d) => getSeverity(d) === 'warning');
    const badboxes = diagnostics.filter((d) => getSeverity(d) === 'badbox');

    const filteredDiagnostics = diagnostics.filter((d) => {
        if (filter === 'all') return true;
        return getSeverity(d) === filter;
    });

    return (
        <div className={`flex flex-col border-t bg-card text-foreground transition-all ${className}`}>
            {/* Header / Summary Bar */}
            <div className="flex h-9 items-center justify-between px-3 border-b bg-muted/40 text-xs">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onToggle}
                        className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
                    >
                        <TerminalWindow className="h-3.5 w-3.5" />
                        Diagnostics & Output
                        {isOpen ? <CaretDown className="h-3.5 w-3.5" /> : <CaretUp className="h-3.5 w-3.5" />}
                    </button>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                        <button
                            type="button"
                            onClick={() => { setFilter('all'); }}
                            className={`px-1.5 py-0.5 rounded transition-colors ${filter === 'all' ? 'bg-primary/20 text-primary font-bold' : 'hover:bg-muted'}`}
                        >
                            All ({diagnostics.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => { setFilter('error'); }}
                            className={`px-1.5 py-0.5 rounded text-destructive transition-colors ${filter === 'error' ? 'bg-destructive/20 font-bold' : 'hover:bg-muted'}`}
                        >
                            Errors ({errors.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => { setFilter('warning'); }}
                            className={`px-1.5 py-0.5 rounded text-amber-500 transition-colors ${filter === 'warning' ? 'bg-amber-500/20 font-bold' : 'hover:bg-muted'}`}
                        >
                            Warnings ({warnings.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => { setFilter('badbox'); }}
                            className={`px-1.5 py-0.5 rounded text-blue-500 transition-colors ${filter === 'badbox' ? 'bg-blue-500/20 font-bold' : 'hover:bg-muted'}`}
                        >
                            Badboxes ({badboxes.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => { setFilter('logs'); }}
                            className={`px-1.5 py-0.5 rounded text-muted-foreground transition-colors ${filter === 'logs' ? 'bg-muted text-foreground font-bold' : 'hover:bg-muted'}`}
                        >
                            Raw Log
                        </button>
                    </div>
                </div>
            </div>

            {/* Panel Body */}
            {isOpen && (
                <div className="h-44 overflow-y-auto p-2">
                    {filter === 'logs' ? (
                        <pre className="text-xs font-mono p-2 bg-muted/40 rounded whitespace-pre-wrap text-muted-foreground">
                            {rawLogs || 'No compilation log recorded yet.'}
                        </pre>
                    ) : filteredDiagnostics.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground gap-2 text-xs">
                            <CheckCircle weight="duotone" className="h-4 w-4 text-emerald-500" />
                            <span>No {filter !== 'all' ? filter : ''} issues detected.</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredDiagnostics.map((diag, index) => (
                                <DiagnosticItem
                                    key={index}
                                    diagnostic={diag}
                                    onClick={() => {
                                        if (diag.line) {
                                            onDiagnosticClick(diag.line, diag.file);
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
