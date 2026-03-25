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

class Skill extends Model
{
    use BelongsToWorkspace, Collectable, HasFactory, HasRevisions, HasSlug, Taggable;

    protected $fillable = [
        'workspace_id',
        'name',
        'slug',
        'description',
        'content',
        'is_active',
        'version',
    ];

    protected $attributes = [
        'version' => 1,
    ];

    /** @var class-string */
    protected string $revisionModel = SkillRevision::class;

    /** @var string */
    protected string $revisionForeignKey = 'skill_id';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function revisions(): HasMany
    {
        return $this->hasMany(SkillRevision::class);
    }
}
