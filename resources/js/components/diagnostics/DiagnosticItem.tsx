import React from 'react';
import type { LaTeXDiagnostic } from '@/types/compiler';
import { Info, Warning, WarningCircle } from '@phosphor-icons/react';

export interface DiagnosticItemProps {
    diagnostic: LaTeXDiagnostic;
    onClick: () => void;
}

export const DiagnosticItem: React.FC<DiagnosticItemProps> = React.memo(({ diagnostic, onClick }) => {
    const severity = diagnostic.severity || diagnostic.type || 'error';

    const getSeverityBadge = () => {
        switch (severity) {
            case 'error':
                return (
                    <span className="inline-flex items-center gap-1 text-destructive bg-destructive/10 border border-destructive/20 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                        <WarningCircle weight="duotone" className="h-3 w-3" /> Error
                    </span>
                );
            case 'warning':
                return (
                    <span className="inline-flex items-center gap-1 text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                        <Warning weight="duotone" className="h-3 w-3" /> Warning
                    </span>
                );
            case 'badbox':
                return (
                    <span className="inline-flex items-center gap-1 text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                        <Info weight="duotone" className="h-3 w-3" /> Badbox
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div
            onClick={onClick}
            className="flex items-start justify-between gap-3 p-2.5 rounded-md hover:bg-muted/60 border border-transparent hover:border-border/60 transition-all cursor-pointer select-none text-xs"
        >
            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                {getSeverityBadge()}
                <div className="flex flex-col min-w-0 flex-1">
                    <p className="font-mono text-foreground break-words">{diagnostic.message}</p>
                    {diagnostic.rawContext && (
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                            {diagnostic.rawContext}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 text-muted-foreground font-mono text-[11px]">
                {diagnostic.file && <span>{diagnostic.file}</span>}
                {diagnostic.line && (
                    <span className="bg-muted px-1.5 py-0.5 rounded font-semibold text-foreground">
                        L{diagnostic.line}
                    </span>
                )}
            </div>
        </div>
    );
});

DiagnosticItem.displayName = 'DiagnosticItem';
