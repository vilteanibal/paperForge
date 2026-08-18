import type { ASTNode, DocumentNode } from '@/editor/ast/types';

/**
 * Extract all \label{...} definitions from AST nodes and raw LaTeX source code.
 */
export function extractLabelsFromAst(
    ast: ASTNode[] | DocumentNode | null | undefined,
    rawCode?: string
): string[] {
    const labels = new Set<string>();
    const labelRegex = /\\label\{([^}]+)\}/g;

    const traverse = (node: ASTNode) => {
        if (!node) return;

        if (node.type === 'section') {
            if (node.label) {
                labels.add(node.label.trim());
            }
            const match = node.title.match(/\\label\{([^}]+)\}/);
            if (match) {
                labels.add(match[1].trim());
            }
            if (node.children) {
                node.children.forEach(traverse);
            }
        } else if (node.type === 'document' || node.type === 'paragraph' || node.type === 'environment' || node.type === 'inline_formatting') {
            if ('children' in node && Array.isArray(node.children)) {
                node.children.forEach(traverse);
            }
        } else if (node.type === 'math_block') {
            let m: RegExpExecArray | null;
            while ((m = labelRegex.exec(node.math)) !== null) {
                labels.add(m[1].trim());
            }
        } else if (node.type === 'unknown_block') {
            let m: RegExpExecArray | null;
            while ((m = labelRegex.exec(node.rawContent)) !== null) {
                labels.add(m[1].trim());
            }
        }
    };

    if (ast) {
        if (Array.isArray(ast)) {
            ast.forEach(traverse);
        } else {
            traverse(ast);
        }
    }

    if (rawCode) {
        let m: RegExpExecArray | null;
        while ((m = labelRegex.exec(rawCode)) !== null) {
            labels.add(m[1].trim());
        }
    }

    return Array.from(labels).sort();
}
