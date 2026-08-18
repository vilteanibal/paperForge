import React, { useCallback } from 'react';
import type { ASTNode, DocumentNode, MathBlockNode, ParagraphNode, SectionNode } from '@/editor/ast/types';
import { SectionNodeView } from './nodes/SectionNodeView';
import { ParagraphNodeView } from './nodes/ParagraphNodeView';
import { MathNodeView } from './nodes/MathNodeView';
import { UnknownBlockNodeView } from './nodes/UnknownBlockNodeView';

export interface VisualEditorProps {
    ast: DocumentNode | null;
    onUpdateAst: (updater: (prevAst: DocumentNode) => DocumentNode) => void;
    className?: string;
}

export const VisualEditor: React.FC<VisualEditorProps> = React.memo(
    ({ ast, onUpdateAst, className = '' }) => {
        const handleUpdateNode = useCallback(
            (updatedNode: ASTNode) => {
                onUpdateAst((prevAst) => {
                    const updateRecursive = (nodes: ASTNode[]): ASTNode[] => {
                        return nodes.map((node) => {
                            if (node.id === updatedNode.id) {
                                return updatedNode;
                            }
                            if ('children' in node && Array.isArray((node as any).children)) {
                                return {
                                    ...node,
                                    children: updateRecursive((node as any).children),
                                } as ASTNode;
                            }
                            return node;
                        });
                    };

                    return {
                        ...prevAst,
                        children: updateRecursive(prevAst.children),
                    };
                });
            },
            [onUpdateAst]
        );

        const renderNode = (node: ASTNode) => {
            switch (node.type) {
                case 'section':
                    return (
                        <SectionNodeView
                            key={node.id}
                            node={node as SectionNode}
                            onUpdate={handleUpdateNode}
                            renderChildren={(children) => children.map((c) => renderNode(c))}
                        />
                    );
                case 'paragraph':
                    return (
                        <ParagraphNodeView
                            key={node.id}
                            node={node as ParagraphNode}
                            onUpdate={handleUpdateNode}
                        />
                    );
                case 'math_block':
                    return (
                        <MathNodeView
                            key={node.id}
                            node={node as MathBlockNode}
                            onUpdate={handleUpdateNode}
                        />
                    );
                case 'unknown_block':
                    return (
                        <UnknownBlockNodeView
                            key={node.id}
                            node={node}
                        />
                    );
                default:
                    return null;
            }
        };

        if (!ast) {
            return (
                <div className={`flex items-center justify-center h-full text-muted-foreground p-8 ${className}`}>
                    <div className="text-center">
                        <p className="text-sm font-medium">No active LaTeX document loaded.</p>
                        <p className="text-xs text-muted-foreground mt-1">Open a .tex file from the sidebar to begin editing.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className={`h-full w-full overflow-y-auto bg-background p-6 md:p-10 ${className}`}>
                <div className="max-w-3xl mx-auto bg-card border rounded-xl shadow-xs p-8 md:p-12 min-h-[85vh]">
                    {ast.preamble && (
                        <div className="mb-6 p-3 rounded bg-muted/40 border border-border/50 text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                            <span>Preamble configured ({ast.preamble.trim().split('\n').length} lines)</span>
                            <span className="text-[10px] uppercase font-semibold">Protected</span>
                        </div>
                    )}

                    <div className="document-body space-y-4">
                        {ast.children.map((child) => renderNode(child))}
                    </div>
                </div>
            </div>
        );
    }
);

VisualEditor.displayName = 'VisualEditor';
