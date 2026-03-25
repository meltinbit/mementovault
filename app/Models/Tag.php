<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Tag extends Model
{
    use BelongsToWorkspace, HasFactory, HasSlug;

    public $timestamps = false;

    protected $fillable = [
        'workspace_id',
        'name',
        'slug',
        'color',
    ];

    public function documents(): MorphToMany
    {
        return $this->morphedByMany(Document::class, 'taggable');
    }

    public function skills(): MorphToMany
    {
        return $this->morphedByMany(Skill::class, 'taggable');
    }

    public function snippets(): MorphToMany
    {
        return $this->morphedByMany(Snippet::class, 'taggable');
    }

    public function assets(): MorphToMany
    {
        return $this->morphedByMany(Asset::class, 'taggable');
    }
}
