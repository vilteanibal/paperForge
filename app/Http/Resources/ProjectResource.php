<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Project
 */
class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'storage_path' => $this->storage_path,
            'last_opened_at' => $this->last_opened_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'setting' => $this->whenLoaded('setting', fn () => [
                'compiler_engine' => $this->setting?->compiler_engine->value,
                'main_file' => $this->setting?->main_file,
            ]),
        ];
    }
}
