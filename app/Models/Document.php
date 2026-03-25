<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use App\Models\Traits\Collectable;
use App\Models\Traits\HasRevisions;
use App\Models\Traits\HasSlug;
use App\Models\Traits\Taggable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Document extends Model
{
    use BelongsToWorkspace, Collectable, HasFactory, HasRevisions, HasSlug, Taggable;

    protected $fillable = [
        'workspace_id',
        'title',
        'slug',
        'content',
        'type',
        'is_active',
        'version',
    ];

    protected $attributes = [
        'version' => 1,
    ];

    /** @var string */
    protected string $slugSource = 'title';

    /** @var class-string */
    protected string $revisionModel = DocumentRevision::class;

    /** @var string */
    protected string $revisionForeignKey = 'document_id';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(DocumentRevision::class);
    }
}
