<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\WorkspaceManagerInterface;
use App\Http\Requests\FileSystem\DeleteFileRequest;
use App\Http\Requests\FileSystem\ReadFileRequest;
use App\Http\Requests\FileSystem\WriteFileRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class FileSystemController extends Controller
{
    public function __construct(
        protected WorkspaceManagerInterface $workspaceManager
    ) {}

    /**
     * Read file content from the project workspace.
     */
    public function read(Project $project, ReadFileRequest $request): JsonResponse
    {
        $path = $request->validated('path');
        $content = $this->workspaceManager->read($project, $path);

        return response()->json([
            'path' => $path,
            'content' => $content,
        ]);
    }

    /**
     * Write file content to the project workspace.
     */
    public function write(Project $project, WriteFileRequest $request): JsonResponse
    {
        $path = $request->validated('path');
        $content = $request->validated('content');

        $metadata = $this->workspaceManager->write($project, $path, $content);

        return response()->json([
            'file' => $metadata->toArray(),
        ]);
    }

    /**
     * Delete a file from the project workspace.
     */
    public function delete(Project $project, DeleteFileRequest $request): JsonResponse
    {
        $path = $request->validated('path');
        $success = $this->workspaceManager->delete($project, $path);

        return response()->json([
            'success' => $success,
        ]);
    }

    /**
     * Retrieve the full hierarchical tree of files in the workspace.
     */
    public function tree(Project $project): JsonResponse
    {
        $tree = $this->workspaceManager->tree($project);

        return response()->json($tree->toArray());
    }
}
