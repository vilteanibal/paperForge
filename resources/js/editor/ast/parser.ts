import type {
    ASTNode,
    CommentNode,
    DocumentNode,
    EnvironmentNode,
    InlineFormatType,
    InlineFormattingNode,
    MathBlockNode,
    MathInlineNode,
    ParagraphNode,
    SectionNode,
    TextNode,
    Token,
    UnknownBlockNode,
} from './types';
import { tokenize } from './lexer';

let nextId = 1;
function generateNodeId(prefix: string = 'node'): string {
    return `${prefix}_${nextId++}_${Math.random().toString(36).substring(2, 7)}`;
}

export class LaTeXParser {
    private tokens: Token[];
    private cursor: number = 0;
    private rawInput: string;

    constructor(inputOrTokens: string | Token[]) {
        if (typeof inputOrTokens === 'string') {
            this.rawInput = inputOrTokens;
            this.tokens = tokenize(inputOrTokens);
        } else {
            this.tokens = inputOrTokens;
            this.rawInput = '';
        }
    }

    public parse(): DocumentNode {
        // Check if document has \begin{document}
        const docBeginIndex = this.findDocBegin();

        if (docBeginIndex !== -1) {
            // Extract preamble raw text
            const docBeginToken = this.tokens[docBeginIndex];
            const preambleEndOffset = docBeginToken.loc.start.offset;
            const preamble = this.rawInput.substring(0, preambleEndOffset);

            // Move cursor past \begin{document}
            this.cursor = docBeginIndex;
            this.consume(); // \begin
            if (this.peek()?.type === 'BRACE_OPEN') {
                this.consume(); // {
                this.consume(); // document
                this.consume(); // }
            }

            const bodyNodes = this.parseNodesUntilDocEnd();

            return {
                id: generateNodeId('doc'),
                type: 'document',
                preamble,
                hasDocumentEnv: true,
                children: this.structureSections(bodyNodes),
            };
        } else {
            // No \begin{document}, parse entire content
            const nodes = this.parseNodeList(() => this.isAtEnd());

            return {
                id: generateNodeId('doc'),
                type: 'document',
                preamble: '',
                hasDocumentEnv: false,
                children: this.structureSections(nodes),
            };
        }
    }

    private findDocBegin(): number {
        for (let i = 0; i < this.tokens.length - 3; i++) {
            if (
                this.tokens[i].type === 'COMMAND' &&
                this.tokens[i].value === '\\begin' &&
                this.tokens[i + 1].type === 'BRACE_OPEN' &&
                this.tokens[i + 2].type === 'TEXT' &&
                this.tokens[i + 2].value.trim() === 'document' &&
                this.tokens[i + 3].type === 'BRACE_CLOSE'
            ) {
                return i;
            }
        }
        return -1;
    }

    private parseNodesUntilDocEnd(): ASTNode[] {
        return this.parseNodeList(() => {
            if (this.isAtEnd()) {
                return true;
            }
            if (
                this.tokens[this.cursor].type === 'COMMAND' &&
                this.tokens[this.cursor].value === '\\end' &&
                this.cursor + 3 < this.tokens.length &&
                this.tokens[this.cursor + 1].type === 'BRACE_OPEN' &&
                this.tokens[this.cursor + 2].type === 'TEXT' &&
                this.tokens[this.cursor + 2].value.trim() === 'document' &&
                this.tokens[this.cursor + 3].type === 'BRACE_CLOSE'
            ) {
                return true;
            }
            return false;
        });
    }

    private parseNodeList(stopCondition: () => boolean): ASTNode[] {
        const nodes: ASTNode[] = [];
        let currentParagraphChildren: ASTNode[] = [];

        const flushParagraph = () => {
            if (currentParagraphChildren.length > 0) {
                // If it's only empty whitespace newlines, skip wrapping or preserve
                const isOnlyWhitespace = currentParagraphChildren.every(
                    (n) => n.type === 'text' && n.value.trim() === ''
                );
                if (!isOnlyWhitespace) {
                    nodes.push({
                        id: generateNodeId('p'),
                        type: 'paragraph',
                        children: [...currentParagraphChildren],
                    });
                }
                currentParagraphChildren = [];
            }
        };

        while (!stopCondition() && !this.isAtEnd()) {
            const token = this.peek();
            if (!token) break;

            // Two or more newlines indicate paragraph break
            if (token.type === 'NEWLINE') {
                let newlineCount = 0;
                while (this.peek()?.type === 'NEWLINE') {
                    newlineCount++;
                    this.consume();
                }
                if (newlineCount >= 2) {
                    flushParagraph();
                } else if (currentParagraphChildren.length > 0) {
                    currentParagraphChildren.push({
                        id: generateNodeId('txt'),
                        type: 'text',
                        value: '\n',
                    });
                }
                continue;
            }

            // Sections, environments, math blocks flush paragraphs
            if (this.isBlockLevelCommand(token)) {
                flushParagraph();
                const blockNode = this.parseBlockNode();
                if (blockNode) {
                    nodes.push(blockNode);
                }
                continue;
            }

            // Inline items go to current paragraph
            const inlineNode = this.parseInlineNode();
            if (inlineNode) {
                currentParagraphChildren.push(inlineNode);
            }
        }

        flushParagraph();
        return nodes;
    }

