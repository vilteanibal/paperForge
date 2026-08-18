/**
 * paperForge - LaTeX AST Engine Types
 * Pure TypeScript AST definitions with Discriminated Unions.
 */

export type TokenType =
    | 'COMMAND'
    | 'TEXT'
    | 'MATH_INLINE'
    | 'MATH_DISPLAY'
    | 'BRACE_OPEN'
    | 'BRACE_CLOSE'
    | 'BRACKET_OPEN'
    | 'BRACKET_CLOSE'
    | 'COMMENT'
    | 'SPECIAL'
    | 'NEWLINE'
    | 'EOF';

export interface SourcePosition {
    line: number;
    column: number;
    offset: number;
}

export interface SourceLocation {
    start: SourcePosition;
    end: SourcePosition;
}

export interface Token {
    type: TokenType;
    value: string;
    loc: SourceLocation;
}

export type InlineFormatType =
    | 'bold'
    | 'italic'
    | 'underline'
    | 'monospace'
    | 'strikethrough';

export interface BaseNode {
    id: string;
    loc?: SourceLocation;
}

export interface DocumentNode extends BaseNode {
    type: 'document';
    preamble: string;
    children: ASTNode[];
    hasDocumentEnv: boolean;
}

export interface SectionNode extends BaseNode {
    type: 'section';
    level: 1 | 2 | 3 | 4 | 5 | 6; // 1: section, 2: subsection, 3: subsubsection, etc.
    title: string;
    starred: boolean;
    label?: string;
    children: ASTNode[];
}

export interface ParagraphNode extends BaseNode {
    type: 'paragraph';
    children: ASTNode[];
}

export interface TextNode extends BaseNode {
    type: 'text';
    value: string;
}

export interface InlineFormattingNode extends BaseNode {
    type: 'inline_formatting';
    format: InlineFormatType;
    children: ASTNode[];
}

export interface MathInlineNode extends BaseNode {
    type: 'math_inline';
    math: string;
}

export interface MathBlockNode extends BaseNode {
    type: 'math_block';
    math: string;
    environment?: string; // 'equation', 'align', etc., or '$$', '\['
    numbered?: boolean;
}

export interface EnvironmentNode extends BaseNode {
    type: 'environment';
    name: string;
    options?: string;
    children: ASTNode[];
    rawContent?: string;
}

export interface MacroNode extends BaseNode {
    type: 'macro';
    name: string;
    args: string[];
    optionalArgs: string[];
}

export interface UnknownBlockNode extends BaseNode {
    type: 'unknown_block';
    rawContent: string;
}

export interface CommentNode extends BaseNode {
    type: 'comment';
    value: string;
}

export type ASTNode =
    | DocumentNode
    | SectionNode
    | ParagraphNode
    | TextNode
    | InlineFormattingNode
    | MathInlineNode
    | MathBlockNode
    | EnvironmentNode
    | MacroNode
    | UnknownBlockNode
    | CommentNode;
