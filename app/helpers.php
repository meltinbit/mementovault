<?php

use App\Models\Collection;
use App\Models\Workspace;

if (! function_exists('current_workspace')) {
    function current_workspace(): ?Workspace
    {
        if (app()->bound('current_workspace')) {
            return app('current_workspace');
        }

        return null;
    }
}

if (! function_exists('mcp_collection')) {
    function mcp_collection(): ?Collection
    {
        if (app()->bound('mcp_collection')) {
            return app('mcp_collection');
        }

        return null;
    }
}
