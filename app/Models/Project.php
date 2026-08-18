<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $name
 * @property string $storage_path
 * @property Carbon|null $last_opened_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read ProjectSetting|null $setting
 */
class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'storage_path',
        'last_opened_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_opened_at' => 'datetime',
        ];
    }

    /**
     * Get the settings associated with the project.
     *
     * @return HasOne<ProjectSetting, $this>
     */
    public function setting(): HasOne
    {
        return $this->hasOne(ProjectSetting::class);
    }
}
