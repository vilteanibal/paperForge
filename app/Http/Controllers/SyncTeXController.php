<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\SyncTeXParserInterface;
use App\Contracts\WorkspaceManagerInterface;
use App\Http\Requests\SyncTeX\ForwardSyncRequest;
use App\Http\Requests\SyncTeX\ReverseSyncRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class SyncTeXController extends Controller
{
    /**
     * Map a source file and line to physical PDF page coordinates.
     */
    public function forward(
        ForwardSyncRequest $request,
        Project $project,
        WorkspaceManagerInterface $workspaceManager,
        SyncTeXParserInterface $parser,
    ): JsonResponse {
        $synctexPath = $this->resolveSyncTeXPath($project, $workspaceManager);
        if ($synctexPath === null) {
            return response()->json([
                'message' => 'SyncTeX file not found. Please compile the project first.',
            ], 404);
        }

        $dto = $parser->forwardQuery(
            $synctexPath,
            (string) $request->validated('file'),
            (int) $request->validated('line'),
        );

        if ($dto === null) {
            return response()->json([
                'message' => 'No matching coordinates found for the requested line.',
            ], 404);
        }

        return response()->json($dto->toArray(), 200);
    }

    /**
     * Map a physical PDF page coordinate (page, x, y) back to source file and line.
     */
    public function reverse(
        ReverseSyncRequest $request,
        Project $project,
        WorkspaceManagerInterface $workspaceManager,
        SyncTeXParserInterface $parser,
    ): JsonResponse {
        $synctexPath = $this->resolveSyncTeXPath($project, $workspaceManager);
        if ($synctexPath === null) {
            return response()->json([
                'message' => 'SyncTeX file not found. Please compile the project first.',
            ], 404);
        }

        $dto = $parser->reverseQuery(
            $synctexPath,
            (int) $request->validated('page'),
            (float) $request->validated('x'),
            (float) $request->validated('y'),
        );

        if ($dto === null) {
            return response()->json([
                'message' => 'No matching source line found for the requested coordinate.',
            ], 404);
        }

        return response()->json($dto->toArray(), 200);
    }

    /**
     * Locate the .synctex.gz or .synctex absolute path for the given project.
     */
    private function resolveSyncTeXPath(Project $project, WorkspaceManagerInterface $workspaceManager): ?string
    {
        $setting = $project->setting;
        $mainFile = $setting !== null ? $setting->main_file : 'main.tex';
        $baseName = pathinfo($mainFile, PATHINFO_FILENAME);

        $gzFile = $baseName.'.synctex.gz';
        $plainFile = $baseName.'.synctex';

        $root = $workspaceManager->getRootPath($project);

        if ($workspaceManager->exists($project, $gzFile)) {
            return $root.DIRECTORY_SEPARATOR.$gzFile;
        }

        if ($workspaceManager->exists($project, $plainFile)) {
            return $root.DIRECTORY_SEPARATOR.$plainFile;
        }

        return null;
    }
}
