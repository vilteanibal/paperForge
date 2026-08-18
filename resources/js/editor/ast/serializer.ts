import type {
    ASTNode,
    CommentNode,
    DocumentNode,
    EnvironmentNode,
    InlineFormattingNode,
    MacroNode,
    MathBlockNode,
    MathInlineNode,
    ParagraphNode,
    SectionNode,
    TextNode,
    UnknownBlockNode,
} from './types';

export class LaTeXSerializer {
    public serialize(node: ASTNode): string {
        switch (node.type) {
            case 'document':
                return this.serializeDocument(node);
            case 'section':
                return this.serializeSection(node);
            case 'paragraph':
                return this.serializeParagraph(node);
            case 'inline_formatting':
                return this.serializeInlineFormatting(node);
            case 'math_inline':
                return this.serializeMathInline(node);
            case 'math_block':
                return this.serializeMathBlock(node);
            case 'environment':
                return this.serializeEnvironment(node);
            case 'macro':
                return this.serializeMacro(node);
            case 'unknown_block':
                return this.serializeUnknownBlock(node);
            case 'comment':
                return this.serializeComment(node);
            case 'text':
                return this.serializeText(node);
            default:
                return '';
        }
    }

    private serializeDocument(node: DocumentNode): string {
        const bodyContent = node.children.map((child) => this.serialize(child)).join('\n\n');

        if (node.hasDocumentEnv) {
            const preamble = node.preamble ? node.preamble.trimEnd() + '\n' : '';
            return `${preamble}\\begin{document}\n${bodyContent.trim()}\n\\end{document}\n`;
        }

        return bodyContent;
    }

    private serializeSection(node: SectionNode): string {
        const cmdMap: Record<number, string> = {
            1: 'section',
            2: 'subsection',
            3: 'subsubsection',
            4: 'paragraph',
            5: 'subparagraph',
        };

        const cmd = cmdMap[node.level] || 'section';
        const star = node.starred ? '*' : '';
        const header = `\\${cmd}${star}{${node.title}}`;

        if (node.children.length === 0) {
            return header;
        }

        const childrenContent = node.children.map((c) => this.serialize(c)).join('\n\n');
        return `${header}\n${childrenContent}`;
    }

    private serializeParagraph(node: ParagraphNode): string {
        return node.children.map((child) => this.serialize(child)).join('');
    }

    private serializeInlineFormatting(node: InlineFormattingNode): string {
        const formatCmdMap: Record<string, string> = {
            bold: 'textbf',
            italic: 'textit',
            underline: 'underline',
            monospace: 'texttt',
            strikethrough: 'sout',
        };

        const cmd = formatCmdMap[node.format] || 'textbf';
        const inner = node.children.map((c) => this.serialize(c)).join('');
        return `\\${cmd}{${inner}}`;
    }

    private serializeMathInline(node: MathInlineNode): string {
        return `$${node.math}$`;
    }

    private serializeMathBlock(node: MathBlockNode): string {
        const mathTrimmed = node.math.trim();
        if (node.environment) {
            return `\\begin{${node.environment}}\n${mathTrimmed}\n\\end{${node.environment}}`;
        }
        return `$$\n${mathTrimmed}\n$$`;
    }

    private serializeEnvironment(node: EnvironmentNode): string {
        const opts = node.options ? `[${node.options}]` : '';
        const body = node.children.map((c) => this.serialize(c)).join('\n\n');
        return `\\begin{${node.name}}${opts}\n${body}\n\\end{${node.name}}`;
    }

    private serializeMacro(node: MacroNode): string {
        const optArgs = node.optionalArgs.map((opt) => `[${opt}]`).join('');
        const reqArgs = node.args.map((arg) => `{${arg}}`).join('');
        return `\\${node.name}${optArgs}${reqArgs}`;
    }

    private serializeUnknownBlock(node: UnknownBlockNode): string {
        return node.rawContent;
    }

    private serializeComment(node: CommentNode): string {
        return node.value;
    }

    private serializeText(node: TextNode): string {
        return node.value;
    }
}

export function serialize(node: ASTNode): string {
    const serializer = new LaTeXSerializer();
    return serializer.serialize(node);
}
