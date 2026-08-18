<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class FileMetadataDTO
{
    public function __construct(
        public string $path,
        public string $name,
        public string $extension,
        public int $sizeBytes,
        public string $mimeType,
        public int $lastModified,
        public bool $isDir,
    ) {}

    /**
     * Convert the DTO to an array shape.
     *
     * @return array{
     *     path: string,
     *     name: string,
     *     extension: string,
     *     sizeBytes: int,
     *     mimeType: string,
     *     lastModified: int,
     *     isDir: bool
     * }
     */
    public function toArray(): array
    {
        return [
            'path' => $this->path,
            'name' => $this->name,
            'extension' => $this->extension,
            'sizeBytes' => $this->sizeBytes,
            'mimeType' => $this->mimeType,
            'lastModified' => $this->lastModified,
            'isDir' => $this->isDir,
        ];
    }
}
