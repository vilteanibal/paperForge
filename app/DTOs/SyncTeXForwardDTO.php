<?php

declare(strict_types=1);

namespace App\DTOs;

readonly class SyncTeXForwardDTO
{
    public function __construct(
        public int $page,
        public float $x,
        public float $y,
        public float $width,
        public float $height,
    ) {}

    /**
     * @return array{page: int, x: float, y: float, width: float, height: float}
     */
    public function toArray(): array
    {
        return [
            'page' => $this->page,
            'x' => $this->x,
            'y' => $this->y,
            'width' => $this->width,
            'height' => $this->height,
        ];
    }
}
