<?php

declare(strict_types=1);

use App\Contracts\WorkspaceManagerInterface;
use App\Enums\CompilerEngine;
use App\Models\Project;
use App\Models\ProjectSetting;

beforeEach(function () {
    $this->workspaceManager = app(WorkspaceManagerInterface::class);
    $this->project = Project::factory()->create();

    ProjectSetting::create([
        'project_id' => $this->project->id,
        'compiler_engine' => CompilerEngine::PdfLaTeX,
        'main_file' => 'main.tex',
    ]);

    $this->workspaceManager->initWorkspace($this->project);
});

afterEach(function () {
    if (isset($this->project)) {
        $this->workspaceManager->purgeWorkspace($this->project);
    }
});

test('compile endpoint executes compilation and returns structured result', function () {
    $latexContent = <<<'TEX'
\documentclass{article}
\begin{document}
HTTP Compiler Controller Test
\end{document}
TEX;

    $this->workspaceManager->write($this->project, 'main.tex', $latexContent);

    $response = $this->postJson(route('compile.run', $this->project), [
        'timeout' => 30,
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'pdfPath',
            'logContent',
            'executionTimeMs',
            'diagnostics',
        ])
        ->assertJsonPath('success', true)
        ->assertJsonPath('pdfPath', 'main.pdf');
});

test('download pdf endpoint returns binary pdf stream', function () {
    $latexContent = <<<'TEX'
\documentclass{article}
\begin{document}
PDF Streaming Test
\end{document}
TEX;

    $this->workspaceManager->write($this->project, 'main.tex', $latexContent);

    $this->postJson(route('compile.run', $this->project));

    $response = $this->get(route('compile.pdf', $this->project));

    $response->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

test('download pdf endpoint returns 404 when pdf does not exist', function () {
    $response = $this->get(route('compile.pdf', $this->project));

    $response->assertNotFound();
});
