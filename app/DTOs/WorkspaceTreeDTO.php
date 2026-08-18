<?php

declare(strict_types=1);

namespace App\DTOs;

final readonly class WorkspaceTreeDTO
{
    /**
     * @param  list<FileMetadataDTO>  $nodes
     */
    public function __construct(
        public string $projectId,
        public string $rootPath,
        public array $nodes,
    ) {}

    /**
     * Convert the DTO to an array shape.
     *
     * @return array{
     *     projectId: string,
     *     rootPath: string,
     *     nodes: list<array{
     *         path: string,
     *         name: string,
     *         extension: string,
     *         sizeBytes: int,
     *         mimeType: string,
     *         lastModified: int,
     *         isDir: bool
     *     }>
     * }
     */
    public function toArray(): array
    {
        return [
            'projectId' => $this->projectId,
            'rootPath' => $this->rootPath,
            'nodes' => array_map(fn (FileMetadataDTO $node): array => $node->toArray(), $this->nodes),
        ];
    }
}
