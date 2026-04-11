<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ContentLink extends Model
{
    use BelongsToWorkspace;

    public $timestamps = false;

    protected $fillable = [
        'workspace_id',
        'source_type',
        'source_id',
        'target_type',
        'target_id',
        'link_type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function source(): MorphTo
    {
        return $this->morphTo('source');
    }

    public function target(): MorphTo
    {
        return $this->morphTo('target');
    }

    public static function contentTypeMap(): array
    {
        return [
            'document' => Document::class,
            'collection_document' => CollectionDocument::class,
            'skill' => Skill::class,
            'snippet' => Snippet::class,
            'memory' => MemoryEntry::class,
            'collection_memory' => CollectionMemoryEntry::class,
        ];
    }

    public static function typeKeyForModel(Model $model): string
    {
        return array_flip(static::contentTypeMap())[get_class($model)]
            ?? throw new \InvalidArgumentException('Unknown linkable model: '.get_class($model));
    }
}
