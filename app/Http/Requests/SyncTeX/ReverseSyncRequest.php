<?php

declare(strict_types=1);

namespace App\Http\Requests\SyncTeX;

use Illuminate\Foundation\Http\FormRequest;

class ReverseSyncRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'page' => ['required', 'integer', 'min:1'],
            'x' => ['required', 'numeric'],
            'y' => ['required', 'numeric'],
        ];
    }
}
