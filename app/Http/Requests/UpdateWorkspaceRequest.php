<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkspaceRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'storage_driver' => ['nullable', 'string', 'in:local,s3'],
            'storage_key' => ['nullable', 'string', 'max:255'],
            'storage_secret' => ['nullable', 'string', 'max:255'],
            'storage_region' => ['nullable', 'string', 'max:50'],
            'storage_bucket' => ['nullable', 'string', 'max:255'],
            'storage_endpoint' => ['nullable', 'string', 'max:500'],
            'storage_url' => ['nullable', 'string', 'max:500'],
            'storage_use_path_style_endpoint' => ['nullable', 'boolean'],
            'mcp_instructions' => ['nullable', 'string', 'max:5000'],
            'mcp_custom_prompt' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
