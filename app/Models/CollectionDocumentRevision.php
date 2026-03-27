<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionDocumentRevision extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'collection_document_id',
        'content',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            $model->created_at = $model->created_at ?? now();
        });
    }

    public function collectionDocument(): BelongsTo
    {
        return $this->belongsTo(CollectionDocument::class);
    }
}
