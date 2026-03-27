<?php

namespace App\Http\Requests;

use App\Models\AssetFolder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreAssetFolderRequest extends FormRequest
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
            'parent_id' => ['nullable', 'integer', 'exists:asset_folders,id'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function ($validator) {
            if ($this->parent_id) {
                $parentExists = AssetFolder::where('id', $this->parent_id)->exists();
                if (! $parentExists) {
                    $validator->errors()->add('parent_id', 'The selected parent folder does not belong to your workspace.');
                }
            }
        });
    }
}
