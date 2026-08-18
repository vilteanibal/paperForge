import React, { useEffect, useState, useCallback, useRef } from 'react';
import type { WorkspaceTree } from '@/types/workspace';
import { useEditorStore } from '@/stores/useEditorStore';
import { useCompiler } from '@/hooks/useCompiler';
import { useSyncTeX } from '@/hooks/useSyncTeX';
import { useGlobalShortcuts } from '@/hooks/useGlobalShortcuts';
import { FileTree } from '@/components/workspace/FileTree';
import { MonacoCodeEditor, type MonacoCodeEditorRef } from '@/editor/monaco/MonacoCodeEditor';
import { VisualEditor } from '@/editor/visual/VisualEditor';
import { ModeToggle } from '@/editor/layout/ModeToggle';
import { PdfViewer } from '@/components/pdf/PdfViewer';
import { DiagnosticsPanel } from '@/components/diagnostics/DiagnosticsPanel';
import { router } from '@inertiajs/react';
import {
    ArrowLeft,
    CheckCircle,
    Cpu,
    FloppyDisk,
    Play,
    WarningCircle,
} from '@phosphor-icons/react';

interface ProjectData {
    id: string;
    name: string;
    storage_path: string;
    last_opened_at: string | null;
    created_at: string;
    updated_at: string;
    setting?: {
        compiler_engine: string;
        main_file: string;
    };
}

interface Props {
    project: {
        data: ProjectData;
    } | ProjectData;
    tree: WorkspaceTree;
}

