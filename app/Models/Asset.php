<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use App\Models\Traits\Collectable;
use App\Models\Traits\Taggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Asset extends Model
{
    use BelongsToWorkspace, Collectable, HasFactory, Taggable;

    protected $fillable = [
        'workspace_id',
        'folder_id',
        'name',
        'original_filename',
        'storage_path',
        'mime_type',
        'size_bytes',
        'description',
        'is_active',
    ];

    public function folder(): BelongsTo
    {
        return $this->belongsTo(AssetFolder::class, 'folder_id');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'size_bytes' => 'integer',
        ];
    }
}
