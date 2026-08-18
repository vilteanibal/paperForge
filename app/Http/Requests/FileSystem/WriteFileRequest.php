<?php

declare(strict_types=1);

namespace App\Http\Requests\FileSystem;

use App\Rules\SafeRelativePathRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WriteFileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'path' => ['required', 'string', new SafeRelativePathRule],
            'content' => ['required', 'string'],
        ];
    }
}
