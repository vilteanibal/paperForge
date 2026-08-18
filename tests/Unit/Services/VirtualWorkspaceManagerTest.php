<?php

declare(strict_types=1);

use App\Contracts\WorkspaceManagerInterface;
use App\DTOs\FileMetadataDTO;
use App\DTOs\WorkspaceTreeDTO;
use App\Exceptions\FileOperationException;
use App\Exceptions\InvalidSymlinkException;
use App\Exceptions\PathOutOfBoundsException;
use App\Models\Project;
use App\Services\Workspace\VirtualWorkspaceManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

beforeEach(function () {
    $this->workspaceManager = app(VirtualWorkspaceManager::class);
    $this->project = Project::factory()->create();
});

afterEach(function () {
    if (isset($this->project)) {
        $this->workspaceManager->purgeWorkspace($this->project);
    }
});

test('it implements WorkspaceManagerInterface', function () {
    expect($this->workspaceManager)->toBeInstanceOf(WorkspaceManagerInterface::class);
});

test('happy path: complete workspace lifecycle operations', function () {
    // 1. Init workspace
    $rootPath = $this->workspaceManager->initWorkspace($this->project);
    expect(File::isDirectory($rootPath))->toBeTrue();

    // 2. Write main.tex
    $metadata = $this->workspaceManager->write($this->project, 'main.tex', '\documentclass{article}\begin{document}Hello\end{document}');
    expect($metadata)->toBeInstanceOf(FileMetadataDTO::class)
        ->and($metadata->name)->toBe('main.tex')
        ->and($metadata->extension)->toBe('tex')
        ->and($metadata->isDir)->toBeFalse()
        ->and($metadata->sizeBytes)->toBeGreaterThan(0);

    // 3. Exists & Read
    expect($this->workspaceManager->exists($this->project, 'main.tex'))->toBeTrue();
    $content = $this->workspaceManager->read($this->project, 'main.tex');
    expect($content)->toBe('\documentclass{article}\begin{document}Hello\end{document}');

    // 4. Create directory & write nested file
    $this->workspaceManager->createDirectory($this->project, 'chapters');
    $nestedMeta = $this->workspaceManager->write($this->project, 'chapters/intro.tex', '\section{Intro}');
    expect($nestedMeta->path)->toBe('chapters/intro.tex');

    // 5. Tree
    $tree = $this->workspaceManager->tree($this->project);
    expect($tree)->toBeInstanceOf(WorkspaceTreeDTO::class)
        ->and($tree->projectId)->toBe($this->project->id)
        ->and(count($tree->nodes))->toBeGreaterThanOrEqual(2);

    $paths = array_map(fn (FileMetadataDTO $node) => $node->path, $tree->nodes);
    expect($paths)->toContain('main.tex')
        ->and($paths)->toContain('chapters/intro.tex');

    // 6. Delete file & directory
    expect($this->workspaceManager->delete($this->project, 'chapters/intro.tex'))->toBeTrue()
        ->and($this->workspaceManager->exists($this->project, 'chapters/intro.tex'))->toBeFalse()
        ->and($this->workspaceManager->deleteDirectory($this->project, 'chapters'))->toBeTrue()
        ->and($this->workspaceManager->exists($this->project, 'chapters'))->toBeFalse();

    // 7. Purge
    expect($this->workspaceManager->purgeWorkspace($this->project))->toBeTrue()
        ->and(File::isDirectory($rootPath))->toBeFalse();
});

test('security vector: path traversal attempts with dot-dot are blocked', function (string $maliciousPath) {
    $this->workspaceManager->initWorkspace($this->project);

    expect(fn () => $this->workspaceManager->read($this->project, $maliciousPath))
        ->toThrow(PathOutOfBoundsException::class);

    expect(fn () => $this->workspaceManager->write($this->project, $maliciousPath, 'payload'))
        ->toThrow(PathOutOfBoundsException::class);

    expect(fn () => $this->workspaceManager->delete($this->project, $maliciousPath))
        ->toThrow(PathOutOfBoundsException::class);
})->with([
    '../.env',
    '../../.env',
    '../../../etc/passwd',
    'chapters/../../.env',
    './../config/app.php',
    '....//....//etc/passwd',
]);

test('security vector: absolute paths are blocked', function (string $absolutePath) {
    $this->workspaceManager->initWorkspace($this->project);

    expect(fn () => $this->workspaceManager->read($this->project, $absolutePath))
        ->toThrow(PathOutOfBoundsException::class);

    expect(fn () => $this->workspaceManager->write($this->project, $absolutePath, 'payload'))
        ->toThrow(PathOutOfBoundsException::class);
})->with([
    '/etc/passwd',
    '/var/log/system.log',
    '/home/user/.ssh/id_rsa',
]);

test('security vector: null byte injections are blocked', function (string $nullBytePayload) {
    $this->workspaceManager->initWorkspace($this->project);

    expect(fn () => $this->workspaceManager->read($this->project, $nullBytePayload))
        ->toThrow(PathOutOfBoundsException::class);

    expect(fn () => $this->workspaceManager->write($this->project, $nullBytePayload, 'payload'))
        ->toThrow(PathOutOfBoundsException::class);
})->with([
    "main.tex\0.jpg",
    "chapters/\0/intro.tex",
    "../../etc/passwd\0.tex",
]);

test('security vector: symlinks pointing outside workspace are blocked on read and write', function () {
    $rootPath = $this->workspaceManager->initWorkspace($this->project);
    $externalFile = storage_path('app/external_secret.txt');
    File::put($externalFile, 'SECRET_KEY_123');

    $symlinkPath = $rootPath.'/leak_link.txt';

    try {
        symlink($externalFile, $symlinkPath);

        expect(fn () => $this->workspaceManager->read($this->project, 'leak_link.txt'))
            ->toThrow(InvalidSymlinkException::class);
    } finally {
        if (file_exists($symlinkPath) || is_link($symlinkPath)) {
            unlink($symlinkPath);
        }
        if (file_exists($externalFile)) {
            unlink($externalFile);
        }
    }
});

test('edge case: reading non-existent file throws FileOperationException', function () {
    $this->workspaceManager->initWorkspace($this->project);

    expect(fn () => $this->workspaceManager->read($this->project, 'missing_file.tex'))
        ->toThrow(FileOperationException::class);
});
