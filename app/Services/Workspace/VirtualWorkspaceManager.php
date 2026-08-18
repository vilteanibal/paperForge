<?php

declare(strict_types=1);

namespace App\Services\Workspace;

use App\Contracts\WorkspaceManagerInterface;
use App\DTOs\FileMetadataDTO;
use App\DTOs\WorkspaceTreeDTO;
use App\Exceptions\FileOperationException;
use App\Exceptions\InvalidSymlinkException;
use App\Exceptions\PathOutOfBoundsException;
use App\Models\Project;
use Illuminate\Filesystem\Filesystem;
use Symfony\Component\Finder\SplFileInfo;

class VirtualWorkspaceManager implements WorkspaceManagerInterface
{
    public function __construct(
        protected Filesystem $files
    ) {}

    /**
     * Get the absolute root storage path for a project.
     */
    public function getRootPath(Project $project): string
    {
        return storage_path('app/projects/'.$project->id);
    }

    /**
     * Initialize the physical directory structure for a project.
     */
    public function initWorkspace(Project $project): string
    {
        $rootPath = $this->getRootPath($project);

        if (! $this->files->isDirectory($rootPath)) {
            $this->files->makeDirectory($rootPath, 0755, true);
        }

        return $rootPath;
    }

    /**
     * Read the contents of a file in the project workspace.
     */
    public function read(Project $project, string $relativePath): string
    {
        $resolved = $this->resolvePath($project, $relativePath, mustExist: true);

        if ($this->files->isDirectory($resolved)) {
            throw new FileOperationException("Cannot read directory as file: {$relativePath}");
        }

        return $this->files->get($resolved);
    }

    /**
     * Write content to a file in the project workspace.
     */
    public function write(Project $project, string $relativePath, string $content): FileMetadataDTO
    {
        $resolved = $this->resolvePath($project, $relativePath, mustExist: false);

        $parentDir = dirname($resolved);
        if (! $this->files->isDirectory($parentDir)) {
            $this->files->makeDirectory($parentDir, 0755, true);
        }

        $this->files->put($resolved, $content);

        return $this->createFileMetadataDTO($project, $relativePath, $resolved);
    }

    /**
     * Delete a file from the project workspace.
     */
    public function delete(Project $project, string $relativePath): bool
    {
        $resolved = $this->resolvePath($project, $relativePath, mustExist: true);

        return $this->files->delete($resolved);
    }

