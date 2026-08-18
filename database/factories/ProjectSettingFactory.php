<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\CompilerEngine;
use App\Models\Project;
use App\Models\ProjectSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProjectSetting>
 */
class ProjectSettingFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<ProjectSetting>
     */
    protected $model = ProjectSetting::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'compiler_engine' => CompilerEngine::PdfLaTeX,
            'main_file' => 'main.tex',
        ];
    }
}