    private isBlockLevelCommand(token: Token): boolean {
        if (token.type === 'MATH_DISPLAY') return true;
        if (token.type === 'COMMAND') {
            const val = token.value;
            if (
                val === '\\section' ||
                val === '\\section*' ||
                val === '\\subsection' ||
                val === '\\subsection*' ||
                val === '\\subsubsection' ||
                val === '\\subsubsection*' ||
                val === '\\paragraph' ||
                val === '\\subparagraph' ||
                val === '\\begin'
            ) {
                return true;
            }
        }
        return false;
    }

    private parseBlockNode(): ASTNode | null {
        const token = this.peek();
        if (!token) return null;

        if (token.type === 'MATH_DISPLAY') {
            this.consume();
            return {
                id: generateNodeId('math_block'),
                type: 'math_block',
                math: token.value,
            } as MathBlockNode;
        }

        if (token.type === 'COMMAND') {
            const cmd = token.value;

            // Sections
            if (
                cmd.startsWith('\\section') ||
                cmd.startsWith('\\subsection') ||
                cmd.startsWith('\\subsubsection') ||
                cmd.startsWith('\\paragraph') ||
                cmd.startsWith('\\subparagraph')
            ) {
                return this.parseSection(cmd);
            }

            // Environments: \begin{...}
            if (cmd === '\\begin') {
                return this.parseEnvironment();
            }
        }

        return null;
    }

    private parseSection(cmd: string): SectionNode {
        this.consume(); // consume command

        let level: 1 | 2 | 3 | 4 | 5 | 6 = 1;
        if (cmd.startsWith('\\subsection')) level = 2;
        else if (cmd.startsWith('\\subsubsection')) level = 3;
        else if (cmd.startsWith('\\paragraph')) level = 4;
        else if (cmd.startsWith('\\subparagraph')) level = 5;
        else level = 1;

        const starred = cmd.endsWith('*');
        const title = this.consumeBraceArgument();

        return {
            id: generateNodeId('sec'),
            type: 'section',
            level,
            title,
            starred,
            children: [],
        };
    }

    private parseEnvironment(): ASTNode {
        const startToken = this.consume(); // \begin
        const envName = this.consumeBraceArgument();

        // Check if options exist [options]
        let options: string | undefined;
        if (this.peek()?.type === 'BRACKET_OPEN') {
            options = this.consumeBracketArgument();
        }

        // Math environments
        const mathEnvs = ['equation', 'equation*', 'align', 'align*', 'gather', 'gather*', 'multline', 'multline*'];
        if (mathEnvs.includes(envName)) {
            let mathContent = '';
            while (!this.isAtEnd()) {
                if (this.isMatchingEnd(envName)) {
                    this.consumeEndEnvironment(envName);
                    break;
                }
                const tok = this.consume();
                mathContent += tok ? tok.value : '';
            }
            return {
                id: generateNodeId('math_block'),
                type: 'math_block',
                math: mathContent,
                environment: envName,
                numbered: !envName.endsWith('*'),
            } as MathBlockNode;
        }

        // Other standard or custom environments
        const children = this.parseNodeList(() => this.isMatchingEnd(envName));
        this.consumeEndEnvironment(envName);

        return {
            id: generateNodeId('env'),
            type: 'environment',
            name: envName,
            options,
            children,
        } as EnvironmentNode;
    }

    private isMatchingEnd(envName: string): boolean {
        if (
            this.cursor < this.tokens.length - 3 &&
            this.tokens[this.cursor].type === 'COMMAND' &&
            this.tokens[this.cursor].value === '\\end' &&
            this.tokens[this.cursor + 1].type === 'BRACE_OPEN' &&
            this.tokens[this.cursor + 2].type === 'TEXT' &&
            this.tokens[this.cursor + 2].value.trim() === envName &&
            this.tokens[this.cursor + 3].type === 'BRACE_CLOSE'
        ) {
            return true;
        }
        return false;
    }

    private consumeEndEnvironment(envName: string): void {
        if (this.isMatchingEnd(envName)) {
            this.consume(); // \end
            this.consume(); // {
            this.consume(); // envName
            this.consume(); // }
        }
    }

