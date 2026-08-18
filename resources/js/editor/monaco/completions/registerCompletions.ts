import type * as monaco from 'monaco-editor';
import type { Monaco, CompletionContext } from './types';
import { citationProvider } from './citationProvider';
import { referenceProvider } from './referenceProvider';
import { environmentProvider } from './environmentProvider';
import { macroProvider } from './macroProvider';

const PROVIDERS = [
    citationProvider,
    referenceProvider,
    environmentProvider,
    macroProvider,
];

let registeredDisposable: monaco.IDisposable | null = null;

export function registerLatexCompletions(monacoInstance: Monaco): monaco.IDisposable {
    // Prevent duplicate registrations
    if (registeredDisposable) {
        registeredDisposable.dispose();
        registeredDisposable = null;
    }

    const disposable = monacoInstance.languages.registerCompletionItemProvider('latex', {
        triggerCharacters: ['{', '\\'],
        provideCompletionItems(model, position) {
            const lineContent = model.getLineContent(position.lineNumber);
            const textUntilPosition = lineContent.substring(0, position.column - 1);
            const wordUntil = model.getWordUntilPosition(position);

            const wordRange = new monacoInstance.Range(
                position.lineNumber,
                wordUntil.startColumn,
                position.lineNumber,
                wordUntil.endColumn
            );

            const context: CompletionContext = {
                model,
                position,
                lineContent,
                textUntilPosition,
                wordRange,
            };

            for (const provider of PROVIDERS) {
                const completions = provider.provideCompletions(monacoInstance, context);
                if (completions && completions.length > 0) {
                    return {
                        suggestions: completions,
                    };
                }
            }

            return { suggestions: [] };
        },
    });

    registeredDisposable = disposable;
    return disposable;
}
