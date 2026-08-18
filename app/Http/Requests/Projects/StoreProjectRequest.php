<?php

declare(strict_types=1);

namespace App\Http\Requests\Projects;

use App\Enums\CompilerEngine;
use App\Rules\SafeRelativePathRule;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreProjectRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'compiler_engine' => ['nullable', new Enum(CompilerEngine::class)],
            'main_file' => ['nullable', 'string', new SafeRelativePathRule],
        ];
    }
}
