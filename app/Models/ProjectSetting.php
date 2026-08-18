<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\CompilerEngine;
use Database\Factories\ProjectSettingFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $project_id
 * @property CompilerEngine $compiler_engine
 * @property string $main_file
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Project $project
 */
class ProjectSetting extends Model
{
    /** @use HasFactory<ProjectSettingFactory> */
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'project_id',
        'compiler_engine',
        'main_file',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string|class-string>
     */
    protected function casts(): array
    {
        return [
            'compiler_engine' => CompilerEngine::class,
        ];
    }

    /**
     * Get the project that owns the settings.
     *
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
