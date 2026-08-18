import React, { useState } from 'react';
import type { MathBlockNode } from '@/editor/ast/types';

export interface MathNodeViewProps {
    node: MathBlockNode;
    onUpdate: (updated: MathBlockNode) => void;
}

export const MathNodeView: React.FC<MathNodeViewProps> = React.memo(({ node, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(node.math);

    const handleSave = () => {
        setIsEditing(false);
        if (editValue !== node.math) {
            onUpdate({
                ...node,
                math: editValue,
            });
        }
    };

    return (
        <div
            className="my-4 p-4 rounded-lg border border-primary/20 bg-primary/5 dark:bg-primary/10 flex flex-col items-center justify-center relative group transition-all"
            data-node-id={node.id}
        >
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary font-semibold">
                    {node.environment ?? 'equation'}
                </span>
                <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs px-2 py-0.5 rounded bg-background border shadow-xs hover:bg-muted text-foreground"
                >
                    {isEditing ? 'Preview' : 'Edit Formula'}
                </button>
            </div>

            {isEditing ? (
                <div className="w-full mt-3">
                    <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={handleSave}
                        className="w-full p-2 text-sm font-mono bg-background border rounded outline-none focus:ring-1 focus:ring-primary"
                        rows={3}
                        autoFocus
                    />
                </div>
            ) : (
                <div className="py-2 text-center overflow-x-auto w-full font-serif text-lg text-foreground flex items-center justify-center">
                    <span className="font-mono text-sm bg-background/80 px-3 py-1.5 rounded border border-border/50 text-foreground">
                        {node.math.trim()}
                    </span>
                </div>
            )}
        </div>
    );
});

MathNodeView.displayName = 'MathNodeView';
