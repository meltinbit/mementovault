<?php

namespace App\Models\Traits;

use Illuminate\Support\Str;

trait HasSlug
{
    public static function bootHasSlug(): void
    {
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $source = $model->slugSource ?? 'name';
                $baseSlug = Str::slug($model->{$source});
                $slug = $baseSlug;
                $counter = 2;

                $query = static::withoutGlobalScopes()->where('slug', $slug);

                if (isset($model->workspace_id)) {
                    $query->where('workspace_id', $model->workspace_id);
                }

                if (isset($model->slugScopeColumns)) {
                    foreach ($model->slugScopeColumns as $col) {
                        $query->where($col, $model->{$col});
                    }
                }

                while ($query->exists()) {
                    $slug = $baseSlug.'-'.$counter;
                    $query = static::withoutGlobalScopes()->where('slug', $slug);

                    if (isset($model->workspace_id)) {
                        $query->where('workspace_id', $model->workspace_id);
                    }

                    if (isset($model->slugScopeColumns)) {
                        foreach ($model->slugScopeColumns as $col) {
                            $query->where($col, $model->{$col});
                        }
                    }

                    $counter++;
                }

                $model->slug = $slug;
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('slug')) {
                $model->slug = $model->getOriginal('slug');
            }
        });
    }
}
