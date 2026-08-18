import type { CompletionProvider, Monaco, CompletionContext } from './types';

const MACRO_REGEX = /\\([a-zA-Z]*)$/;

interface MacroDefinition {
    name: string;
    detail: string;
    snippet: string;
}

const COMMON_MACROS: MacroDefinition[] = [
    { name: 'section', detail: 'Top-level section heading', snippet: 'section{$1}' },
    { name: 'subsection', detail: 'Second-level subsection heading', snippet: 'subsection{$1}' },
    { name: 'subsubsection', detail: 'Third-level subsubsection heading', snippet: 'subsubsection{$1}' },
    { name: 'textbf', detail: 'Bold text', snippet: 'textbf{$1}' },
    { name: 'textit', detail: 'Italic text', snippet: 'textit{$1}' },
    { name: 'underline', detail: 'Underlined text', snippet: 'underline{$1}' },
    { name: 'frac', detail: 'Mathematical fraction \\frac{num}{den}', snippet: 'frac{$1}{$2}' },
    { name: 'sqrt', detail: 'Square root \\sqrt{x}', snippet: 'sqrt{$1}' },
    { name: 'sum', detail: 'Summation symbol \\sum_{i=1}^{n}', snippet: 'sum_{$1}^{$2}' },
    { name: 'int', detail: 'Integral symbol \\int_{a}^{b}', snippet: 'int_{$1}^{$2}' },
    { name: 'label', detail: 'Anchor reference label', snippet: 'label{$1}' },
    { name: 'caption', detail: 'Float caption', snippet: 'caption{$1}' },
    { name: 'includegraphics', detail: 'Include graphics/image', snippet: 'includegraphics[width=${1:0.8\\textwidth}]{$2}' },
    { name: 'usepackage', detail: 'Import LaTeX package in preamble', snippet: 'usepackage{$1}' },
];

export const macroProvider: CompletionProvider = {
    provideCompletions(monaco: Monaco, context: CompletionContext) {
        // If inside \cite{, \ref{, or \begin{, let specialized providers handle it
        if (
            /\\(?:cite|ref|eqref|autoref|pageref|begin)\*?\{[^}]*$/.test(
                context.textUntilPosition
            )
        ) {
            return null;
        }

        const match = context.textUntilPosition.match(MACRO_REGEX);
        if (!match) {
            return null;
        }

        const typedPrefix = match[1];
        const startCol = context.position.column - typedPrefix.length;
        const range = new monaco.Range(
            context.position.lineNumber,
            startCol,
            context.position.lineNumber,
            context.position.column
        );

        return COMMON_MACROS.map((macro) => ({
            label: macro.name,
            kind: monaco.languages.CompletionItemKind.Function,
            detail: macro.detail,
            documentation: {
                value: `Inserts \`\\${macro.name}\` command snippet.`,
            },
            insertText: macro.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
        }));
    },
};
