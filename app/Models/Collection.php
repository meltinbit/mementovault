<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Collection extends Model
{
    use BelongsToWorkspace, HasFactory, HasSlug;

    protected $fillable = [
        'workspace_id',
        'name',
        'slug',
        'description',
        'type',
        'color',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function collectionSystemDocuments(): HasMany
    {
        return $this->hasMany(CollectionSystemDocument::class);
    }

    public function collectionDocuments(): HasMany
    {
        return $this->hasMany(CollectionDocument::class)->orderBy('sort_order');
    }

    public function apiTokens(): HasMany
    {
        return $this->hasMany(ApiToken::class);
    }

    public function documents(): MorphToMany
    {
        return $this->morphedByMany(Document::class, 'collectable');
    }

    public function skills(): MorphToMany
    {
        return $this->morphedByMany(Skill::class, 'collectable');
    }

    public function snippets(): MorphToMany
    {
        return $this->morphedByMany(Snippet::class, 'collectable');
    }

    public function assets(): MorphToMany
    {
        return $this->morphedByMany(Asset::class, 'collectable');
    }

    public function collectionMemoryEntries(): HasMany
    {
        return $this->hasMany(CollectionMemoryEntry::class);
    }
}
