<?php

declare(strict_types=1);

namespace App\DTOs;

readonly class SyncTeXReverseDTO
{
    public function __construct(
        public string $file,
        public int $line,
        public int $column = 0,
    ) {}

    /**
     * @return array{file: string, line: int, column: int}
     */
    public function toArray(): array
    {
        return [
            'file' => $this->file,
            'line' => $this->line,
            'column' => $this->column,
        ];
    }
}
