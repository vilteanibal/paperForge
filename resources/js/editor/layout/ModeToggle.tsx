import React from 'react';
import type { EditorMode } from '@/stores/useEditorStore';
import { Code, Columns2, Eye } from 'lucide-react';

export interface ModeToggleProps {
    mode: EditorMode;
    onChange: (mode: EditorMode) => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
    return (
        <div className="inline-flex items-center rounded-lg bg-muted p-1 text-muted-foreground border">
            <button
                type="button"
                onClick={() => onChange('code')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    mode === 'code'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'hover:text-foreground hover:bg-background/50'
                }`}
                title="Code Editor Only"
            >
                <Code className="h-3.5 w-3.5" />
                Code
            </button>

            <button
                type="button"
                onClick={() => onChange('split')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    mode === 'split'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'hover:text-foreground hover:bg-background/50'
                }`}
                title="Split Side-by-Side View"
            >
                <Columns2 className="h-3.5 w-3.5" />
                Split
            </button>

            <button
                type="button"
                onClick={() => onChange('visual')}
                className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                    mode === 'visual'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'hover:text-foreground hover:bg-background/50'
                }`}
                title="Visual WYSIWYG Only"
            >
                <Eye className="h-3.5 w-3.5" />
                Visual
            </button>
        </div>
    );
};
