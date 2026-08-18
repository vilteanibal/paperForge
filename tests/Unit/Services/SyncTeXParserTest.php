<?php

declare(strict_types=1);

use App\Services\Compiler\SyncTeXParser;

beforeEach(function () {
    $this->tempDir = sys_get_temp_dir().'/synctex_test_'.uniqid();
    if (! is_dir($this->tempDir)) {
        mkdir($this->tempDir, 0755, true);
    }
});

afterEach(function () {
    if (is_dir($this->tempDir)) {
        $files = glob($this->tempDir.'/*');
        if ($files) {
            foreach ($files as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }
        rmdir($this->tempDir);
    }
});

describe('SyncTeXParser', function () {
    it('performs forward spatial queries mapping source line to PDF coordinates', function () {
        // 65536 sp = 1 pt. 6553600 sp = 100 pt, 13107200 sp = 200 pt
        $rawSyncTeX = <<<'SYNC'
SyncTeX Version:1
Input:1:./main.tex
Input:2:./chapters/intro.tex
Output:pdf
Magnification:1000
Unit:1
X Offset:0
Y Offset:0
Content:
!123
{1
[1,10:6553600,13107200:3276800,655360,0
x:1,10:6553600,13107200
]
[2,5:19660800,26214400:6553600,1310720,0
]
}1
SYNC;

        $gzFile = $this->tempDir.'/main.synctex.gz';
        file_put_contents($gzFile, gzencode($rawSyncTeX));

        $parser = new SyncTeXParser;

        // Query main.tex at line 10
        $forward1 = $parser->forwardQuery($gzFile, 'main.tex', 10);
        expect($forward1)->not->toBeNull()
            ->and($forward1->page)->toBe(1)
            ->and($forward1->x)->toBe(100.0)
            ->and($forward1->y)->toBe(200.0)
            ->and($forward1->width)->toBe(50.0);

        // Query chapters/intro.tex at line 5
        $forward2 = $parser->forwardQuery($gzFile, 'intro.tex', 5);
        expect($forward2)->not->toBeNull()
            ->and($forward2->page)->toBe(1)
            ->and($forward2->x)->toBe(300.0)
            ->and($forward2->y)->toBe(400.0);
    });

    it('performs reverse spatial queries mapping PDF point to nearest source line', function () {
        $rawSyncTeX = <<<'SYNC'
SyncTeX Version:1
Input:1:./main.tex
Output:pdf
Magnification:1000
Unit:1
X Offset:0
Y Offset:0
Content:
!123
{1
[1,10:6553600,13107200:3276800,655360,0
]
[1,42:19660800,26214400:6553600,1310720,0
]
}1
SYNC;

        $gzFile = $this->tempDir.'/main.synctex.gz';
        file_put_contents($gzFile, gzencode($rawSyncTeX));

        $parser = new SyncTeXParser;

        // Query near line 42 (x: 300, y: 400)
        $reverse = $parser->reverseQuery($gzFile, 1, 302.5, 398.0);
        expect($reverse)->not->toBeNull()
            ->and($reverse->file)->toBe('main.tex')
            ->and($reverse->line)->toBe(42);
    });

    it('returns null when querying non-existent files or invalid pages', function () {
        $parser = new SyncTeXParser;

        expect($parser->forwardQuery('/non/existent/file.synctex.gz', 'main.tex', 1))->toBeNull();
        expect($parser->reverseQuery('/non/existent/file.synctex.gz', 1, 100.0, 100.0))->toBeNull();
    });
});
