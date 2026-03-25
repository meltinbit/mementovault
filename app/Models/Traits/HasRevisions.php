<?php

namespace App\Models\Traits;

trait HasRevisions
{
    public static function bootHasRevisions(): void
    {
        static::updating(function ($model) {
            if ($model->isDirty('content')) {
                $revisionModel = $model->revisionModel;
                $foreignKey = $model->revisionForeignKey;

                $revisionModel::create([
                    $foreignKey => $model->id,
                    'content' => $model->getOriginal('content'),
                    'version' => $model->getOriginal('version'),
                ]);

                $model->version = $model->getOriginal('version') + 1;
            }
        });
    }
}
