<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemoryEntry extends Model
{
    use BelongsToWorkspace, HasFactory;

    protected $fillable = [
        'workspace_id',
        'content',
        'category',
        'is_pinned',
        'is_archived',
    ];

    protected function casts(): array
    {
        return [
            'is_pinned' => 'boolean',
            'is_archived' => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_archived', false);
    }

    public function scopePinned(Builder $query): Builder
    {
        return $query->where('is_pinned', true)->where('is_archived', false);
    }
}
