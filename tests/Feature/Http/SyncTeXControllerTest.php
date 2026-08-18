<?php

declare(strict_types=1);

use App\Contracts\WorkspaceManagerInterface;
use App\Models\Project;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->workspaceRoot = storage_path('framework/testing/workspaces');
    File::cleanDirectory($this->workspaceRoot);
});

afterEach(function () {
    File::cleanDirectory($this->workspaceRoot);
});

describe('SyncTeXController', function () {
    it('executes forward synctex queries returning page coordinates', function () {
        /** @var Project $project */
        $project = Project::factory()->create();

        /** @var WorkspaceManagerInterface $workspaceManager */
        $workspaceManager = app(WorkspaceManagerInterface::class);
        $workspaceManager->initWorkspace($project);

        $rawSyncTeX = <<<'SYNC'
SyncTeX Version:1
Input:1:./main.tex
Output:pdf
Magnification:1000
Unit:1
X Offset:0
Y Offset:0
Content:
!123
{1
[1,10:6553600,13107200:3276800,655360,0
]
}1
SYNC;

        $workspaceManager->write($project, 'main.synctex.gz', gzencode($rawSyncTeX));

        $response = $this->postJson("/api/synctex/{$project->id}/forward", [
            'file' => 'main.tex',
            'line' => 10,
        ]);

        $response->assertOk()
            ->assertJson([
                'page' => 1,
                'x' => 100.0,
                'y' => 200.0,
                'width' => 50.0,
            ]);
    });

    it('executes reverse synctex queries returning source line', function () {
        /** @var Project $project */
        $project = Project::factory()->create();

        /** @var WorkspaceManagerInterface $workspaceManager */
        $workspaceManager = app(WorkspaceManagerInterface::class);
        $workspaceManager->initWorkspace($project);

        $rawSyncTeX = <<<'SYNC'
SyncTeX Version:1
Input:1:./main.tex
Output:pdf
Magnification:1000
Unit:1
X Offset:0
Y Offset:0
Content:
!123
{1
[1,25:6553600,13107200:3276800,655360,0
]
}1
SYNC;

        $workspaceManager->write($project, 'main.synctex.gz', gzencode($rawSyncTeX));

        $response = $this->postJson("/api/synctex/{$project->id}/reverse", [
            'page' => 1,
            'x' => 100.0,
            'y' => 200.0,
        ]);

        $response->assertOk()
            ->assertJson([
                'file' => 'main.tex',
                'line' => 25,
                'column' => 0,
            ]);
    });

    it('blocks path traversal attempts in forward query', function () {
        /** @var Project $project */
        $project = Project::factory()->create();

        $response = $this->postJson("/api/synctex/{$project->id}/forward", [
            'file' => '../../../../etc/passwd',
            'line' => 1,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['file']);
    });

    it('returns 404 when synctex file does not exist', function () {
        /** @var Project $project */
        $project = Project::factory()->create();

        /** @var WorkspaceManagerInterface $workspaceManager */
        $workspaceManager = app(WorkspaceManagerInterface::class);
        $workspaceManager->initWorkspace($project);

        $response = $this->postJson("/api/synctex/{$project->id}/forward", [
            'file' => 'main.tex',
            'line' => 1,
        ]);

        $response->assertNotFound()
            ->assertJsonPath('message', 'SyncTeX file not found. Please compile the project first.');
    });
});
