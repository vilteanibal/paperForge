<?php

declare(strict_types=1);

use App\Contracts\WorkspaceManagerInterface;
use App\Models\Project;

beforeEach(function () {
    $this->workspaceManager = app(WorkspaceManagerInterface::class);
    $this->project = Project::factory()->create();
    $this->workspaceManager->initWorkspace($this->project);
});

afterEach(function () {
    if (isset($this->project)) {
        $this->workspaceManager->purgeWorkspace($this->project);
    }
});

test('tree endpoint returns workspace file structure', function () {
    $this->workspaceManager->write($this->project, 'main.tex', '\documentclass{article}');
    $this->workspaceManager->write($this->project, 'chapters/intro.tex', '\section{Intro}');

    $response = $this->getJson(route('fs.tree', $this->project));

    $response->assertOk()
        ->assertJsonStructure([
            'projectId',
            'rootPath',
            'nodes' => [
                '*' => ['path', 'name', 'extension', 'sizeBytes', 'mimeType', 'lastModified', 'isDir'],
            ],
        ]);
});

test('read endpoint returns file content for valid path', function () {
    $this->workspaceManager->write($this->project, 'document.tex', 'Sample content');

    $response = $this->postJson(route('fs.read', $this->project), [
        'path' => 'document.tex',
    ]);

    $response->assertOk()
        ->assertJson([
            'path' => 'document.tex',
            'content' => 'Sample content',
        ]);
});

test('read endpoint blocks path traversal with 422 validation error', function (string $maliciousPath) {
    $response = $this->postJson(route('fs.read', $this->project), [
        'path' => $maliciousPath,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['path']);
})->with([
    '../.env',
    '../../etc/passwd',
    '/etc/shadow',
    'chapters/../../.env',
    "main.tex\0.jpg",
]);

test('write endpoint writes file content to workspace', function () {
    $response = $this->postJson(route('fs.write', $this->project), [
        'path' => 'sections/methods.tex',
        'content' => '\section{Methods}',
    ]);

    $response->assertOk()
        ->assertJsonPath('file.path', 'sections/methods.tex')
        ->assertJsonPath('file.name', 'methods.tex');

    expect($this->workspaceManager->read($this->project, 'sections/methods.tex'))
        ->toBe('\section{Methods}');
});

test('write endpoint blocks path traversal with 422 validation error', function (string $maliciousPath) {
    $response = $this->postJson(route('fs.write', $this->project), [
        'path' => $maliciousPath,
        'content' => 'malicious payload',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['path']);
})->with([
    '../malicious.php',
    '/var/www/hacked.php',
    '....//....//payload.tex',
]);

test('delete endpoint removes file from workspace', function () {
    $this->workspaceManager->write($this->project, 'temp.tex', 'to be deleted');

    $response = $this->postJson(route('fs.delete', $this->project), [
        'path' => 'temp.tex',
    ]);

    $response->assertOk()
        ->assertJson(['success' => true]);

    expect($this->workspaceManager->exists($this->project, 'temp.tex'))->toBeFalse();
});

test('delete endpoint blocks path traversal with 422 validation error', function (string $maliciousPath) {
    $response = $this->postJson(route('fs.delete', $this->project), [
        'path' => $maliciousPath,
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['path']);
})->with([
    '../.env',
    '/etc/hosts',
]);
