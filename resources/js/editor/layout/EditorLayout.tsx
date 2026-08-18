import React from 'react';
import { useEditorStore } from '@/stores/useEditorStore';
import { ModeToggle } from './ModeToggle';
import { MonacoCodeEditor } from '../monaco/MonacoCodeEditor';
import { VisualEditor } from '../visual/VisualEditor';
import { Play, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export interface EditorLayoutProps {
    onSave?: () => void;
    onCompile?: () => void;
    pdfPanel?: React.ReactNode;
    sidebarPanel?: React.ReactNode;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
    onSave,
    onCompile,
    pdfPanel,
    sidebarPanel,
}) => {
    const {
        filePath,
        rawCode,
        ast,
        activeMode,
        isDirty,
        isCompiling,
        updateFromCode,
        updateFromVisual,
        setMode,
    } = useEditorStore();

    return (
        <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
            {/* Top Toolbar */}
            <header className="flex h-13 items-center justify-between border-b px-4 bg-card/60 backdrop-blur-xs z-10">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        paperForge
                    </span>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                        {filePath}
                    </span>
                    {isDirty ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                            <AlertCircle className="h-3 w-3" /> Unsaved
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                            <CheckCircle2 className="h-3 w-3" /> Saved
                        </span>
                    )}
                </div>

                {/* Center: Mode Toggle */}
                <div className="flex items-center">
                    <ModeToggle mode={activeMode} onChange={setMode} />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {onSave && (
                        <button
                            type="button"
                            onClick={onSave}
                            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                        >
                            <Save className="h-3.5 w-3.5" />
                            Save
                        </button>
                    )}

                    {onCompile && (
                        <button
                            type="button"
                            onClick={onCompile}
                            disabled={isCompiling}
                            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-medium shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                            <Play className={`h-3.5 w-3.5 fill-current ${isCompiling ? 'animate-spin' : ''}`} />
                            {isCompiling ? 'Compiling...' : 'Recompile'}
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Optional Sidebar */}
                {sidebarPanel && (
                    <aside className="w-64 border-r bg-card/40 flex-shrink-0 overflow-y-auto">
                        {sidebarPanel}
                    </aside>
                )}

                {/* Editor Split / View Area */}
                <main className="flex-1 flex overflow-hidden">
                    {activeMode === 'code' && (
                        <div className="flex-1 h-full">
                            <MonacoCodeEditor
                                value={rawCode}
                                onChange={updateFromCode}
                                onSave={onSave}
                            />
                        </div>
                    )}

                    {activeMode === 'visual' && (
                        <div className="flex-1 h-full">
                            <VisualEditor
                                ast={ast}
                                onUpdateAst={updateFromVisual}
                            />
                        </div>
                    )}

                    {activeMode === 'split' && (
                        <div className="flex-1 flex h-full">
                            <div className="w-1/2 h-full border-r">
                                <MonacoCodeEditor
                                    value={rawCode}
                                    onChange={updateFromCode}
                                    onSave={onSave}
                                />
                            </div>
                            <div className="w-1/2 h-full">
                                <VisualEditor
                                    ast={ast}
                                    onUpdateAst={updateFromVisual}
                                />
                            </div>
                        </div>
                    )}
                </main>

                {/* Optional PDF Preview Panel */}
                {pdfPanel && (
                    <div className="w-1/3 border-l bg-card/20 flex-shrink-0 overflow-hidden">
                        {pdfPanel}
                    </div>
                )}
            </div>
        </div>
    );
};
