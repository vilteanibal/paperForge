<?php

declare(strict_types=1);

namespace App\Contracts;

use App\DTOs\FileMetadataDTO;
use App\DTOs\WorkspaceTreeDTO;
use App\Models\Project;

interface WorkspaceManagerInterface
{
    /**
     * Initialize the physical directory structure for a project.
     */
    public function initWorkspace(Project $project): string;

    /**
     * Read the contents of a file in the project workspace.
     */
    public function read(Project $project, string $relativePath): string;

    /**
     * Write content to a file in the project workspace.
     */
    public function write(Project $project, string $relativePath, string $content): FileMetadataDTO;

    /**
     * Delete a file from the project workspace.
     */
    public function delete(Project $project, string $relativePath): bool;

    /**
     * Check if a file or directory exists in the project workspace.
     */
    public function exists(Project $project, string $relativePath): bool;

    /**
     * List all files and directories in the workspace as a tree.
     */
    public function tree(Project $project): WorkspaceTreeDTO;

    /**
     * Create a directory within the workspace.
     */
    public function createDirectory(Project $project, string $relativePath): bool;

    /**
     * Delete a directory and all its contents within the workspace.
     */
    public function deleteDirectory(Project $project, string $relativePath): bool;

    /**
     * Completely remove the project workspace directory from storage.
     */
    public function purgeWorkspace(Project $project): bool;

    /**
     * Get the absolute root storage path for a project.
     */
    public function getRootPath(Project $project): string;
}
