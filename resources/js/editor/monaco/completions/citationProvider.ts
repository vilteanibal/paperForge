import type { CompletionProvider, Monaco, CompletionContext } from './types';
import { useBibliographyStore } from '@/stores/useBibliographyStore';

const CITE_REGEX = /\\(?:cite|citep|citet|nocite|parencite|autocite)\*?\{([^}]*)$/;

export const citationProvider: CompletionProvider = {
    provideCompletions(monaco: Monaco, context: CompletionContext) {
        const match = context.textUntilPosition.match(CITE_REGEX);
        if (!match) {
            return null;
        }

        const entries = useBibliographyStore.getState().entries;
        if (!entries || entries.length === 0) {
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

        return entries.map((entry) => {
            const author = entry.author || 'Unknown Author';
            const year = entry.year || 'n.d.';
            const title = entry.title || entry.citationKey;
            const journal = entry.journal ? `\n\n*${entry.journal}*` : '';

            return {
                label: entry.citationKey,
                kind: monaco.languages.CompletionItemKind.Reference,
                detail: `${author} (${year})`,
                documentation: {
                    value: `### ${title}\n\n**Author:** ${author}\n**Year:** ${year}${journal}\n\n**Type:** \`@${entry.type}\``,
                },
                insertText: entry.citationKey,
                range,
            };
        });
    },
};
