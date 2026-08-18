<?php

declare(strict_types=1);

namespace App\Services\Compiler;

use App\DTOs\LaTeXDiagnosticDTO;

class LaTeXLogParser
{
    /**
     * Parse a LaTeX .log file content into structured diagnostic objects.
     *
     * @return list<LaTeXDiagnosticDTO>
     */
    public function parse(string $logContent): array
    {
        $diagnostics = [];
        $lines = explode("\n", $logContent);
        $totalLines = count($lines);

        for ($i = 0; $i < $totalLines; $i++) {
            $line = trim($lines[$i]);

            if ($line === '') {
                continue;
            }

            // 1. File-line-error format: ./main.tex:5: LaTeX Error: ... or file.tex:10: Undefined control sequence.
            if (preg_match('/^(\.?\/?[^:]+):(\d+):\s+(?:LaTeX Error:\s*)?(.*)$/i', $line, $matches)) {
                $diagnostics[] = new LaTeXDiagnosticDTO(
                    line: (int) $matches[2],
                    type: 'error',
                    message: trim($matches[3]),
                    file: basename($matches[1]),
                );

                continue;
            }

            // 2. Classic TeX Error format starting with '!'
            if (str_starts_with($line, '!')) {
                $errorMessage = ltrim(substr($line, 1));
                $errorLine = null;
                $file = null;

                // Check if message itself mentions line number: on input line 15
                if (preg_match('/on input line (\d+)/i', $errorMessage, $lineMatches)) {
                    $errorLine = (int) $lineMatches[1];
                }

                // Look ahead in subsequent 5 lines for 'l.<number>' line indicator
                for ($j = $i + 1; $j < min($i + 6, $totalLines); $j++) {
                    $peek = trim($lines[$j]);
                    if (preg_match('/^l\.(\d+)\s*(.*)$/', $peek, $lMatches)) {
                        if ($errorLine === null) {
                            $errorLine = (int) $lMatches[1];
                        }
                        break;
                    }
                    if (str_starts_with($peek, '!')) {
                        break; // Next error starts
                    }
                }

                $diagnostics[] = new LaTeXDiagnosticDTO(
                    line: $errorLine,
                    type: 'error',
                    message: $errorMessage,
                    file: $file,
                );

                continue;
            }

            // 3. LaTeX and Package Warnings
            if (preg_match('/(?:LaTeX|Package [\w\-\+]+)\s+Warning:\s+(.*)$/i', $line, $warnMatches)) {
                $warnMessage = trim($warnMatches[1]);
                $warnLine = null;

                // Check if line contains "on input line <number>"
                if (preg_match('/on input line (\d+)/i', $warnMessage, $lMatches)) {
                    $warnLine = (int) $lMatches[1];
                } else {
                    // Check next line for wrapped warning info
                    if ($i + 1 < $totalLines) {
                        $nextLine = trim($lines[$i + 1]);
                        if (preg_match('/on input line (\d+)/i', $nextLine, $lMatches)) {
                            $warnLine = (int) $lMatches[1];
                            $warnMessage .= ' '.$nextLine;
                            $i++;
                        }
                    }
                }

                $diagnostics[] = new LaTeXDiagnosticDTO(
                    line: $warnLine,
                    type: 'warning',
                    message: $warnMessage,
                );

                continue;
            }

            // 4. Overfull / Underfull box warnings
            if (preg_match('/^(Overfull|Underfull)\s*\\\\?(?:hbox|vbox)\s*\(.*?\)\s*in paragraph at lines (\d+)--(\d+)/i', $line, $boxMatches)) {
                $diagnostics[] = new LaTeXDiagnosticDTO(
                    line: (int) $boxMatches[2],
                    type: 'warning',
                    message: $line,
                );
            }
        }

        return $diagnostics;
    }
}
