<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class WorkspaceScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (app()->runningInConsole() && ! app()->runningUnitTests()) {
            return;
        }

        $workspace = function_exists('current_workspace') ? current_workspace() : null;

        if ($workspace) {
            $builder->where($model->getTable().'.workspace_id', $workspace->id);
        }
    }
}
