<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class LaTeXDiagnosticDTO
{
    public function __construct(
        public ?int $line,
        public string $type,
        public string $message,
        public ?string $file = null,
    ) {}

    /**
     * Convert the DTO to an array shape.
     *
     * @return array{
     *     line: int|null,
     *     type: string,
     *     message: string,
     *     file: string|null
     * }
     */
    public function toArray(): array
    {
        return [
            'line' => $this->line,
            'type' => $this->type,
            'message' => $this->message,
            'file' => $this->file,
        ];
    }
}
