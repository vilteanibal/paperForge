<?php

declare(strict_types=1);

use App\Services\Bibliography\BibTeXParser;

describe('BibTeXParser', function () {
    it('parses valid BibTeX content with multiple entry types and nested braces', function () {
        $bibContent = <<<'BIB'
@article{einstein1905,
    author = {Albert Einstein},
    title = {Zur {Elektrodynamik} bewegter {K{\"o}rper}},
    journal = {Annalen der Physik},
    year = {1905},
    volume = {17},
    pages = {891--921}
}

@book{feynman1965,
    author = "Richard P. Feynman and Robert B. Leighton",
    title = "The Feynman Lectures on Physics",
    year = 1965,
    publisher = {Addison-Wesley}
}
BIB;

        $parser = new BibTeXParser;
        $entries = $parser->parse($bibContent);

        expect($entries)->toHaveCount(2)
            ->and($entries[0]->citationKey)->toBe('einstein1905')
            ->and($entries[0]->type)->toBe('article')
            ->and($entries[0]->author)->toBe('Albert Einstein')
            ->and($entries[0]->title)->toBe('Zur {Elektrodynamik} bewegter {K{\"o}rper}')
            ->and($entries[0]->journal)->toBe('Annalen der Physik')
            ->and($entries[0]->year)->toBe('1905')
            ->and($entries[1]->citationKey)->toBe('feynman1965')
            ->and($entries[1]->type)->toBe('book')
            ->and($entries[1]->author)->toBe('Richard P. Feynman and Robert B. Leighton')
            ->and($entries[1]->year)->toBe('1965')
            ->and($entries[1]->fields['publisher'])->toBe('Addison-Wesley');
    });

    it('skips non-entry macros like comments and preambles', function () {
        $bibContent = <<<'BIB'
@comment{This is a comment}
@preamble{"This is a preamble"}

@misc{knuth1984,
    author = {Donald E. Knuth},
    title = {The TeXbook},
    year = {1984}
}
BIB;

        $parser = new BibTeXParser;
        $entries = $parser->parse($bibContent);

        expect($entries)->toHaveCount(1)
            ->and($entries[0]->citationKey)->toBe('knuth1984')
            ->and($entries[0]->type)->toBe('misc');
    });

    it('is fault-tolerant when encountering malformed entries', function () {
        $bibContent = <<<'BIB'
@article{corrupted1999,
    author = {Missing closing brace
    title = {Never ended

@article{valid2024,
    author = {Ada Lovelace},
    title = {First Computer Algorithm},
    year = {2024}
}
BIB;

        $parser = new BibTeXParser;
        $entries = $parser->parse($bibContent);

        // Corrupted entry is skipped, valid2024 is successfully parsed
        expect($entries)->toHaveCount(1)
            ->and($entries[0]->citationKey)->toBe('valid2024')
            ->and($entries[0]->author)->toBe('Ada Lovelace');
    });

    it('handles empty or whitespace only content gracefully', function () {
        $parser = new BibTeXParser;
        expect($parser->parse(''))->toBe([])
            ->and($parser->parse("   \n\t  "))->toBe([]);
    });
});
