import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    ArrowSquareOut,
    BookOpen,
    Clock,
    Cpu,
    FileText,
    Folders,
    MagnifyingGlass,
    Plus,
    Sparkle,
    Trash,
} from '@phosphor-icons/react';

interface ProjectSettingData {
    compiler_engine: string;
    main_file: string;
}

interface ProjectData {
    id: string;
    name: string;
    storage_path: string;
    last_opened_at: string | null;
    created_at: string;
    updated_at: string;
    setting?: ProjectSettingData;
}

interface Props {
    projects: {
        data: ProjectData[];
    } | ProjectData[];
}

export default function DashboardIndex({ projects }: Props) {
    const projectList = Array.isArray(projects) ? projects : projects.data || [];

    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [compilerEngine, setCompilerEngine] = useState('pdflatex');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredProjects = projectList.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) return;

        setIsSubmitting(true);

        router.post(
            '/projects',
            {
                name: projectName.trim(),
                compiler_engine: compilerEngine,
                main_file: 'main.tex',
            },
            {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setProjectName('');
                    setIsSubmitting(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    const handleDeleteProject = (projectId: string, projectName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to permanently delete project "${projectName}"?`)) {
            return;
        }

        router.delete(`/projects/${projectId}`);
    };

    const formatDate = (isoString: string | null) => {
        if (!isoString) return 'Never opened';
        const date = new Date(isoString);
        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="border-b bg-card/60 backdrop-blur-xs sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg shadow-sm">
                            p
                        </div>
                        <div>
                            <h1 className="font-bold text-base tracking-tight leading-tight flex items-center gap-2">
                                paperForge
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                                    Local-First
                                </span>
                            </h1>
                            <p className="text-xs text-muted-foreground">Offline LaTeX IDE & Hybrid Editor</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                        >
                            <Plus className="h-4 w-4" />
                            New Project
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
                {/* Stats & Search Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Folders className="h-4 w-4 text-primary" />
                            <span>Total Projects: <strong className="text-foreground">{projectList.length}</strong></span>
                        </div>
                    </div>

                    <div className="relative w-full md:w-80">
                        <MagnifyingGlass className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..."
                            className="w-full pl-9 pr-4 py-2 bg-card border rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary font-medium"
                        />
                    </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-card/40 border border-dashed rounded-2xl p-8 max-w-lg mx-auto">
                        <BookOpen weight="duotone" className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                        <h3 className="text-base font-semibold text-foreground">No projects found</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                            {searchQuery ? 'No projects match your search query.' : 'Create your first local LaTeX document to get started.'}
                        </p>
                        {!searchQuery && (
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="mt-5 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Create Project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => router.visit(`/projects/${project.id}`)}
                                className="group relative bg-card border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <FileText weight="duotone" className="h-5 w-5" />
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold flex items-center gap-1">
                                                <Cpu weight="duotone" className="h-3 w-3" />
                                                {project.setting?.compiler_engine || 'pdflatex'}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                                                title="Delete Project"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {project.name}
                                    </h3>
                                    <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
                                        {project.setting?.main_file || 'main.tex'}
                                    </p>
                                </div>

                                <div className="mt-5 pt-3 border-t flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock weight="duotone" className="h-3 w-3" />
                                        {formatDate(project.last_opened_at || project.updated_at)}
                                    </span>

                                    <span className="inline-flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Open <ArrowSquareOut className="h-3 w-3" />
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
                    <div className="bg-card border rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <Sparkle weight="duotone" className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-bold text-base">New LaTeX Project</h3>
                                <p className="text-xs text-muted-foreground">Initialize an isolated local workspace</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-foreground">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="e.g. Quantum Electrodynamics Paper"
                                    className="w-full px-3 py-2 text-xs bg-background border rounded-lg outline-none focus:ring-1 focus:ring-primary font-medium"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 text-foreground">
                                    Compiler Engine
                                </label>
                                <select
                                    value={compilerEngine}
                                    onChange={(e) => setCompilerEngine(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-background border rounded-lg outline-none focus:ring-1 focus:ring-primary font-medium"
                                >
                                    <option value="pdflatex">pdfLaTeX (Standard / Fast)</option>
                                    <option value="xelatex">XeLaTeX (Modern Fonts & UTF-8)</option>
                                    <option value="lualatex">LuaLaTeX (Programmable / Advanced)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-3.5 py-2 rounded-lg text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !projectName.trim()}
                                    className="px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create & Open'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
