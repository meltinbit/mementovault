<?php

namespace App\Models;

use App\Models\Traits\BelongsToWorkspace;
use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AssetFolder extends Model
{
    use BelongsToWorkspace, HasFactory, HasSlug;

    protected array $slugScopeColumns = ['parent_id'];

    protected $fillable = [
        'workspace_id',
        'parent_id',
        'name',
        'slug',
        'sort_order',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(AssetFolder::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(AssetFolder::class, 'parent_id');
    }

    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'folder_id');
    }
}
