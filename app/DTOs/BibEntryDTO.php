<?php

declare(strict_types=1);

namespace App\DTOs;

readonly class BibEntryDTO
{
    /**
     * @param  array<string, string>  $fields
     */
    public function __construct(
        public string $citationKey,
        public string $type,
        public ?string $title = null,
        public ?string $author = null,
        public ?string $year = null,
        public ?string $journal = null,
        public array $fields = [],
    ) {}

    /**
     * @return array{citationKey: string, type: string, title: ?string, author: ?string, year: ?string, journal: ?string, fields: array<string, string>}
     */
    public function toArray(): array
    {
        return [
            'citationKey' => $this->citationKey,
            'type' => $this->type,
            'title' => $this->title,
            'author' => $this->author,
            'year' => $this->year,
            'journal' => $this->journal,
            'fields' => $this->fields,
        ];
    }
}
