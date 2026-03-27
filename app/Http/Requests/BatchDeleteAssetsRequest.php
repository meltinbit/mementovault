<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BatchDeleteAssetsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'asset_ids' => ['required', 'array', 'min:1'],
            'asset_ids.*' => ['integer', 'exists:assets,id'],
        ];
    }
}
