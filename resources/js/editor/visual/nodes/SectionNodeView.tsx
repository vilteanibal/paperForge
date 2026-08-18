import React from 'react';
import type { ASTNode, SectionNode } from '@/editor/ast/types';

export interface SectionNodeViewProps {
    node: SectionNode;
    onUpdate: (updated: SectionNode) => void;
    renderChildren: (children: ASTNode[]) => React.ReactNode;
}

export const SectionNodeView: React.FC<SectionNodeViewProps> = React.memo(
    ({ node, onUpdate, renderChildren }) => {
        const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
            const newTitle = e.currentTarget.textContent || '';
            if (newTitle !== node.title) {
                onUpdate({
                    ...node,
                    title: newTitle,
                });
            }
        };

        const renderHeading = () => {
            const star = node.starred ? '*' : '';
            const baseClass = 'font-bold tracking-tight outline-none focus:ring-1 focus:ring-primary/40 rounded px-1 -mx-1 transition-colors';

            switch (node.level) {
                case 1:
                    return (
                        <h1
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleTitleChange}
                            className={`text-2xl text-foreground mt-6 mb-3 border-b pb-1 ${baseClass}`}
                            title={`\\section${star}`}
                        >
                            {node.title}
                        </h1>
                    );
                case 2:
                    return (
                        <h2
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleTitleChange}
                            className={`text-xl text-foreground mt-5 mb-2 ${baseClass}`}
                            title={`\\subsection${star}`}
                        >
                            {node.title}
                        </h2>
                    );
                case 3:
                    return (
                        <h3
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleTitleChange}
                            className={`text-lg text-foreground mt-4 mb-2 ${baseClass}`}
                            title={`\\subsubsection${star}`}
                        >
                            {node.title}
                        </h3>
                    );
                default:
                    return (
                        <h4
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleTitleChange}
                            className={`text-base font-semibold text-foreground mt-3 mb-1 ${baseClass}`}
                        >
                            {node.title}
                        </h4>
                    );
            }
        };

        return (
            <div className="section-node my-2" data-node-id={node.id}>
                {renderHeading()}
                <div className="section-content pl-1">
                    {renderChildren(node.children)}
                </div>
            </div>
        );
    }
);

SectionNodeView.displayName = 'SectionNodeView';
