<?php

namespace App\Services;

use App\Models\Workspace;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;

class WorkspaceStorageService
{
    /**
     * Get the filesystem disk for the given workspace.
     *
     * If the workspace has S3/R2 storage configured in settings,
     * a dynamic disk is built. Otherwise, falls back to the local 'assets' disk.
     */
    public function disk(?Workspace $workspace = null): Filesystem
    {
        $workspace = $workspace ?? current_workspace();

        if (! $workspace) {
            return Storage::disk('assets');
        }

        $storageConfig = $workspace->settings['storage'] ?? null;

        if (! $storageConfig || ($storageConfig['driver'] ?? 'local') === 'local') {
            return Storage::disk('assets');
        }

        return Storage::build([
            'driver' => 's3',
            'key' => $storageConfig['key'] ?? '',
            'secret' => $storageConfig['secret'] ?? '',
            'region' => $storageConfig['region'] ?? 'auto',
            'bucket' => $storageConfig['bucket'] ?? '',
            'url' => $storageConfig['url'] ?? null,
            'endpoint' => $storageConfig['endpoint'] ?? null,
            'use_path_style_endpoint' => $storageConfig['use_path_style_endpoint'] ?? true,
            'throw' => true,
        ]);
    }
}
