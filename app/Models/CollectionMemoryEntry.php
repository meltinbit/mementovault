<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionMemoryEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'collection_id',
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

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
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
