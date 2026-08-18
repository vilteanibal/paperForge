<?php

declare(strict_types=1);

use App\Contracts\CompilerOrchestratorInterface;
use App\Contracts\WorkspaceManagerInterface;
use App\DTOs\CompileResultDTO;
use App\Enums\CompilerEngine;
use App\Exceptions\CompilationFailedException;
use App\Exceptions\CompilerTimeoutException;
use App\Models\Project;
use App\Models\ProjectSetting;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->workspaceManager = app(WorkspaceManagerInterface::class);
    $this->orchestrator = app(CompilerOrchestratorInterface::class);
    $this->project = Project::factory()->create();

    ProjectSetting::create([
        'project_id' => $this->project->id,
        'compiler_engine' => CompilerEngine::PdfLaTeX,
        'main_file' => 'main.tex',
    ]);
});

afterEach(function () {
    if (isset($this->project)) {
        $this->workspaceManager->purgeWorkspace($this->project);
    }
});

test('happy path: clean compilation generates PDF and returns CompileResultDTO', function () {
    $latexContent = <<<'TEX'
\documentclass{article}
\title{Automated Compilation Test}
\author{paperForge Agent}
\begin{document}
\maketitle
Hello from isolated LaTeX compilation!
\end{document}
TEX;

    $this->workspaceManager->write($this->project, 'main.tex', $latexContent);

    $result = $this->orchestrator->compile($this->project);

    expect($result)->toBeInstanceOf(CompileResultDTO::class)
        ->and($result->success)->toBeTrue()
        ->and($result->pdfPath)->toBe('main.pdf')
        ->and($result->executionTimeMs)->toBeGreaterThan(0)
        ->and($result->logContent)->not->toBeEmpty()
        ->and($this->workspaceManager->exists($this->project, 'main.pdf'))->toBeTrue();
});

test('security vector: anti-RCE prevents \write18 command execution', function () {
    $latexContent = <<<'TEX'
\documentclass{article}
\begin{document}
\immediate\write18{touch pwned_rce.txt}
Testing shell escape isolation.
\end{document}
TEX;

    $this->workspaceManager->write($this->project, 'main.tex', $latexContent);

    $this->orchestrator->compile($this->project);

    // pwned_rce.txt must NOT exist anywhere
    $rootPath = $this->workspaceManager->getRootPath($this->project);
    expect(File::exists($rootPath.'/pwned_rce.txt'))->toBeFalse()
        ->and(File::exists(base_path('pwned_rce.txt')))->toBeFalse();
});

test('security vector: anti-DoS aborts infinite loop and throws CompilerTimeoutException', function () {
    $latexContent = <<<'TEX'
\documentclass{article}
\begin{document}
\newcount\i
\i=0
\loop\iftrue
\advance\i by 1
\repeat
\end{document}
TEX;

    $this->workspaceManager->write($this->project, 'main.tex', $latexContent);

    expect(fn () => $this->orchestrator->compile($this->project, timeoutSeconds: 2))
        ->toThrow(CompilerTimeoutException::class);
});

test('it handles syntax errors and extracts diagnostics', function () {
    $latexContent = <<<'TEX'
\documentclass{article}
\begin{document}
\undefinedmacroerror
\end{document}
TEX;

    $this->workspaceManager->write($this->project, 'main.tex', $latexContent);

    $result = $this->orchestrator->compile($this->project);

    expect($result->success)->toBeFalse()
        ->and($result->pdfPath)->toBeNull()
        ->and($result->diagnostics)->not->toBeEmpty();

    $messages = array_map(fn ($d) => $d->message, $result->diagnostics);
    $hasUndefinedError = false;
    foreach ($messages as $msg) {
        if (str_contains($msg, 'Undefined control sequence') || str_contains($msg, 'undefinedmacroerror')) {
            $hasUndefinedError = true;
            break;
        }
    }
    expect($hasUndefinedError)->toBeTrue();
});

test('it throws CompilationFailedException when main file is missing', function () {
    expect(fn () => $this->orchestrator->compile($this->project))
        ->toThrow(CompilationFailedException::class);
});
