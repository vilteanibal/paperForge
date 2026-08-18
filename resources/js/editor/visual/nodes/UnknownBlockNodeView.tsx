import React from 'react';
import type { UnknownBlockNode } from '@/editor/ast/types';

export interface UnknownBlockNodeViewProps {
    node: UnknownBlockNode;
}

export const UnknownBlockNodeView: React.FC<UnknownBlockNodeViewProps> = React.memo(({ node }) => {
    return (
        <div
            className="my-3 p-3 rounded-md border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 text-foreground font-mono text-xs flex flex-col gap-1.5 select-none"
            data-node-id={node.id}
        >
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                    Protected LaTeX Macro / Raw Block
                </span>
                <span className="text-[10px] opacity-75">Immutable in Visual Mode</span>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap py-1 text-foreground/90 font-mono">
                {node.rawContent}
            </pre>
        </div>
    );
});

UnknownBlockNodeView.displayName = 'UnknownBlockNodeView';
