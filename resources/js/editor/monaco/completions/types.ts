import type * as monaco from 'monaco-editor';

export type Monaco = typeof monaco;

export interface CompletionContext {
    model: monaco.editor.ITextModel;
    position: monaco.Position;
    lineContent: string;
    textUntilPosition: string;
    wordRange: monaco.Range;
}

export interface CompletionProvider {
    provideCompletions(
        monaco: Monaco,
        context: CompletionContext
    ): monaco.languages.CompletionItem[] | null;
}
