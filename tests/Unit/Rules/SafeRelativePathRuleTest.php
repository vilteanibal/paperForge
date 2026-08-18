<?php

declare(strict_types=1);

use App\Rules\SafeRelativePathRule;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

uses(TestCase::class);

test('it passes for valid relative paths', function (string $validPath) {
    $validator = Validator::make(
        ['path' => $validPath],
        ['path' => [new SafeRelativePathRule]]
    );

    expect($validator->passes())->toBeTrue();
})->with([
    'main.tex',
    'chapters/intro.tex',
    'figures/diagram1.png',
    'styles/custom.sty',
    'sub/dir/nested/file.tex',
]);

test('it fails for malicious path traversal attack vectors', function (string $maliciousPath) {
    $validator = Validator::make(
        ['path' => $maliciousPath],
        ['path' => [new SafeRelativePathRule]]
    );

    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->has('path'))->toBeTrue();
})->with([
    '../.env',
    '../../etc/passwd',
    '../../../var/log',
    'chapters/../../.env',
    '/etc/passwd',
    '\\Windows\\System32',
    "main.tex\0.jpg",
    './config',
    'chapters/./intro.tex',
    '....//....//etc/passwd',
    '',
    '   ',
]);
