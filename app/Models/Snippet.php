<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use App\Models\Traits\Collectable;
use App\Models\Traits\HasSlug;
use App\Models\Traits\Taggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Snippet extends Model
{
    use BelongsToWorkspace, Collectable, HasFactory, HasSlug, Taggable;

    protected $fillable = [
        'workspace_id',
        'name',
        'slug',
        'content',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
