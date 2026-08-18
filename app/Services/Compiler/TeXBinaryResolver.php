<?php

declare(strict_types=1);

namespace App\Services\Compiler;

use App\Contracts\TeXBinaryResolverInterface;
use App\Enums\CompilerEngine;
use App\Exceptions\CompilerBinaryNotFoundException;
use Symfony\Component\Process\ExecutableFinder;

class TeXBinaryResolver implements TeXBinaryResolverInterface
{
    /**
     * Extra search directories for TeX Live distributions across platforms.
     *
     * @var list<string>
     */
    protected array $extraDirectories = [
        '/usr/bin',
        '/usr/local/bin',
        '/Library/TeX/texbin',
        '/usr/texbin',
        '/opt/homebrew/bin',
        '/snap/bin',
    ];

    public function __construct(
        protected ?ExecutableFinder $finder = null
    ) {
        $this->finder = $finder ?? new ExecutableFinder;
    }

    /**
     * Resolve the absolute path to the executable binary for the specified engine.
     *
     * @throws CompilerBinaryNotFoundException
     */
    public function resolve(CompilerEngine $engine): string
    {
        $binaryName = $engine->value;
        $path = $this->finder->find($binaryName, null, $this->extraDirectories);

        if ($path === null || ! is_executable($path)) {
            throw new CompilerBinaryNotFoundException(
                "TeX engine '{$binaryName}' is not installed or not executable on the host system."
            );
        }

        return $path;
    }

    /**
     * Check if the specified compiler engine is available on the system.
     */
    public function isAvailable(CompilerEngine $engine): bool
    {
        try {
            $this->resolve($engine);

            return true;
        } catch (CompilerBinaryNotFoundException) {
            return false;
        }
    }
}
