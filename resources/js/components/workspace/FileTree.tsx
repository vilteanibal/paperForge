import React, { useState } from 'react';
import type { FileMetadata, WorkspaceTree } from '@/types/workspace';
import {
    FileCode,
    FileText,
    Folder,
    FolderOpen,
    Image,
    Plus,
    Trash2,
    File,
    ChevronRight,
    ChevronDown,
    BookOpen,
    Settings,
} from 'lucide-react';

export interface FileTreeProps {
    projectId: string;
    tree: WorkspaceTree;
    activePath: string;
    onSelectFile: (path: string) => void;
    onRefreshTree: () => Promise<void>;
    className?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({
    projectId,
    tree,
    activePath,
    onSelectFile,
    onRefreshTree,
    className = '',
}) => {
    const [collapsedDirs, setCollapsedDirs] = useState<Record<string, boolean>>({});
    const [isCreatingFile, setIsCreatingFile] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleCollapse = (dirPath: string) => {
        setCollapsedDirs((prev) => ({
            ...prev,
            [dirPath]: !prev[dirPath],
        }));
    };

    const getFileIcon = (node: FileMetadata) => {
        if (node.isDir) {
            const isCollapsed = collapsedDirs[node.path];
            return isCollapsed ? (
                <Folder className="h-4 w-4 text-amber-500 shrink-0" />
            ) : (
                <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
            );
        }

        const ext = node.extension?.toLowerCase() || '';

        if (ext === 'tex') {
            return <FileCode className="h-4 w-4 text-primary shrink-0" />;
        }
        if (ext === 'bib') {
            return <BookOpen className="h-4 w-4 text-emerald-500 shrink-0" />;
        }
        if (ext === 'sty' || ext === 'cls') {
            return <Settings className="h-4 w-4 text-purple-500 shrink-0" />;
        }
        if (['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext)) {
            return <Image className="h-4 w-4 text-blue-500 shrink-0" />;
        }
        if (ext === 'pdf') {
            return <FileText className="h-4 w-4 text-red-500 shrink-0" />;
        }

        return <File className="h-4 w-4 text-muted-foreground shrink-0" />;
    };

    const handleCreateFile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFileName.trim()) return;

        const sanitized = newFileName.trim().replace(/^[/|\\]+/, '');
        setIsSubmitting(true);

        try {
            const initialTemplate = sanitized.endsWith('.tex')
                ? '\\section{New Section}\n\n'
                : '';

            const res = await fetch(`/api/fs/${projectId}/write`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    path: sanitized,
                    content: initialTemplate,
                }),
            });

            if (res.ok) {
                setNewFileName('');
                setIsCreatingFile(false);
                await onRefreshTree();
                onSelectFile(sanitized);
            }
        } catch (err) {
            console.error('Failed to create file:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFile = async (path: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete '${path}'?`)) return;

        try {
            const res = await fetch(`/api/fs/${projectId}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ path }),
            });

            if (res.ok) {
                await onRefreshTree();
                if (activePath === path) {
                    onSelectFile('main.tex');
                }
            }
        } catch (err) {
            console.error('Failed to delete file:', err);
        }
    };

    // Group files by hierarchy
    const sortedNodes = [...tree.nodes].sort((a, b) => {
        if (a.isDir && !b.isDir) return -1;
        if (!a.isDir && b.isDir) return 1;
        return a.path.localeCompare(b.path);
    });

    return (
        <div className={`flex flex-col h-full bg-card/60 select-none text-xs text-foreground ${className}`}>
            {/* Header */}
            <div className="flex h-10 items-center justify-between px-3 border-b bg-muted/20 font-semibold tracking-tight">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Files</span>
                <button
                    type="button"
                    onClick={() => setIsCreatingFile(!isCreatingFile)}
                    className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="New File"
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Quick File Creator */}
            {isCreatingFile && (
                <form onSubmit={handleCreateFile} className="p-2 border-b bg-background/50 flex gap-1">
                    <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="e.g. chapters/intro.tex"
                        className="flex-1 px-2 py-1 text-xs bg-background border rounded outline-none focus:ring-1 focus:ring-primary font-mono"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newFileName.trim()}
                        className="px-2 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        Add
                    </button>
                </form>
            )}

            {/* Nodes List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                {sortedNodes.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground/60 text-xs">
                        No files in workspace
                    </div>
                ) : (
                    sortedNodes.map((node) => {
                        const isSelected = activePath === node.path;
                        const depth = (node.path.match(/\//g) || []).length;
                        const isDir = node.isDir;
                        const isMain = node.name === 'main.tex';

                        return (
                            <div
                                key={node.path}
                                onClick={() => {
                                    if (isDir) {
                                        toggleCollapse(node.path);
                                    } else {
                                        onSelectFile(node.path);
                                    }
                                }}
                                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                                className={`flex items-center justify-between py-1.5 pr-2 rounded-md cursor-pointer group transition-all ${
                                    isSelected
                                        ? 'bg-primary/15 text-primary font-semibold'
                                        : 'hover:bg-muted/70 text-foreground/80'
                                }`}
                            >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    {isDir ? (
                                        collapsedDirs[node.path] ? (
                                            <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                        ) : (
                                            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
                                        )
                                    ) : null}

                                    {getFileIcon(node)}

                                    <span className="truncate font-mono text-[11px]">
                                        {node.name}
                                    </span>

                                    {isMain && (
                                        <span className="text-[9px] px-1 py-0.2 bg-primary/20 text-primary font-bold rounded">
                                            MAIN
                                        </span>
                                    )}
                                </div>

                                {!isMain && !isDir && (
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteFile(node.path, e)}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all"
                                        title="Delete File"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
