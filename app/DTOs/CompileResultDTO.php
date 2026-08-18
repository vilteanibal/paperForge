<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class CompileResultDTO
{
    /**
     * @param  list<LaTeXDiagnosticDTO>  $diagnostics
     */
    public function __construct(
        public bool $success,
        public ?string $pdfPath,
        public string $logContent,
        public int $executionTimeMs,
        public array $diagnostics = [],
    ) {}

    /**
     * Convert the DTO to an array shape.
     *
     * @return array{
     *     success: bool,
     *     pdfPath: string|null,
     *     logContent: string,
     *     executionTimeMs: int,
     *     diagnostics: list<array{
     *         line: int|null,
     *         type: string,
     *         message: string,
     *         file: string|null
     *     }>
     * }
     */
    public function toArray(): array
    {
        return [
            'success' => $this->success,
            'pdfPath' => $this->pdfPath,
            'logContent' => $this->logContent,
            'executionTimeMs' => $this->executionTimeMs,
            'diagnostics' => array_map(fn (LaTeXDiagnosticDTO $d): array => $d->toArray(), $this->diagnostics),
        ];
    }
}
