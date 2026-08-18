import { describe, expect, it } from 'vitest';
import { parse } from '../parser';
import type { SectionNode, ParagraphNode, InlineFormattingNode, MathBlockNode, UnknownBlockNode } from '../types';

describe('LaTeXParser', () => {
    it('parses sections and paragraphs hierarchy', () => {
        const input = `\\documentclass{article}
\\begin{document}
\\section{Introduction}
This is the first paragraph.

This is the second paragraph.
\\end{document}`;

        const ast = parse(input);

        expect(ast.type).toBe('document');
        expect(ast.hasDocumentEnv).toBe(true);
        expect(ast.children).toHaveLength(1);

        const section = ast.children[0] as SectionNode;
        expect(section.type).toBe('section');
        expect(section.level).toBe(1);
        expect(section.title).toBe('Introduction');
        expect(section.children).toHaveLength(2);

        const p1 = section.children[0] as ParagraphNode;
        const p2 = section.children[1] as ParagraphNode;
        expect(p1.type).toBe('paragraph');
        expect(p2.type).toBe('paragraph');
    });

    it('preserves unknown macros as UnknownBlockNode without syntax errors', () => {
        const input = `\\myCustomPackageMacro[option1,option2]{param1}{param2}`;
        const ast = parse(input);

        expect(ast.children).toHaveLength(1);
        const p = ast.children[0] as ParagraphNode;
        const unknown = p.children[0] as UnknownBlockNode;

        expect(unknown.type).toBe('unknown_block');
        expect(unknown.rawContent).toBe('\\myCustomPackageMacro[option1,option2]{param1}{param2}');
    });

    it('parses inline formatting and math equations', () => {
        const input = `We prove that \\textbf{bold text} and \\textit{italic text} satisfy:
\\begin{equation}
e^{i\\pi} + 1 = 0
\\end{equation}`;

        const ast = parse(input);

        const p = ast.children[0] as ParagraphNode;
        expect(p.type).toBe('paragraph');

        const boldNode = p.children.find((c) => c.type === 'inline_formatting' && c.format === 'bold') as InlineFormattingNode;
        expect(boldNode).toBeDefined();

        const mathBlock = ast.children.find((c) => c.type === 'math_block') as MathBlockNode;
        expect(mathBlock).toBeDefined();
        expect(mathBlock.environment).toBe('equation');
        expect(mathBlock.math.trim()).toBe('e^{i\\pi} + 1 = 0');
    });
});
