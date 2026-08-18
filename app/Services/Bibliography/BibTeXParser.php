<?php

declare(strict_types=1);

namespace App\Services\Bibliography;

use App\Contracts\BibTeXParserInterface;
use App\DTOs\BibEntryDTO;

class BibTeXParser implements BibTeXParserInterface
{
    /**
     * Parse raw BibTeX content into structured DTOs.
     * Skips invalid entries without throwing exceptions.
     *
     * @return array<int, BibEntryDTO>
     */
    public function parse(string $content): array
    {
        $entries = [];
        $length = strlen($content);
        $pos = 0;

        while ($pos < $length) {
            $atPos = strpos($content, '@', $pos);
            if ($atPos === false) {
                break;
            }

            $pos = $atPos + 1;

            // Match entry type up to opening brace or paren
            if (! preg_match('/^([a-zA-Z0-9_-]+)\s*([\{\(])/A', substr($content, $pos), $matches)) {
                continue;
            }

            $type = strtolower($matches[1]);
            $openChar = $matches[2];
            $closeChar = $openChar === '{' ? '}' : ')';
            $pos += strlen($matches[0]);

            // Skip non-entry macros
            if (in_array($type, ['comment', 'preamble', 'string'], true)) {
                $this->skipBalancedBlock($content, $pos, $openChar, $closeChar);

                continue;
            }

            // Extract the block body balanced by braces/parens
            $bodyStart = $pos;
            $bodyEnd = $this->findBalancedEnd($content, $pos, $openChar, $closeChar);

            if ($bodyEnd === false) {
                // Malformed entry (unclosed brace), jump to next potential entry
                continue;
            }

            $body = substr($content, $bodyStart, $bodyEnd - $bodyStart);
            $pos = $bodyEnd + 1;

            try {
                $entry = $this->parseEntryBody($type, $body);
                if ($entry !== null) {
                    $entries[] = $entry;
                }
            } catch (\Throwable) {
                // Fault-tolerant: discard single failing entry and continue
                continue;
            }
        }

        return $entries;
    }

    /**
     * Parse the inner body of an entry.
     */
    private function parseEntryBody(string $type, string $body): ?BibEntryDTO
    {
        $body = trim($body);
        if ($body === '') {
            return null;
        }

        // First token before comma is the citation key
        $firstComma = strpos($body, ',');
        if ($firstComma === false) {
            // Might be an entry without fields (just key)
            $citationKey = trim($body);
            if ($citationKey === '') {
                return null;
            }

            return new BibEntryDTO(
                citationKey: $citationKey,
                type: $type,
            );
        }

        $citationKey = trim(substr($body, 0, $firstComma));
        if ($citationKey === '') {
            return null;
        }

        $fieldsRaw = substr($body, $firstComma + 1);
        $fields = $this->parseFields($fieldsRaw);

        return new BibEntryDTO(
            citationKey: $citationKey,
            type: $type,
            title: $fields['title'] ?? null,
            author: $fields['author'] ?? null,
            year: $fields['year'] ?? null,
            journal: $fields['journal'] ?? $fields['booktitle'] ?? null,
            fields: $fields,
        );
    }

    /**
     * Parse key-value fields inside the entry body.
     *
     * @return array<string, string>
     */
    private function parseFields(string $fieldsRaw): array
    {
        $fields = [];
        $len = strlen($fieldsRaw);
        $pos = 0;

        while ($pos < $len) {
            // Skip leading whitespace and commas
            while ($pos < $len && (ctype_space($fieldsRaw[$pos]) || $fieldsRaw[$pos] === ',')) {
                $pos++;
            }

            if ($pos >= $len) {
                break;
            }

            // Match field name up to '='
            $equalsPos = strpos($fieldsRaw, '=', $pos);
            if ($equalsPos === false) {
                break;
            }

            $fieldName = strtolower(trim(substr($fieldsRaw, $pos, $equalsPos - $pos)));
            $pos = $equalsPos + 1;

            // Skip whitespace after '='
            while ($pos < $len && ctype_space($fieldsRaw[$pos])) {
                $pos++;
            }

            if ($pos >= $len) {
                break;
            }

            $firstChar = $fieldsRaw[$pos];
            $value = '';

            if ($firstChar === '{') {
                $pos++;
                $valStart = $pos;
                $valEnd = $this->findBalancedEnd($fieldsRaw, $pos, '{', '}');
                if ($valEnd !== false) {
                    $value = substr($fieldsRaw, $valStart, $valEnd - $valStart);
                    $pos = $valEnd + 1;
                } else {
                    $value = substr($fieldsRaw, $valStart);
                    $pos = $len;
                }
            } elseif ($firstChar === '"') {
                $pos++;
                $valStart = $pos;
                $quoteEnd = strpos($fieldsRaw, '"', $pos);
                if ($quoteEnd !== false) {
                    $value = substr($fieldsRaw, $valStart, $quoteEnd - $valStart);
                    $pos = $quoteEnd + 1;
                } else {
                    $value = substr($fieldsRaw, $valStart);
                    $pos = $len;
                }
            } else {
                // Number or bare word until comma or end
                $commaPos = strpos($fieldsRaw, ',', $pos);
                if ($commaPos !== false) {
                    $value = substr($fieldsRaw, $pos, $commaPos - $pos);
                    $pos = $commaPos;
                } else {
                    $value = substr($fieldsRaw, $pos);
                    $pos = $len;
                }
            }

            // Normalize whitespace and clean value
            $value = preg_replace('/\s+/', ' ', trim($value)) ?? trim($value);

            if ($fieldName !== '') {
                $fields[$fieldName] = $value;
            }
        }

        return $fields;
    }

    /**
     * Find balanced end index for opening/closing characters.
     */
    private function findBalancedEnd(string $content, int $start, string $openChar, string $closeChar): int|false
    {
        $depth = 1;
        $len = strlen($content);

        for ($i = $start; $i < $len; $i++) {
            $char = $content[$i];

            if ($char === $openChar) {
                $depth++;
            } elseif ($char === $closeChar) {
                $depth--;
                if ($depth === 0) {
                    return $i;
                }
            }
        }

        return false;
    }

    /**
     * Skip balanced block without capturing.
     */
    private function skipBalancedBlock(string $content, int &$pos, string $openChar, string $closeChar): void
    {
        $end = $this->findBalancedEnd($content, $pos, $openChar, $closeChar);
        $pos = $end !== false ? $end + 1 : strlen($content);
    }
}