export default function EditorShow({ project: projectProp, tree: initialTree }: Props) {
    const project = 'data' in projectProp ? projectProp.data : projectProp;

    const [currentTree, setCurrentTree] = useState<WorkspaceTree>(initialTree);
    const [activeFilePath, setActiveFilePath] = useState<string>(
        project.setting?.main_file || 'main.tex'
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(true);

    const monacoRef = useRef<MonacoCodeEditorRef | null>(null);

    const {
        rawCode,
        ast,
        activeMode,
        isDirty,
        initFile,
        updateFromCode,
        updateFromVisual,
        setMode,
        setDirty,
    } = useEditorStore();

    const {
        isCompiling,
        pdfBlobUrl,
        diagnostics,
        rawLogs,
        triggerCompile,
    } = useCompiler(project.id);

    const {
        highlightRect,
        syncForward,
        syncReverse,
    } = useSyncTeX(project.id);

    // Refresh tree helper
    const refreshTree = useCallback(async () => {
        try {
            const res = await fetch(`/api/fs/${project.id}/tree`);
            if (res.ok) {
                const updatedTree: WorkspaceTree = await res.json();
                setCurrentTree(updatedTree);
            }
        } catch (err) {
            console.error('Failed to refresh tree:', err);
        }
    }, [project.id]);

    // Load active file content
    const loadFile = useCallback(
        async (path: string) => {
            try {
                const res = await fetch(`/api/fs/${project.id}/read`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ path }),
                });

                if (res.ok) {
                    const data = await res.json();
                    initFile(path, data.content);
                    setActiveFilePath(path);
                }
            } catch (err) {
                console.error(`Failed to load file ${path}:`, err);
            }
        },
        [project.id, initFile]
    );

    // Initial file load on mount
    useEffect(() => {
        const targetMain = project.setting?.main_file || 'main.tex';
        loadFile(targetMain);
    }, [loadFile, project.setting?.main_file]);

    // Save active file content
    const handleSaveFile = useCallback(async () => {
        if (!activeFilePath) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/fs/${project.id}/write`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    path: activeFilePath,
                    content: rawCode,
                }),
            });

            if (res.ok) {
                setDirty(false);
            }
        } catch (err) {
            console.error('Failed to save file:', err);
        } finally {
            setIsSaving(false);
        }
    }, [activeFilePath, project.id, rawCode, setDirty]);

    // Forward Sync: Jump from source line to PDF
    const handleSyncForward = useCallback(
        async (line: number) => {
            await syncForward(activeFilePath, line);
        },
        [syncForward, activeFilePath]
    );

    // Reverse Sync: Jump from double click on PDF to source code
    const handleCanvasDoubleClick = useCallback(
        async (page: number, x_pt: number, y_pt: number) => {
            const res = await syncReverse(page, x_pt, y_pt);
            if (res) {
                if (res.file && res.file !== activeFilePath) {
                    await loadFile(res.file);
                }
                if (activeMode === 'visual') {
                    setMode('code');
                }
                setTimeout(() => {
                    monacoRef.current?.jumpToLine(res.line, res.column || 1);
                }, 50);
            }
        },
        [syncReverse, activeFilePath, loadFile, activeMode, setMode]
    );

    // Global Shortcuts
    useGlobalShortcuts([
        {
            key: 's',
            ctrlOrCmd: true,
            handler: () => {
                handleSaveFile();
            },
            description: 'Save File',
        },
        {
            key: 'Enter',
            ctrlOrCmd: true,
            handler: () => {
                handleSaveFile().then(() => triggerCompile());
            },
            description: 'Save and Compile',
        },
        {
            key: 'b',
            ctrlOrCmd: true,
            handler: () => {
                handleSaveFile().then(() => triggerCompile());
            },
            description: 'Save and Compile',
        },
    ]);

    const handleDiagnosticClick = (line: number) => {
        if (activeMode === 'visual') {
            setMode('split');
        }
        setTimeout(() => {
            monacoRef.current?.jumpToLine(line, 1);
        }, 50);
    };

    return (
        <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
            {/* Top Toolbar */}
            <header className="flex h-13 items-center justify-between border-b px-4 bg-card/60 backdrop-blur-xs z-10 select-none">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.visit('/')}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                            {project.name}
                        </span>
                        <span className="text-muted-foreground/40">/</span>
                        <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">
                            {activeFilePath}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 pl-2">
                        {isDirty ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-500 font-medium">
                                <WarningCircle weight="duotone" className="h-3 w-3" /> Unsaved
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                                <CheckCircle weight="duotone" className="h-3 w-3" /> Saved
                            </span>
                        )}
                    </div>
                </div>

                {/* Center: Mode Selector */}
                <div className="flex items-center">
                    <ModeToggle mode={activeMode} onChange={setMode} />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2.5">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold flex items-center gap-1">
                        <Cpu weight="duotone" className="h-3 w-3" />
                        {project.setting?.compiler_engine || 'pdflatex'}
                    </span>

                    <button
                        type="button"
                        onClick={handleSaveFile}
                        disabled={isSaving}
                        className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors cursor-pointer"
                        title="Ctrl+S / Cmd+S"
                    >
                        <FloppyDisk className="h-3.5 w-3.5" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSaveFile().then(() => triggerCompile())}
                        disabled={isCompiling}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-3.5 py-1.5 text-xs font-semibold shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer"
                        title="Ctrl+Enter / Cmd+Enter"
                    >
                        <Play weight="fill" className={`h-3.5 w-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
                        {isCompiling ? 'Compiling...' : 'Compile'}
                    </button>
                </div>
            </header>

            {/* Main Studio Workspace */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar: File Tree */}
                <aside className="w-56 border-r bg-card/40 flex-shrink-0 overflow-hidden">
                    <FileTree
                        projectId={project.id}
                        tree={currentTree}
                        activePath={activeFilePath}
                        onSelectFile={(path) => loadFile(path)}
                        onRefreshTree={refreshTree}
                    />
                </aside>

                {/* Center / Editor Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 flex overflow-hidden">
                        {activeMode === 'code' && (
                            <div className="flex-1 h-full">
                                <MonacoCodeEditor
                                    ref={monacoRef}
                                    value={rawCode}
                                    onChange={updateFromCode}
                                    onSave={handleSaveFile}
                                    onSyncForward={handleSyncForward}
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
                                        ref={monacoRef}
                                        value={rawCode}
                                        onChange={updateFromCode}
                                        onSave={handleSaveFile}
                                        onSyncForward={handleSyncForward}
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

                    {/* Bottom: Diagnostics Panel */}
                    <DiagnosticsPanel
                        diagnostics={diagnostics}
                        rawLogs={rawLogs}
                        isOpen={isDiagnosticsOpen}
                        onToggle={() => setIsDiagnosticsOpen(!isDiagnosticsOpen)}
                        onDiagnosticClick={handleDiagnosticClick}
                    />
                </div>

                {/* Right: PDF Viewer Preview */}
                <aside className="w-[42%] border-l bg-card/20 flex-shrink-0 overflow-hidden">
                    <PdfViewer
                        pdfUrl={pdfBlobUrl}
                        isLoading={isCompiling}
                        highlightRect={highlightRect}
                        targetPage={highlightRect?.page || null}
                        onCanvasDoubleClick={handleCanvasDoubleClick}
                        onRecompile={() => handleSaveFile().then(() => triggerCompile())}
                    />
                </aside>
            </div>
        </div>
    );
}
