<?php

declare(strict_types=1);

namespace App\Contracts;

use App\DTOs\BibEntryDTO;

interface BibTeXParserInterface
{
    /**
     * Parse raw BibTeX content into structured DTOs.
     * Must be fault-tolerant: skips invalid entries without throwing exceptions.
     *
     * @return array<int, BibEntryDTO>
     */
    public function parse(string $content): array;
}
