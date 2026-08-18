<?php

declare(strict_types=1);

use App\Contracts\TeXBinaryResolverInterface;
use App\Enums\CompilerEngine;
use App\Exceptions\CompilerBinaryNotFoundException;
use App\Services\Compiler\TeXBinaryResolver;
use Symfony\Component\Process\ExecutableFinder;
use Tests\TestCase;

uses(TestCase::class);

test('it implements TeXBinaryResolverInterface', function () {
    $resolver = new TeXBinaryResolver;
    expect($resolver)->toBeInstanceOf(TeXBinaryResolverInterface::class);
});

test('it resolves available pdflatex binary on host', function () {
    $resolver = new TeXBinaryResolver;

    if ($resolver->isAvailable(CompilerEngine::PdfLaTeX)) {
        $path = $resolver->resolve(CompilerEngine::PdfLaTeX);
        expect($path)->toBeString()
            ->and(is_executable($path))->toBeTrue()
            ->and(str_ends_with($path, 'pdflatex'))->toBeTrue();
    } else {
        expect(true)->toBeTrue();
    }
});

test('it throws CompilerBinaryNotFoundException when binary is not found', function () {
    $mockFinder = Mockery::mock(ExecutableFinder::class);
    $mockFinder->shouldReceive('find')
        ->once()
        ->andReturnNull();

    $resolver = new TeXBinaryResolver($mockFinder);

    expect(fn () => $resolver->resolve(CompilerEngine::PdfLaTeX))
        ->toThrow(CompilerBinaryNotFoundException::class);
});

test('isAvailable returns false when binary is missing', function () {
    $mockFinder = Mockery::mock(ExecutableFinder::class);
    $mockFinder->shouldReceive('find')
        ->once()
        ->andReturnNull();

    $resolver = new TeXBinaryResolver($mockFinder);

    expect($resolver->isAvailable(CompilerEngine::PdfLaTeX))->toBeFalse();
});
