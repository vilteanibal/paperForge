<?php

declare(strict_types=1);

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

class SafeRelativePathRule implements ValidationRule
{
    /**
     * Indicates whether the rule should be implicit.
     */
    public bool $implicit = true;

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if ($value === null) {
            return;
        }

        if (! is_string($value) || trim($value) === '') {
            $fail('The :attribute must be a non-empty relative path string.');

            return;
        }

        // Null byte check
        if (str_contains($value, "\0")) {
            $fail('The :attribute contains invalid null byte characters.');

            return;
        }

        // Absolute path check
        if (str_starts_with($value, '/') || str_starts_with($value, '\\')) {
            $fail('The :attribute cannot be an absolute path.');

            return;
        }

        // Dot-dot traversal check
        if (str_contains($value, '..')) {
            $fail('The :attribute contains forbidden path traversal sequences (..).');

            return;
        }

        // Relative dot segment check
        $normalized = str_replace('\\', '/', $value);
        $segments = explode('/', $normalized);
        if (in_array('.', $segments, true)) {
            $fail('The :attribute contains invalid relative directory segments (.).');
        }
    }
}
