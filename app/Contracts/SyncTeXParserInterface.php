<?php

declare(strict_types=1);

namespace App\Contracts;

use App\DTOs\SyncTeXForwardDTO;
use App\DTOs\SyncTeXReverseDTO;

interface SyncTeXParserInterface
{
    /**
     * Map a source file and line to physical PDF page coordinates.
     */
    public function forwardQuery(string $synctexPath, string $sourceFile, int $line): ?SyncTeXForwardDTO;

    /**
     * Map a physical PDF page coordinate (page, x, y) back to source file and line.
     */
    public function reverseQuery(string $synctexPath, int $page, float $x, float $y): ?SyncTeXReverseDTO;
}
