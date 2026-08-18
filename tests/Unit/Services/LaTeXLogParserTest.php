<?php

declare(strict_types=1);

use App\DTOs\LaTeXDiagnosticDTO;
use App\Services\Compiler\LaTeXLogParser;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->parser = new LaTeXLogParser;
});

test('it parses file-line-error format correctly', function () {
    $log = <<<'LOG'
This is pdfTeX, Version 3.141592653-2.6-1.40.26
./main.tex:5: Undefined control sequence.
./main.tex:12: LaTeX Error: Environment equation undefined.
LOG;

    $diagnostics = $this->parser->parse($log);

    expect($diagnostics)->toHaveCount(2)
        ->and($diagnostics[0])->toBeInstanceOf(LaTeXDiagnosticDTO::class)
        ->and($diagnostics[0]->line)->toBe(5)
        ->and($diagnostics[0]->type)->toBe('error')
        ->and($diagnostics[0]->message)->toBe('Undefined control sequence.')
        ->and($diagnostics[0]->file)->toBe('main.tex')
        ->and($diagnostics[1]->line)->toBe(12)
        ->and($diagnostics[1]->type)->toBe('error')
        ->and($diagnostics[1]->message)->toBe('Environment equation undefined.');
});

test('it parses classic TeX ! error format with lookahead line numbers', function () {
    $log = <<<LOG
! Undefined control sequence.
l.8 \unknowncommand
                   {arg}
The control sequence at the end of the top line
LOG;

    $diagnostics = $this->parser->parse($log);

    expect($diagnostics)->toHaveCount(1)
        ->and($diagnostics[0]->line)->toBe(8)
        ->and($diagnostics[0]->type)->toBe('error')
        ->and($diagnostics[0]->message)->toBe('Undefined control sequence.');
});

test('it parses LaTeX warnings with input lines', function () {
    $log = <<<'LOG'
LaTeX Warning: Reference `fig:1' on page 1 undefined on input line 42.
Package hyperref Warning: Token not allowed in a PDF string on input line 88.
LOG;

    $diagnostics = $this->parser->parse($log);

    expect($diagnostics)->toHaveCount(2)
        ->and($diagnostics[0]->type)->toBe('warning')
        ->and($diagnostics[0]->line)->toBe(42)
        ->and($diagnostics[1]->type)->toBe('warning')
        ->and($diagnostics[1]->line)->toBe(88);
});

test('it parses overfull hbox warnings', function () {
    $log = <<<LOG
Overfull \hbox (15.234pt too wide) in paragraph at lines 15--20
LOG;

    $diagnostics = $this->parser->parse($log);

    expect($diagnostics)->toHaveCount(1)
        ->and($diagnostics[0]->type)->toBe('warning')
        ->and($diagnostics[0]->line)->toBe(15);
});

test('it returns empty array for clean log without diagnostics', function () {
    $log = <<<'LOG'
This is pdfTeX, Version 3.141592653-2.6-1.40.26
Output written on main.pdf (1 page, 12345 bytes).
Transcript written on main.log.
LOG;

    $diagnostics = $this->parser->parse($log);

    expect($diagnostics)->toBeEmpty();
});
