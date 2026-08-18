import React from 'react';
import type { ASTNode, InlineFormattingNode, ParagraphNode } from '@/editor/ast/types';

export interface ParagraphNodeViewProps {
    node: ParagraphNode;
    onUpdate: (updated: ParagraphNode) => void;
}

export const ParagraphNodeView: React.FC<ParagraphNodeViewProps> = React.memo(
    ({ node, onUpdate }) => {
        const renderInlineChild = (child: ASTNode, index: number) => {
            switch (child.type) {
                case 'text':
                    return <span key={child.id || index}>{child.value}</span>;
                case 'inline_formatting': {
                    const fmt = child as InlineFormattingNode;
                    const innerText = fmt.children.map((c) => (c.type === 'text' ? c.value : '')).join('');
                    if (fmt.format === 'bold') {
                        return <strong key={fmt.id || index} className="font-semibold">{innerText}</strong>;
                    }
                    if (fmt.format === 'italic') {
                        return <em key={fmt.id || index} className="italic">{innerText}</em>;
                    }
                    if (fmt.format === 'underline') {
                        return <u key={fmt.id || index} className="underline">{innerText}</u>;
                    }
                    if (fmt.format === 'monospace') {
                        return (
                            <code key={fmt.id || index} className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                                {innerText}
                            </code>
                        );
                    }
                    if (fmt.format === 'strikethrough') {
                        return <s key={fmt.id || index} className="line-through">{innerText}</s>;
                    }
                    return <span key={fmt.id || index}>{innerText}</span>;
                }
                case 'math_inline':
                    return (
                        <span
                            key={child.id || index}
                            className="bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 mx-0.5 font-mono text-xs inline-flex items-center"
                            title={`$${child.math}$`}
                        >
                            ${child.math}$
                        </span>
                    );
                case 'unknown_block':
                    return (
                        <span
                            key={child.id || index}
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded px-1 py-0.5 text-xs font-mono mx-0.5"
                        >
                            {child.rawContent}
                        </span>
                    );
                default:
                    return null;
            }
        };

        const handleBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
            const text = e.currentTarget.textContent || '';
            const currentFullText = node.children
                .map((c) => {
                    if (c.type === 'text') return c.value;
                    if (c.type === 'inline_formatting') return c.children.map((ic) => (ic.type === 'text' ? ic.value : '')).join('');
                    if (c.type === 'math_inline') return `$${c.math}$`;
                    if (c.type === 'unknown_block') return c.rawContent;
                    return '';
                })
                .join('');

            if (text !== currentFullText) {
                onUpdate({
                    ...node,
                    children: [
                        {
                            id: `txt_${Date.now()}`,
                            type: 'text',
                            value: text,
                        },
                    ],
                });
            }
        };

        return (
            <p
                contentEditable
                suppressContentEditableWarning
                onBlur={handleBlur}
                className="my-3 text-base leading-relaxed text-foreground/90 outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 -mx-1 transition-colors"
                data-node-id={node.id}
            >
                {node.children.map((child, i) => renderInlineChild(child, i))}
            </p>
        );
    }
);

ParagraphNodeView.displayName = 'ParagraphNodeView';