    /**
     * Check if a file or directory exists in the project workspace.
     */
    public function exists(Project $project, string $relativePath): bool
    {
        try {
            $this->resolvePath($project, $relativePath, mustExist: true);

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * List all files and directories in the workspace as a tree.
     */
    public function tree(Project $project): WorkspaceTreeDTO
    {
        $rootPath = $this->initWorkspace($project);
        $nodes = [];

        $allFiles = $this->files->allFiles($rootPath);
        /** @var SplFileInfo $file */
        foreach ($allFiles as $file) {
            $relative = $file->getRelativePathname();
            $nodes[] = $this->createFileMetadataDTO($project, $relative, $file->getRealPath());
        }

        return new WorkspaceTreeDTO(
            projectId: $project->id,
            rootPath: $rootPath,
            nodes: $nodes
        );
    }

    /**
     * Create a directory within the workspace.
     */
    public function createDirectory(Project $project, string $relativePath): bool
    {
        $resolved = $this->resolvePath($project, $relativePath, mustExist: false);

        if ($this->files->isDirectory($resolved)) {
            return true;
        }

        return $this->files->makeDirectory($resolved, 0755, true);
    }

    /**
     * Delete a directory and all its contents within the workspace.
     */
    public function deleteDirectory(Project $project, string $relativePath): bool
    {
        $resolved = $this->resolvePath($project, $relativePath, mustExist: true);

        if (! $this->files->isDirectory($resolved)) {
            throw new FileOperationException("Target path is not a directory: {$relativePath}");
        }

        return $this->files->deleteDirectory($resolved);
    }

    /**
     * Completely remove the project workspace directory from storage.
     */
    public function purgeWorkspace(Project $project): bool
    {
        $rootPath = $this->getRootPath($project);

        if ($this->files->isDirectory($rootPath)) {
            return $this->files->deleteDirectory($rootPath);
        }

        return true;
    }

    /**
     * Resolve and validate a relative path against the project sandbox.
     *
     * @throws PathOutOfBoundsException
     * @throws InvalidSymlinkException
     * @throws FileOperationException
     */
    protected function resolvePath(Project $project, string $relativePath, bool $mustExist = true): string
    {
        // 1. Syntactic validation: Null byte rejection
        if (str_contains($relativePath, "\0")) {
            throw new PathOutOfBoundsException('Null byte injection detected in path.');
        }

        // 2. Syntactic validation: Absolute paths rejection
        if (str_starts_with($relativePath, '/') || str_starts_with($relativePath, '\\')) {
            throw new PathOutOfBoundsException('Absolute paths are strictly forbidden.');
        }

        // 3. Syntactic validation: Dot-dot traversal rejection
        if (str_contains($relativePath, '..')) {
            throw new PathOutOfBoundsException('Path traversal sequences (..) are strictly forbidden.');
        }

        $normalized = str_replace('\\', '/', $relativePath);
        $segments = explode('/', $normalized);
        if (in_array('.', $segments, true)) {
            throw new PathOutOfBoundsException('Relative directory sequences (.) are strictly forbidden.');
        }

        // 4. Resolve sandbox root
        $rootPath = $this->initWorkspace($project);
        $rootReal = realpath($rootPath);

        if ($rootReal === false) {
            throw new PathOutOfBoundsException('Workspace root directory does not exist or is inaccessible.');
        }

        $candidate = $rootReal.DIRECTORY_SEPARATOR.ltrim($normalized, '/');

        // 5. Check if path is a symlink
        if (is_link($candidate)) {
            $symlinkTarget = realpath($candidate);
            if ($symlinkTarget === false || (! str_starts_with($symlinkTarget, $rootReal.DIRECTORY_SEPARATOR) && $symlinkTarget !== $rootReal)) {
                throw new InvalidSymlinkException('Symbolic link resolves outside project sandbox.');
            }
        }

        // 6. Existence and canonical containment check
        if ($mustExist) {
            if (! file_exists($candidate)) {
                throw new FileOperationException("File or directory not found: {$relativePath}", 404);
            }

            $resolvedReal = realpath($candidate);
            if ($resolvedReal === false || (! str_starts_with($resolvedReal, $rootReal.DIRECTORY_SEPARATOR) && $resolvedReal !== $rootReal)) {
                throw new PathOutOfBoundsException('Resolved path escapes workspace sandbox boundary.');
            }

            return $resolvedReal;
        }

        // 7. For non-existing targets (write/create), validate parent directory containment
        $parent = dirname($candidate);
        while (! file_exists($parent) && $parent !== dirname($parent)) {
            $parent = dirname($parent);
        }

        $parentReal = realpath($parent);
        if ($parentReal === false || (! str_starts_with($parentReal, $rootReal.DIRECTORY_SEPARATOR) && $parentReal !== $rootReal)) {
            throw new PathOutOfBoundsException('Target directory path escapes workspace sandbox boundary.');
        }

        return $candidate;
    }

    /**
     * Build a FileMetadataDTO for a validated path.
     */
    protected function createFileMetadataDTO(Project $project, string $relativePath, string $fullPath): FileMetadataDTO
    {
        $isDir = is_dir($fullPath);
        $size = $isDir ? 0 : (int) filesize($fullPath);
        $lastModified = (int) filemtime($fullPath);
        $extension = pathinfo($fullPath, PATHINFO_EXTENSION);
        $name = basename($fullPath);
        $mimeType = $isDir ? 'directory' : ($this->files->mimeType($fullPath) ?: 'text/plain');

        return new FileMetadataDTO(
            path: str_replace('\\', '/', $relativePath),
            name: $name,
            extension: $extension,
            sizeBytes: $size,
            mimeType: $mimeType,
            lastModified: $lastModified,
            isDir: $isDir,
        );
    }
}
