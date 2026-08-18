<?php

declare(strict_types=1);

namespace App\Services\Compiler;

use App\Contracts\SyncTeXParserInterface;
use App\DTOs\SyncTeXForwardDTO;
use App\DTOs\SyncTeXReverseDTO;

class SyncTeXParser implements SyncTeXParserInterface
{
    /**
     * Conversion factor from TeX scaled points (sp) to PDF points (pt).
     */
    private const SP_TO_PT = 1.0 / 65536.0;

    /**
     * Map a source file and line to physical PDF page coordinates.
     */
    public function forwardQuery(string $synctexPath, string $sourceFile, int $line): ?SyncTeXForwardDTO
    {
        if (! file_exists($synctexPath) || ! is_readable($synctexPath)) {
            return null;
        }

        $gz = @gzopen($synctexPath, 'rb');
        if (! $gz) {
            return null;
        }

        $inputs = [];
        $targetTag = null;
        $normalizedTarget = $this->normalizePath($sourceFile);

        $currentPage = 1;
        $bestMatch = null;
        $minLineDiff = PHP_INT_MAX;

        while (($rawLine = gzgets($gz)) !== false) {
            $lineStr = trim($rawLine);
            if ($lineStr === '') {
                continue;
            }

            // Parse Inputs: "Input:1:./main.tex"
            if (str_starts_with($lineStr, 'Input:')) {
                $parts = explode(':', $lineStr, 3);
                if (count($parts) >= 3) {
                    $tag = (int) $parts[1];
                    $filePath = $this->normalizePath($parts[2]);
                    $inputs[$tag] = $filePath;

                    if ($this->pathsMatch($filePath, $normalizedTarget)) {
                        $targetTag = $tag;
                    }
                }

                continue;
            }

            // Open Page: "{1"
            if (str_starts_with($lineStr, '{')) {
                $currentPage = (int) substr($lineStr, 1);

                continue;
            }

            // If targetTag not yet found or not in inputs, continue
            if ($targetTag === null) {
                continue;
            }

            // Parse box records: "[1,10:123456,654321:10000,20000" or "x:1,10:123456,654321" or "g:1,10:..."
            $record = $this->parseRecord($lineStr);
            if ($record !== null && $record['tag'] === $targetTag) {
                $diff = abs($record['line'] - $line);
                if ($diff < $minLineDiff) {
                    $minLineDiff = $diff;
                    $bestMatch = [
                        'page' => $currentPage,
                        'x' => round($record['x'] * self::SP_TO_PT, 2),
                        'y' => round($record['y'] * self::SP_TO_PT, 2),
                        'width' => round(max(15.0, $record['w'] * self::SP_TO_PT), 2),
                        'height' => round(max(10.0, $record['h'] * self::SP_TO_PT), 2),
                    ];

                    if ($diff === 0) {
                        // Exact match found!
                        break;
                    }
                }
            }
        }

        gzclose($gz);

        if ($bestMatch === null) {
            return null;
        }

        return new SyncTeXForwardDTO(
            page: $bestMatch['page'],
            x: $bestMatch['x'],
            y: $bestMatch['y'],
            width: $bestMatch['width'],
            height: $bestMatch['height'],
        );
    }

