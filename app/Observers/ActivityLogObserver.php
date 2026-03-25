<?php

namespace App\Observers;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;

class ActivityLogObserver
{
    public function created(Model $model): void
    {
        $this->log($model, 'created');
    }

    public function updated(Model $model): void
    {
        if ($model->wasChanged()) {
            $this->log($model, 'updated');
        }
    }

    public function deleted(Model $model): void
    {
        $this->log($model, 'deleted');
    }

    private function log(Model $model, string $action): void
    {
        $workspaceId = $model->workspace_id ?? current_workspace()?->id;

        if (! $workspaceId) {
            return;
        }

        ActivityLog::withoutGlobalScopes()->create([
            'workspace_id' => $workspaceId,
            'user_id' => auth()->id(),
            'action' => $action,
            'subject_type' => get_class($model),
            'subject_id' => $model->id,
            'description' => $this->descriptionFor($model, $action),
        ]);
    }

    private function descriptionFor(Model $model, string $action): string
    {
        $type = class_basename($model);
        $name = $model->name ?? $model->title ?? $model->type ?? '';

        return match ($action) {
            'created' => "{$type} \"{$name}\" was created",
            'updated' => "{$type} \"{$name}\" was updated",
            'deleted' => "{$type} \"{$name}\" was deleted",
            default => "{$action} {$type}",
        };
    }
}
