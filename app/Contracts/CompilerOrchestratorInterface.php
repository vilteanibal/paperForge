<?php

declare(strict_types=1);

namespace App\Contracts;

use App\DTOs\CompileResultDTO;
use App\Exceptions\CompilationFailedException;
use App\Exceptions\CompilerBinaryNotFoundException;
use App\Exceptions\CompilerTimeoutException;
use App\Models\Project;

interface CompilerOrchestratorInterface
{
    /**
     * Execute a sandboxed compilation for the given project.
     *
     * @throws CompilerTimeoutException
     * @throws CompilerBinaryNotFoundException
     * @throws CompilationFailedException
     */
    public function compile(Project $project, int $timeoutSeconds = 60): CompileResultDTO;
}