    /**
     * Map a physical PDF page coordinate (page, x, y) back to source file and line.
     */
    public function reverseQuery(string $synctexPath, int $page, float $x, float $y): ?SyncTeXReverseDTO
    {
        if (! file_exists($synctexPath) || ! is_readable($synctexPath)) {
            return null;
        }

        $gz = @gzopen($synctexPath, 'rb');
        if (! $gz) {
            return null;
        }

        $inputs = [];
        $currentPage = 0;
        $inTargetPage = false;
        $bestMatch = null;
        $minDistance = PHP_FLOAT_MAX;

        while (($rawLine = gzgets($gz)) !== false) {
            $lineStr = trim($rawLine);
            if ($lineStr === '') {
                continue;
            }

            // Parse Inputs: "Input:1:./main.tex"
            if (str_starts_with($lineStr, 'Input:')) {
                $parts = explode(':', $lineStr, 3);
                if (count($parts) >= 3) {
                    $inputs[(int) $parts[1]] = $this->normalizePath($parts[2]);
                }

                continue;
            }

            // Page handling: "{1" and "}1"
            if (str_starts_with($lineStr, '{')) {
                $currentPage = (int) substr($lineStr, 1);
                $inTargetPage = ($currentPage === $page);

                continue;
            }

            if (str_starts_with($lineStr, '}')) {
                if ($inTargetPage) {
                    // Finished parsing target page
                    break;
                }
                $inTargetPage = false;

                continue;
            }

            if (! $inTargetPage) {
                continue;
            }

            $record = $this->parseRecord($lineStr);
            if ($record !== null && isset($inputs[$record['tag']])) {
                $recX = $record['x'] * self::SP_TO_PT;
                $recY = $record['y'] * self::SP_TO_PT;

                // Calculate Euclidean distance
                $dist = sqrt((($recX - $x) ** 2) + (($recY - $y) ** 2));
                if ($dist < $minDistance) {
                    $minDistance = $dist;
                    $bestMatch = [
                        'file' => $inputs[$record['tag']],
                        'line' => $record['line'],
                        'column' => 0,
                    ];
                }
            }
        }

        gzclose($gz);

        if ($bestMatch === null) {
            return null;
        }

        return new SyncTeXReverseDTO(
            file: $bestMatch['file'],
            line: $bestMatch['line'],
            column: $bestMatch['column'],
        );
    }

    /**
     * Parse a single SyncTeX record line.
     *
     * @return array{tag: int, line: int, x: float, y: float, w: float, h: float}|null
     */
    private function parseRecord(string $line): ?array
    {
        // Types:
        // [tag,line:x,y:w,h,d (h-box)
        // (tag,line:x,y:w,h,d (v-box)
        // x:tag,line:x,y (void box)
        // k:tag,line:x,y:w (kern)
        // g:tag,line:x,y:w,h,d (glue)
        // h:tag,line:x,y (horizontal glue)
        // v:tag,line:x,y (vertical glue)

        $first = $line[0] ?? '';
        if (! in_array($first, ['[', '(', 'x', 'k', 'g', 'h', 'v', '$'], true)) {
            return null;
        }

        $body = substr($line, 1);
        if ($first === 'x' || $first === 'k' || $first === 'g' || $first === 'h' || $first === 'v' || $first === '$') {
            if (str_starts_with($body, ':')) {
                $body = substr($body, 1);
            }
        }

        $colonPos = strpos($body, ':');
        if ($colonPos === false) {
            return null;
        }

        $tagLinePart = substr($body, 0, $colonPos);
        $coordsPart = substr($body, $colonPos + 1);

        $tagLine = explode(',', $tagLinePart);
        if (count($tagLine) < 2) {
            return null;
        }

        $tag = (int) $tagLine[0];
        $srcLine = (int) $tagLine[1];

        // Coords: "x,y:w,h,d" or "x,y" or "x,y:w"
        $coordSections = explode(':', $coordsPart);
        $xy = explode(',', $coordSections[0]);

        if (count($xy) < 2) {
            return null;
        }

        $x = (float) $xy[0];
        $y = (float) $xy[1];
        $w = 0.0;
        $h = 0.0;

        if (isset($coordSections[1])) {
            $wh = explode(',', $coordSections[1]);
            $w = (float) $wh[0];
            $h = (float) ($wh[1] ?? 0);
        }

        return [
            'tag' => $tag,
            'line' => $srcLine,
            'x' => $x,
            'y' => $y,
            'w' => $w,
            'h' => $h,
        ];
    }

    /**
     * Normalize path for reliable cross-comparison.
     */
    private function normalizePath(string $path): string
    {
        $normalized = str_replace('\\', '/', trim($path));
        $normalized = preg_replace('/^\.\//', '', $normalized) ?? $normalized;

        return basename($normalized);
    }

    /**
     * Check if two file paths match.
     */
    private function pathsMatch(string $pathA, string $pathB): bool
    {
        return $pathA === $pathB || basename($pathA) === basename($pathB);
    }
}
