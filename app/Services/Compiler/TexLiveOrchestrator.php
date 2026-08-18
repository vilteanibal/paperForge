<?php

declare(strict_types=1);

namespace App\Services\Compiler;

use App\Contracts\CompilerOrchestratorInterface;
use App\Contracts\TeXBinaryResolverInterface;
use App\Contracts\WorkspaceManagerInterface;
use App\DTOs\CompileResultDTO;
use App\Enums\CompilerEngine;
use App\Exceptions\CompilationFailedException;
use App\Exceptions\CompilerTimeoutException;
use App\Models\Project;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class TexLiveOrchestrator implements CompilerOrchestratorInterface
{
    public function __construct(
        protected WorkspaceManagerInterface $workspaceManager,
        protected TeXBinaryResolverInterface $binaryResolver,
        protected LaTeXLogParser $logParser,
    ) {}

    /**
     * Execute a sandboxed compilation for the given project.
     *
     * @throws CompilerTimeoutException
     * @throws CompilationFailedException
     */
    public function compile(Project $project, int $timeoutSeconds = 60): CompileResultDTO
    {
        $setting = $project->setting;
        $engine = $setting !== null ? $setting->compiler_engine : CompilerEngine::PdfLaTeX;
        $mainFile = $setting !== null ? $setting->main_file : 'main.tex';

        $rootPath = $this->workspaceManager->initWorkspace($project);

        if (! $this->workspaceManager->exists($project, $mainFile)) {
            throw new CompilationFailedException("Main file '{$mainFile}' does not exist in the project workspace.", 404);
        }

        $binary = $this->binaryResolver->resolve($engine);

        $command = [
            $binary,
            '-interaction=nonstopmode',
            '-halt-on-error',
            '-no-shell-escape',
            '-file-line-error',
            '-synctex=1',
            $mainFile,
        ];

        $process = new Process($command, cwd: $rootPath, timeout: $timeoutSeconds);

        $startTime = hrtime(true);

        try {
            $process->run();
        } catch (ProcessTimedOutException) {
            throw new CompilerTimeoutException(
                "LaTeX compilation exceeded the maximum execution timeout of {$timeoutSeconds} seconds."
            );
        }

        $executionTimeMs = (int) round((hrtime(true) - $startTime) / 1e6);

        $baseName = pathinfo($mainFile, PATHINFO_FILENAME);
        $logFile = $baseName.'.log';
        $pdfFile = $baseName.'.pdf';

        $logContent = '';
        if ($this->workspaceManager->exists($project, $logFile)) {
            $logContent = $this->workspaceManager->read($project, $logFile);
        } else {
            $logContent = $process->getOutput()."\n".$process->getErrorOutput();
        }

        $diagnostics = $this->logParser->parse($logContent);

        $hasPdf = $this->workspaceManager->exists($project, $pdfFile);
        $success = $process->isSuccessful() && $hasPdf;

        return new CompileResultDTO(
            success: $success,
            pdfPath: $hasPdf ? $pdfFile : null,
            logContent: $logContent,
            executionTimeMs: $executionTimeMs,
            diagnostics: $diagnostics,
        );
    }
}
