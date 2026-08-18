<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\WorkspaceManagerInterface;
use App\Enums\CompilerEngine;
use App\Http\Requests\Projects\StoreProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(
        protected WorkspaceManagerInterface $workspaceManager
    ) {}

    /**
     * Display a listing of projects.
     */
    public function index(Request $request): Response|JsonResponse
    {
        $projects = Project::with('setting')
            ->orderByDesc('last_opened_at')
            ->get();

        if ($request->wantsJson()) {
            return response()->json([
                'data' => ProjectResource::collection($projects),
            ]);
        }

        return Inertia::render('Dashboard/Index', [
            'projects' => ProjectResource::collection($projects),
        ]);
    }

    /**
     * Store a newly created project in storage.
     */
    public function store(StoreProjectRequest $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validated();

        /** @var Project $project */
        $project = DB::transaction(function () use ($validated): Project {
            $project = Project::create([
                'name' => $validated['name'],
                'storage_path' => 'projects/'.Str::uuid(),
                'last_opened_at' => now(),
            ]);

            $project->setting()->create([
                'compiler_engine' => $validated['compiler_engine'] ?? CompilerEngine::PdfLaTeX,
                'main_file' => $validated['main_file'] ?? 'main.tex',
            ]);

            return $project;
        });

        // Initialize virtual workspace with initial main.tex template
        $this->workspaceManager->initWorkspace($project);
        $mainFile = $project->setting !== null ? $project->setting->main_file : 'main.tex';

        if (! $this->workspaceManager->exists($project, $mainFile)) {
            $initialContent = "\\documentclass{article}\n\\title{".addslashes($project->name)."}\n\\author{LocalUser}\n\\begin{document}\n\\maketitle\n\n\\section{Introduction}\nWelcome to your paperForge document.\n\n\\end{document}\n";
            $this->workspaceManager->write($project, $mainFile, $initialContent);
        }

        if ($request->wantsJson()) {
            return (new ProjectResource($project->load('setting')))
                ->response()
                ->setStatusCode(201);
        }

        return redirect()->route('projects.show', $project);
    }

    /**
     * Display the specified project in the editor workspace.
     */
    public function show(Request $request, Project $project): Response|JsonResponse
    {
        $project->update(['last_opened_at' => now()]);
        $project->load('setting');

        $tree = $this->workspaceManager->tree($project)->toArray();

        if ($request->wantsJson()) {
            return response()->json([
                'project' => new ProjectResource($project),
                'tree' => $tree,
            ]);
        }

        return Inertia::render('Editor/Show', [
            'project' => new ProjectResource($project),
            'tree' => $tree,
        ]);
    }

    /**
     * Remove the specified project and its virtual workspace from storage.
     */
    public function destroy(Request $request, Project $project): RedirectResponse|JsonResponse
    {
        $this->workspaceManager->purgeWorkspace($project);
        $project->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Project workspace deleted successfully.',
            ]);
        }

        return redirect()->route('projects.index');
    }
}
