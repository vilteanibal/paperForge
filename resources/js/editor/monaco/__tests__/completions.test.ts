import { beforeEach, describe, expect, it } from 'vitest';
import { citationProvider } from '../completions/citationProvider';
import { referenceProvider } from '../completions/referenceProvider';
import { environmentProvider } from '../completions/environmentProvider';
import { macroProvider } from '../completions/macroProvider';
import { extractLabelsFromAst } from '../completions/labelExtractor';
import { useBibliographyStore } from '@/stores/useBibliographyStore';
import { useEditorStore } from '@/stores/useEditorStore';
import type { ASTNode } from '@/editor/ast/types';

// Mock Monaco object
const mockMonaco: any = {
    Range: class {
        constructor(
            public startLineNumber: number,
            public startColumn: number,
            public endLineNumber: number,
            public endColumn: number
        ) {}
    },
    languages: {
        CompletionItemKind: {
            Reference: 17,
            Constant: 14,
            Snippet: 27,
            Function: 2,
        },
        CompletionItemInsertTextRule: {
            InsertAsSnippet: 4,
        },
    },
};

describe('Monaco LaTeX IntelliSense Completions', () => {
    beforeEach(() => {
        useBibliographyStore.getState().clear();
        useEditorStore.getState().initFile('main.tex', '');
    });

    describe('citationProvider', () => {
        it('provides citation suggestions when inside \\cite{', () => {
            useBibliographyStore.getState().setEntries([
                {
                    citationKey: 'turing1936',
                    type: 'article',
                    title: 'On Computable Numbers',
                    author: 'Alan Turing',
                    year: '1936',
                    journal: 'Proc. London Math. Soc.',
                },
            ]);

            const lineContent = 'As shown in \\cite{tur';
            const context: any = {
                lineContent,
                textUntilPosition: lineContent,
                position: { lineNumber: 1, column: lineContent.length + 1 },
                wordRange: new mockMonaco.Range(1, 19, 1, 22),
            };

            const completions = citationProvider.provideCompletions(mockMonaco, context);
            expect(completions).not.toBeNull();
            expect(completions).toHaveLength(1);
            expect(completions![0].label).toBe('turing1936');
            expect(completions![0].detail).toBe('Alan Turing (1936)');
            expect(completions![0].insertText).toBe('turing1936');
        });

        it('returns null when context is not a citation command', () => {
            const lineContent = 'Just regular text';
            const context: any = {
                lineContent,
                textUntilPosition: lineContent,
                position: { lineNumber: 1, column: lineContent.length + 1 },
                wordRange: new mockMonaco.Range(1, 1, 1, 5),
            };

            const completions = citationProvider.provideCompletions(mockMonaco, context);
            expect(completions).toBeNull();
        });
    });

    describe('labelExtractor & referenceProvider', () => {
        it('extracts labels from AST and raw LaTeX text', () => {
            const mockAst: ASTNode[] = [
                {
                    id: 'node-1',
                    type: 'section',
                    level: 1,
                    title: 'Introduction \\label{sec:intro}',
                    starred: false,
                    children: [],
                },
                {
                    id: 'node-2',
                    type: 'math_block',
                    math: 'E = mc^2 \\label{eq:einstein}',
                },
            ];

            const labels = extractLabelsFromAst(mockAst, '\\caption{A figure}\\label{fig:diagram}');
            expect(labels).toEqual(['eq:einstein', 'fig:diagram', 'sec:intro']);
        });

        it('provides reference suggestions when inside \\ref{', () => {
            useEditorStore.getState().initFile(
                'main.tex',
                '\\section{Intro}\\label{sec:intro}\n\\begin{equation}\\label{eq:energy}E=mc^2\\end{equation}'
            );

            const lineContent = 'See Section \\ref{se';
            const context: any = {
                lineContent,
                textUntilPosition: lineContent,
                position: { lineNumber: 1, column: lineContent.length + 1 },
                wordRange: new mockMonaco.Range(1, 18, 1, 20),
            };

            const completions = referenceProvider.provideCompletions(mockMonaco, context);
            expect(completions).not.toBeNull();
            expect(completions!.map((c) => c.label)).toContain('sec:intro');
            expect(completions!.map((c) => c.label)).toContain('eq:energy');
        });
    });

    describe('environmentProvider', () => {
        it('provides environment snippets when inside \\begin{', () => {
            const lineContent = 'We start with \\begin{eq';
            const context: any = {
                lineContent,
                textUntilPosition: lineContent,
                position: { lineNumber: 1, column: lineContent.length + 1 },
                wordRange: new mockMonaco.Range(1, 22, 1, 24),
            };

            const completions = environmentProvider.provideCompletions(mockMonaco, context);
            expect(completions).not.toBeNull();

            const eq = completions!.find((c) => c.label === 'equation');
            expect(eq).toBeDefined();
            expect(eq!.insertText).toContain('\\end{equation}');
            expect(eq!.insertTextRules).toBe(
                mockMonaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            );
        });
    });

    describe('macroProvider', () => {
        it('provides common macros when typing \\', () => {
            const lineContent = 'Let us define \\sec';
            const context: any = {
                lineContent,
                textUntilPosition: lineContent,
                position: { lineNumber: 1, column: lineContent.length + 1 },
                wordRange: new mockMonaco.Range(1, 16, 1, 19),
            };

            const completions = macroProvider.provideCompletions(mockMonaco, context);
            expect(completions).not.toBeNull();

            const section = completions!.find((c) => c.label === 'section');
            expect(section).toBeDefined();
            expect(section!.insertText).toBe('section{$1}');
        });
    });
});