    private parseInlineNode(): ASTNode | null {
        const token = this.peek();
        if (!token) return null;

        if (token.type === 'COMMENT') {
            this.consume();
            return {
                id: generateNodeId('comment'),
                type: 'comment',
                value: token.value,
            } as CommentNode;
        }

        if (token.type === 'MATH_INLINE') {
            this.consume();
            return {
                id: generateNodeId('math_inline'),
                type: 'math_inline',
                math: token.value,
            } as MathInlineNode;
        }

        if (token.type === 'COMMAND') {
            const cmd = token.value;

            // Formatting
            const formatMap: Record<string, InlineFormatType> = {
                '\\textbf': 'bold',
                '\\textit': 'italic',
                '\\emph': 'italic',
                '\\underline': 'underline',
                '\\texttt': 'monospace',
                '\\sout': 'strikethrough',
            };

            if (cmd in formatMap) {
                this.consume();
                const content = this.consumeBraceArgument();
                return {
                    id: generateNodeId('fmt'),
                    type: 'inline_formatting',
                    format: formatMap[cmd],
                    children: [
                        {
                            id: generateNodeId('txt'),
                            type: 'text',
                            value: content,
                        } as TextNode,
                    ],
                } as InlineFormattingNode;
            }

            // Unknown or generic macro: preserve verbatim in UnknownBlockNode!
            return this.parseUnknownMacro();
        }

        if (token.type === 'TEXT' || token.type === 'SPECIAL' || token.type === 'BRACE_OPEN' || token.type === 'BRACE_CLOSE' || token.type === 'BRACKET_OPEN' || token.type === 'BRACKET_CLOSE') {
            this.consume();
            return {
                id: generateNodeId('txt'),
                type: 'text',
                value: token.value,
            } as TextNode;
        }

        this.consume();
        return null;
    }

    private parseUnknownMacro(): UnknownBlockNode {
        const startToken = this.consume(); // command
        let raw = startToken ? startToken.value : '';

        // Capture optional args [ ... ]
        while (this.peek()?.type === 'BRACKET_OPEN') {
            raw += '[' + this.consumeBracketArgument() + ']';
        }

        // Capture required args { ... }
        while (this.peek()?.type === 'BRACE_OPEN') {
            raw += '{' + this.consumeBraceArgument() + '}';
        }

        return {
            id: generateNodeId('unknown'),
            type: 'unknown_block',
            rawContent: raw,
        };
    }

    private consumeBraceArgument(): string {
        if (this.peek()?.type !== 'BRACE_OPEN') {
            return '';
        }
        this.consume(); // {
        let depth = 1;
        let content = '';

        while (!this.isAtEnd()) {
            const tok = this.peek();
            if (!tok) break;

            if (tok.type === 'BRACE_OPEN') {
                depth++;
                content += tok.value;
                this.consume();
            } else if (tok.type === 'BRACE_CLOSE') {
                depth--;
                this.consume();
                if (depth === 0) {
                    break;
                }
                content += tok.value;
            } else {
                content += tok.value;
                this.consume();
            }
        }
        return content;
    }

    private consumeBracketArgument(): string {
        if (this.peek()?.type !== 'BRACKET_OPEN') {
            return '';
        }
        this.consume(); // [
        let depth = 1;
        let content = '';

        while (!this.isAtEnd()) {
            const tok = this.peek();
            if (!tok) break;

            if (tok.type === 'BRACKET_OPEN') {
                depth++;
                content += tok.value;
                this.consume();
            } else if (tok.type === 'BRACKET_CLOSE') {
                depth--;
                this.consume();
                if (depth === 0) {
                    break;
                }
                content += tok.value;
            } else {
                content += tok.value;
                this.consume();
            }
        }
        return content;
    }

    private structureSections(nodes: ASTNode[]): ASTNode[] {
        const root: ASTNode[] = [];
        const sectionStack: SectionNode[] = [];

        for (const node of nodes) {
            if (node.type === 'section') {
                while (
                    sectionStack.length > 0 &&
                    sectionStack[sectionStack.length - 1].level >= node.level
                ) {
                    sectionStack.pop();
                }

                if (sectionStack.length === 0) {
                    root.push(node);
                } else {
                    sectionStack[sectionStack.length - 1].children.push(node);
                }

                sectionStack.push(node);
            } else {
                if (sectionStack.length === 0) {
                    root.push(node);
                } else {
                    sectionStack[sectionStack.length - 1].children.push(node);
                }
            }
        }

        return root;
    }

    private peek(): Token | null {
        return this.cursor < this.tokens.length ? this.tokens[this.cursor] : null;
    }

    private consume(): Token | null {
        if (this.cursor < this.tokens.length) {
            return this.tokens[this.cursor++];
        }
        return null;
    }

    private isAtEnd(): boolean {
        return this.cursor >= this.tokens.length || this.tokens[this.cursor].type === 'EOF';
    }
}

export function parse(input: string | Token[]): DocumentNode {
    const parser = new LaTeXParser(input);
    return parser.parse();
}
