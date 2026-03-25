<?php

namespace App\Models;

use App\Models\Traits\HasRevisions;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollectionSystemDocument extends Model
{
    use HasFactory, HasRevisions;

    protected $fillable = [
        'collection_id',
        'type',
        'content',
        'version',
    ];

    /** @var class-string */
    protected string $revisionModel = CollectionSystemDocumentRevision::class;

    /** @var string */
    protected string $revisionForeignKey = 'collection_system_document_id';

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(CollectionSystemDocumentRevision::class);
    }
}
