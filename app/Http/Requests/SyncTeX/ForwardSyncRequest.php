<?php

declare(strict_types=1);

namespace App\Http\Requests\SyncTeX;

use App\Rules\SafeRelativePathRule;
use Illuminate\Foundation\Http\FormRequest;

class ForwardSyncRequest extends FormRequest
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
            'file' => ['required', 'string', new SafeRelativePathRule],
            'line' => ['required', 'integer', 'min:1'],
        ];
    }
}
