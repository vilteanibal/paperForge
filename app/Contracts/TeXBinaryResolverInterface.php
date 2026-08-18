<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Enums\CompilerEngine;
use App\Exceptions\CompilerBinaryNotFoundException;

interface TeXBinaryResolverInterface
{
    /**
     * Resolve the absolute path to the executable binary for the specified engine.
     *
     * @throws CompilerBinaryNotFoundException
     */
    public function resolve(CompilerEngine $engine): string;

    /**
     * Check if the specified compiler engine is available on the system.
     */
    public function isAvailable(CompilerEngine $engine): bool;
}
