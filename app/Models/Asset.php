<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use App\Models\Traits\Collectable;
use App\Models\Traits\Taggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asset extends Model
{
    use BelongsToWorkspace, Collectable, HasFactory, Taggable;

    protected $fillable = [
        'workspace_id',
        'name',
        'original_filename',
        'storage_path',
        'mime_type',
        'size_bytes',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'size_bytes' => 'integer',
        ];
    }
}
