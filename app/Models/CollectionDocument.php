<?php

namespace App\Models;

use App\Models\Traits\HasRevisions;
use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CollectionDocument extends Model
{
    use HasFactory, HasRevisions, HasSlug;

    protected $fillable = [
        'collection_id',
        'name',
        'slug',
        'content',
        'schema',
        'sort_order',
        'is_required',
        'version',
    ];

    /** @var class-string */
    protected string $revisionModel = CollectionDocumentRevision::class;

    protected string $revisionForeignKey = 'collection_document_id';

    /** @var string[] Scope slug uniqueness to collection */
    protected array $slugScopeColumns = ['collection_id'];

    protected function casts(): array
    {
        return [
            'schema' => 'array',
            'is_required' => 'boolean',
            'sort_order' => 'integer',
            'version' => 'integer',
        ];
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(CollectionDocumentRevision::class);
    }
}
