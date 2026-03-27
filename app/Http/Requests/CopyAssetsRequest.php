<?php

namespace App\Http\Requests;

use App\Models\AssetFolder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class CopyAssetsRequest extends FormRequest
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
            'folder_id' => ['nullable', 'integer', 'exists:asset_folders,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if ($this->folder_id) {
                $folderExists = AssetFolder::where('id', $this->folder_id)->exists();
                if (! $folderExists) {
                    $validator->errors()->add('folder_id', 'The selected folder does not belong to your workspace.');
                }
            }
        });
    }
}
