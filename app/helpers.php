<?php

use App\Models\Workspace;

if (! function_exists('current_workspace')) {
    /**
     * Get the current workspace from the container.
     */
    function current_workspace(): ?Workspace
    {
        if (app()->bound('current_workspace')) {
            return app('current_workspace');
        }

        return null;
    }
}
