import type { CompletionProvider, Monaco, CompletionContext } from './types';

const BEGIN_REGEX = /\\begin\{([^}]*)$/;

interface EnvDefinition {
    name: string;
    detail: string;
    snippet: string;
}

const ENVIRONMENTS: EnvDefinition[] = [
    {
        name: 'equation',
        detail: 'Numbered mathematical equation',
        snippet: 'equation}\n\t$0\n\\end{equation}',
    },
    {
        name: 'align',
        detail: 'Multi-line aligned mathematical equations',
        snippet: 'align}\n\t$0\n\\end{align}',
    },
    {
        name: 'figure',
        detail: 'Floating figure with caption and label',
        snippet: 'figure}[htbp]\n\t\\centering\n\t\\includegraphics[width=0.8\\textwidth]{$1}\n\t\\caption{$2}\n\t\\label{fig:$3}\n\\end{figure}',
    },
    {
        name: 'table',
        detail: 'Floating table with tabular, caption and label',
        snippet: 'table}[htbp]\n\t\\centering\n\t\\begin{tabular}{$1}\n\t\t$0\n\t\\end{tabular}\n\t\\caption{$2}\n\t\\label{tab:$3}\n\\end{table}',
    },
    {
        name: 'itemize',
        detail: 'Bulleted list',
        snippet: 'itemize}\n\t\\item $0\n\\end{itemize}',
    },
    {
        name: 'enumerate',
        detail: 'Numbered list',
        snippet: 'enumerate}\n\t\\item $0\n\\end{enumerate}',
    },
    {
        name: 'abstract',
        detail: 'Document abstract section',
        snippet: 'abstract}\n\t$0\n\\end{abstract}',
    },
    {
        name: 'proof',
        detail: 'Mathematical proof block',
        snippet: 'proof}\n\t$0\n\\end{proof}',
    },
    {
        name: 'theorem',
        detail: 'Mathematical theorem block',
        snippet: 'theorem}\n\t$0\n\\end{theorem}',
    },
    {
        name: 'definition',
        detail: 'Formal definition block',
        snippet: 'definition}\n\t$0\n\\end{definition}',
    },
    {
        name: 'tabular',
        detail: 'Basic tabular column matrix',
        snippet: 'tabular}{$1}\n\t$0\n\\end{tabular}',
    },
    {
        name: 'bmatrix',
        detail: 'Bracketed matrix [...]',
        snippet: 'bmatrix}\n\t$0\n\\end{bmatrix}',
    },
    {
        name: 'pmatrix',
        detail: 'Parenthesized matrix (...)',
        snippet: 'pmatrix}\n\t$0\n\\end{pmatrix}',
    },
    {
        name: 'lstlisting',
        detail: 'Source code listing block',
        snippet: 'lstlisting}[language=$1]\n$0\n\\end{lstlisting}',
    },
];

export const environmentProvider: CompletionProvider = {
    provideCompletions(monaco: Monaco, context: CompletionContext) {
        const match = context.textUntilPosition.match(BEGIN_REGEX);
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

        return ENVIRONMENTS.map((env) => ({
            label: env.name,
            kind: monaco.languages.CompletionItemKind.Snippet,
            detail: env.detail,
            documentation: {
                value: `Inserts a \`\\begin{${env.name}}\` block with matching \`\\end{${env.name}}\`.`,
            },
            insertText: env.snippet,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
        }));
    },
};
