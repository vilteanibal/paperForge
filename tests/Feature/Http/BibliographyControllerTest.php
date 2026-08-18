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

describe('BibliographyController', function () {
    it('scans workspace and returns parsed bibliography entries', function () {
        /** @var Project $project */
        $project = Project::factory()->create();

        /** @var WorkspaceManagerInterface $workspaceManager */
        $workspaceManager = app(WorkspaceManagerInterface::class);
        $workspaceManager->initWorkspace($project);

        $bibContent = <<<'BIB'
@article{shannon1948,
    author = {Claude E. Shannon},
    title = {A Mathematical Theory of Communication},
    journal = {Bell System Technical Journal},
    year = {1948}
}

@inproceedings{turing1936,
    author = {Alan M. Turing},
    title = {On Computable Numbers},
    year = {1936}
}
BIB;

        $workspaceManager->write($project, 'references.bib', $bibContent);

        $response = $this->getJson("/api/projects/{$project->id}/bibliography");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'citationKey',
                        'type',
                        'title',
                        'author',
                        'year',
                        'journal',
                        'fields',
                    ],
                ],
                'total',
            ])
            ->assertJsonPath('total', 2)
            ->assertJsonPath('data.0.citationKey', 'shannon1948')
            ->assertJsonPath('data.0.author', 'Claude E. Shannon')
            ->assertJsonPath('data.1.citationKey', 'turing1936');
    });

    it('returns empty array when no .bib files exist in workspace', function () {
        /** @var Project $project */
        $project = Project::factory()->create();

        /** @var WorkspaceManagerInterface $workspaceManager */
        $workspaceManager = app(WorkspaceManagerInterface::class);
        $workspaceManager->initWorkspace($project);

        $response = $this->getJson("/api/projects/{$project->id}/bibliography");

        $response->assertOk()
            ->assertExactJson([
                'data' => [],
                'total' => 0,
            ]);
    });
});
