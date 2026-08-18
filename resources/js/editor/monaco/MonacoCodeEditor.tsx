import React, { useCallback, useImperativeHandle, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { registerLatexCompletions } from './completions/registerCompletions';

export interface MonacoCodeEditorRef {
    jumpToLine: (line: number, column?: number) => void;
}

export interface MonacoCodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    onSave?: () => void;
    onSyncForward?: (line: number) => void;
    className?: string;
    readOnly?: boolean;
    theme?: 'vs-dark' | 'light';
}

export const MonacoCodeEditor = React.memo(
    React.forwardRef<MonacoCodeEditorRef, MonacoCodeEditorProps>(
        (
            {
                value,
                onChange,
                onSave,
                onSyncForward,
                className = '',
                readOnly = false,
                theme = 'vs-dark',
            },
            ref
        ) => {
            const editorRef = useRef<any>(null);

            useImperativeHandle(
                ref,
                () => ({
                    jumpToLine: (line: number, column: number = 1) => {
                        if (editorRef.current) {
                            editorRef.current.revealLineInCenter(line);
                            editorRef.current.setPosition({ lineNumber: line, column });
                            editorRef.current.focus();
                        }
                    },
                }),
                []
            );

            const handleEditorDidMount: OnMount = useCallback(
                (editor, monaco) => {
                    editorRef.current = editor;

                    // Register LaTeX IntelliSense (Citations, Labels, Environments, Macros)
                    registerLatexCompletions(monaco as any);

                    // Bind Ctrl+S / Cmd+S for quick save/compilation
                    if (onSave) {
                        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                            onSave();
                        });
                    }

                    // Bind F8 or Ctrl+Shift+J for Forward Sync (Jump to PDF)
                    if (onSyncForward) {
                        editor.addCommand(monaco.KeyCode.F8, () => {
                            const pos = editor.getPosition();
                            if (pos) {
                                onSyncForward(pos.lineNumber);
                            }
                        });

                        editor.addCommand(
                            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyJ,
                            () => {
                                const pos = editor.getPosition();
                                if (pos) {
                                    onSyncForward(pos.lineNumber);
                                }
                            }
                        );
                    }
                },
                [onSave, onSyncForward]
            );

            const handleChange = useCallback(
                (val: string | undefined) => {
                    onChange(val ?? '');
                },
                [onChange]
            );

            return (
                <div className={`h-full w-full overflow-hidden ${className}`}>
                    <Editor
                        height="100%"
                        defaultLanguage="latex"
                        language="latex"
                        value={value}
                        theme={theme}
                        onChange={handleChange}
                        onMount={handleEditorDidMount}
                        options={{
                            readOnly,
                            minimap: { enabled: false },
                            lineNumbers: 'on',
                            wordWrap: 'on',
                            scrollBeyondLastLine: false,
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
                            automaticLayout: true,
                            tabSize: 2,
                            cursorBlinking: 'smooth',
                            smoothScrolling: true,
                            padding: { top: 12, bottom: 12 },
                        }}
                    />
                </div>
            );
        }
    )
);

MonacoCodeEditor.displayName = 'MonacoCodeEditor';
