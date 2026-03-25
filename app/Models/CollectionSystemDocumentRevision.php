<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollectionSystemDocumentRevision extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'collection_system_document_id',
        'content',
        'version',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            $model->created_at = $model->created_at ?? now();
        });
    }

    public function collectionSystemDocument(): BelongsTo
    {
        return $this->belongsTo(CollectionSystemDocument::class);
    }
}
