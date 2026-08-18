import { create } from 'zustand';
import { parse } from '@/editor/ast/parser';
import { serialize } from '@/editor/ast/serializer';
import type { DocumentNode } from '@/editor/ast/types';

export type EditorMode = 'code' | 'visual' | 'split';
export type SyncOrigin = 'code' | 'visual' | 'disk' | 'none';

export interface EditorState {
    filePath: string;
    rawCode: string;
    ast: DocumentNode | null;
    activeMode: EditorMode;
    lastSource: SyncOrigin;
    isDirty: boolean;
    isCompiling: boolean;

    // Actions
    initFile: (filePath: string, content: string) => void;
    updateFromCode: (code: string) => void;
    updateFromVisual: (updater: (prevAst: DocumentNode) => DocumentNode) => void;
    setMode: (mode: EditorMode) => void;
    setDirty: (isDirty: boolean) => void;
    setCompiling: (isCompiling: boolean) => void;
    reset: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    filePath: 'main.tex',
    rawCode: '',
    ast: null,
    activeMode: 'split',
    lastSource: 'none',
    isDirty: false,
    isCompiling: false,

    initFile: (filePath: string, content: string) => {
        const parsedAst = parse(content);
        set({
            filePath,
            rawCode: content,
            ast: parsedAst,
            lastSource: 'disk',
            isDirty: false,
        });
    },

    updateFromCode: (code: string) => {
        const currentCode = get().rawCode;
        if (code === currentCode) return;

        // Parse AST directly from new code
        const newAst = parse(code);

        set({
            rawCode: code,
            ast: newAst,
            lastSource: 'code',
            isDirty: true,
        });
    },

    updateFromVisual: (updater: (prevAst: DocumentNode) => DocumentNode) => {
        const currentAst = get().ast;
        if (!currentAst) return;

        const updatedAst = updater(currentAst);
        const serializedCode = serialize(updatedAst);

        set({
            ast: updatedAst,
            rawCode: serializedCode,
            lastSource: 'visual',
            isDirty: true,
        });
    },

    setMode: (mode: EditorMode) => {
        set({ activeMode: mode });
    },

    setDirty: (isDirty: boolean) => {
        set({ isDirty });
    },

    setCompiling: (isCompiling: boolean) => {
        set({ isCompiling });
    },

    reset: () => {
        set({
            filePath: 'main.tex',
            rawCode: '',
            ast: null,
            activeMode: 'split',
            lastSource: 'none',
            isDirty: false,
            isCompiling: false,
        });
    },
}));
