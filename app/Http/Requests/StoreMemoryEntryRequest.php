<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMemoryEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<mixed>> */
    public function rules(): array
    {
        return [
            'content' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'is_pinned' => ['nullable', 'boolean'],
        ];
    }
}
