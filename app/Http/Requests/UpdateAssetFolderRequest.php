<?php

namespace App\Http\Requests;

use App\Models\AssetFolder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateAssetFolderRequest extends FormRequest
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
            $folder = $this->route('asset_folder');

            if ($this->parent_id) {
                $parentExists = AssetFolder::where('id', $this->parent_id)->exists();
                if (! $parentExists) {
                    $validator->errors()->add('parent_id', 'The selected parent folder does not belong to your workspace.');

                    return;
                }

                if ($this->parent_id == $folder->id) {
                    $validator->errors()->add('parent_id', 'A folder cannot be its own parent.');

                    return;
                }

                if ($this->isDescendantOf($folder->id, $this->parent_id)) {
                    $validator->errors()->add('parent_id', 'Cannot move a folder into one of its own descendants.');
                }
            }
        });
    }

    private function isDescendantOf(int $ancestorId, int $candidateId): bool
    {
        $current = AssetFolder::find($candidateId);

        while ($current) {
            if ($current->parent_id === $ancestorId) {
                return true;
            }
            $current = $current->parent ? AssetFolder::find($current->parent_id) : null;
        }

        return false;
    }
}
