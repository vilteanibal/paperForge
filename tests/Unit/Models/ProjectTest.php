<?php

declare(strict_types=1);

use App\Enums\CompilerEngine;
use App\Models\Project;
use App\Models\ProjectSetting;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

uses(TestCase::class, RefreshDatabase::class);

test('a project is created with an automatic uuid', function () {
    $project = Project::create([
        'name' => 'Quantum Electrodynamics Paper',
        'storage_path' => 'projects/test-uuid-path',
        'last_opened_at' => now(),
    ]);

    expect($project->id)
        ->not->toBeNull()
        ->and(Str::isUuid($project->id))->toBeTrue()
        ->and($project->name)->toBe('Quantum Electrodynamics Paper')
        ->and($project->storage_path)->toBe('projects/test-uuid-path')
        ->and($project->last_opened_at)->toBeInstanceOf(CarbonInterface::class);

    $this->assertDatabaseHas('projects', [
        'id' => $project->id,
        'name' => 'Quantum Electrodynamics Paper',
        'storage_path' => 'projects/test-uuid-path',
    ]);
});

test('a project has one project setting relationship', function () {
    $project = Project::factory()->create([
        'name' => 'Relativity Theory',
    ]);

    $setting = ProjectSetting::create([
        'project_id' => $project->id,
        'compiler_engine' => CompilerEngine::XeLaTeX,
        'main_file' => 'document.tex',
    ]);

    expect($project->setting)
        ->not->toBeNull()
        ->and($project->setting->id)->toBe($setting->id)
        ->and($project->setting->main_file)->toBe('document.tex')
        ->and($setting->project->id)->toBe($project->id);
});

test('compiler_engine attribute is cast to CompilerEngine enum', function () {
    $project = Project::factory()->create();

    $setting = ProjectSetting::create([
        'project_id' => $project->id,
        'compiler_engine' => CompilerEngine::LuaLaTeX,
        'main_file' => 'thesis.tex',
    ]);

    $freshSetting = ProjectSetting::findOrFail($setting->id);

    expect($freshSetting->compiler_engine)
        ->toBeInstanceOf(CompilerEngine::class)
        ->toBe(CompilerEngine::LuaLaTeX)
        ->and($freshSetting->compiler_engine->value)->toBe('lualatex');
});

test('deleting a project cascades delete to its project setting', function () {
    $project = Project::factory()->create();

    $setting = ProjectSetting::create([
        'project_id' => $project->id,
        'compiler_engine' => CompilerEngine::PdfLaTeX,
        'main_file' => 'main.tex',
    ]);

    $this->assertDatabaseHas('projects', ['id' => $project->id]);
    $this->assertDatabaseHas('project_settings', ['id' => $setting->id]);

    $project->delete();

    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    $this->assertDatabaseMissing('project_settings', ['id' => $setting->id]);
});
