import type { CompletionProvider, Monaco, CompletionContext } from './types';
import { useEditorStore } from '@/stores/useEditorStore';
import { extractLabelsFromAst } from './labelExtractor';

const REF_REGEX = /\\(?:ref|eqref|autoref|pageref|nameref)\*?\{([^}]*)$/;

export const referenceProvider: CompletionProvider = {
    provideCompletions(monaco: Monaco, context: CompletionContext) {
        const match = context.textUntilPosition.match(REF_REGEX);
        if (!match) {
            return null;
        }

        const editorState = useEditorStore.getState();
        const labels = extractLabelsFromAst(editorState.ast, editorState.rawCode);

        if (labels.length === 0) {
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

        return labels.map((label) => ({
            label,
            kind: monaco.languages.CompletionItemKind.Constant,
            detail: 'Cross-Reference Label',
            documentation: {
                value: `Reference to \`\\label{${label}}\``,
            },
            insertText: label,
            range,
        }));
    },
};
