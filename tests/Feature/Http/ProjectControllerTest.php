<?php

declare(strict_types=1);

use App\Contracts\WorkspaceManagerInterface;
use App\Enums\CompilerEngine;
use App\Models\Project;
use App\Models\ProjectSetting;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->workspaceManager = app(WorkspaceManagerInterface::class);
});

afterEach(function () {
    Project::all()->each(function (Project $p) {
        $this->workspaceManager->purgeWorkspace($p);
    });
});

test('index renders dashboard with projects', function () {
    $project = Project::factory()->create(['name' => 'Research Paper']);

    $response = $this->get(route('projects.index'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Dashboard/Index')
            ->has('projects')
        );
});

test('index returns json list of projects', function () {
    Project::factory()->count(3)->create();

    $response = $this->getJson(route('projects.index'));

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'storage_path', 'last_opened_at', 'created_at', 'updated_at'],
            ],
        ]);
});

test('store creates project and initializes workspace', function () {
    $payload = [
        'name' => 'Quantum Computing Thesis',
        'compiler_engine' => CompilerEngine::PdfLaTeX->value,
        'main_file' => 'main.tex',
    ];

    $response = $this->post(route('projects.store'), $payload);

    $project = Project::where('name', 'Quantum Computing Thesis')->firstOrFail();

    $response->assertRedirect(route('projects.show', $project));

    $this->assertDatabaseHas('projects', ['id' => $project->id, 'name' => 'Quantum Computing Thesis']);
    $this->assertDatabaseHas('project_settings', ['project_id' => $project->id, 'compiler_engine' => 'pdflatex']);

    expect($this->workspaceManager->exists($project, 'main.tex'))->toBeTrue();
});

test('store returns 201 json on json request', function () {
    $payload = [
        'name' => 'JSON API Project',
    ];

    $response = $this->postJson(route('projects.store'), $payload);

    $response->assertCreated()
        ->assertJsonPath('data.name', 'JSON API Project');
});

test('store validates required name and safe main_file', function () {
    $response = $this->postJson(route('projects.store'), [
        'name' => '',
        'main_file' => '../../etc/passwd',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'main_file']);
});

test('show renders editor with tree and updates last_opened_at', function () {
    $project = Project::factory()->create();
    ProjectSetting::create([
        'project_id' => $project->id,
        'compiler_engine' => CompilerEngine::PdfLaTeX,
        'main_file' => 'main.tex',
    ]);
    $this->workspaceManager->initWorkspace($project);
    $this->workspaceManager->write($project, 'main.tex', '\documentclass{article}');

    $response = $this->get(route('projects.show', $project));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Editor/Show')
            ->has('project')
            ->has('tree')
        );
});

test('destroy purges workspace and deletes project', function () {
    $project = Project::factory()->create();
    $this->workspaceManager->initWorkspace($project);
    $this->workspaceManager->write($project, 'test.tex', 'sample');

    $response = $this->deleteJson(route('projects.destroy', $project));

    $response->assertOk()
        ->assertJson(['success' => true]);

    $this->assertDatabaseMissing('projects', ['id' => $project->id]);
});
