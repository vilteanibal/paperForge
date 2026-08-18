import { beforeEach, describe, expect, it } from 'vitest';
import { useEditorStore } from '@/stores/useEditorStore';
import type { SectionNode } from '../ast/types';

describe('useEditorStore & Bidirectional Synchronization', () => {
    beforeEach(() => {
        useEditorStore.getState().reset();
    });

    it('initializes store with file content and parses initial AST', () => {
        const sampleTex = `\\documentclass{article}
\\begin{document}
\\section{Initial Header}
Hello world.
\\end{document}`;

        useEditorStore.getState().initFile('main.tex', sampleTex);

        const state = useEditorStore.getState();
        expect(state.filePath).toBe('main.tex');
        expect(state.rawCode).toBe(sampleTex);
        expect(state.ast).not.toBeNull();
        expect(state.ast?.children[0]?.type).toBe('section');
        expect((state.ast?.children[0] as SectionNode).title).toBe('Initial Header');
        expect(state.lastSource).toBe('disk');
        expect(state.isDirty).toBe(false);
    });

    it('updates AST when code is changed in Monaco (updateFromCode)', () => {
        const initialTex = `\\section{Original}`;
        useEditorStore.getState().initFile('main.tex', initialTex);

        const newTex = `\\section{Modified in Monaco}`;
        useEditorStore.getState().updateFromCode(newTex);

        const state = useEditorStore.getState();
        expect(state.rawCode).toBe(newTex);
        expect(state.lastSource).toBe('code');
        expect(state.isDirty).toBe(true);
        expect((state.ast?.children[0] as SectionNode).title).toBe('Modified in Monaco');
    });

    it('serializes code when AST is modified in visual editor (updateFromVisual)', () => {
        const initialTex = `\\documentclass{article}\n\\begin{document}\n\\section{Initial}\n\\end{document}\n`;
        useEditorStore.getState().initFile('main.tex', initialTex);

        useEditorStore.getState().updateFromVisual((prevAst) => {
            return {
                ...prevAst,
                children: [
                    {
                        id: 'sec_1',
                        type: 'section',
                        level: 1,
                        title: 'Updated from Visual Editor',
                        starred: false,
                        children: [],
                    },
                ],
            };
        });

        const state = useEditorStore.getState();
        expect(state.lastSource).toBe('visual');
        expect(state.isDirty).toBe(true);
        expect(state.rawCode).toContain('\\section{Updated from Visual Editor}');
    });

    it('prevents infinite sync loops under 100 rapid alternating cycles', () => {
        const initialTex = `\\section{Test Loop}`;
        useEditorStore.getState().initFile('main.tex', initialTex);

        for (let i = 1; i <= 100; i++) {
            if (i % 2 === 0) {
                useEditorStore.getState().updateFromCode(`\\section{Cycle ${i}}`);
            } else {
                useEditorStore.getState().updateFromVisual((prev) => ({
                    ...prev,
                    children: [
                        {
                            id: `sec_${i}`,
                            type: 'section',
                            level: 1,
                            title: `Visual Cycle ${i}`,
                            starred: false,
                            children: [],
                        },
                    ],
                }));
            }
        }

        const finalState = useEditorStore.getState();
        expect(finalState.rawCode).toBe('\\section{Cycle 100}');
        expect(finalState.lastSource).toBe('code');
    });
});
