<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateWorkspaceRequest;
use App\Models\Workspace;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkspaceSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        $workspace = current_workspace();
        $storageSettings = $workspace->settings['storage'] ?? null;

        return Inertia::render('settings/workspace', [
            'workspace' => [
                'id' => $workspace->id,
                'name' => $workspace->name,
                'slug' => $workspace->slug,
                'description' => $workspace->description,
            ],
            'mcpInstructions' => $workspace->settings['mcp_instructions'] ?? Workspace::defaultMcpInstructions(),
            'defaultMcpInstructions' => Workspace::defaultMcpInstructions(),
            'mcpCustomPrompt' => $workspace->settings['mcp_custom_prompt'] ?? '',
            'memoryMaxEntries' => $workspace->settings['memory_max_entries'] ?? 50,
            'collectionMemoryMaxEntries' => $workspace->settings['collection_memory_max_entries'] ?? 20,
            'workspaceTokens' => $workspace->apiTokens()->latest()->get()->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at?->diffForHumans(),
                'expires_at' => $token->expires_at?->toDateString(),
                'created_at' => $token->created_at->diffForHumans(),
            ]),
            'mcpEndpoint' => url('/mcp'),
            'newWorkspaceToken' => session('newWorkspaceToken'),
            'storageSettings' => $storageSettings ? [
                'driver' => $storageSettings['driver'] ?? 'local',
                'key' => $storageSettings['key'] ?? '',
                'secret' => $storageSettings['secret'] ? '••••••••' : '',
                'region' => $storageSettings['region'] ?? 'auto',
                'bucket' => $storageSettings['bucket'] ?? '',
                'endpoint' => $storageSettings['endpoint'] ?? '',
                'url' => $storageSettings['url'] ?? '',
                'use_path_style_endpoint' => $storageSettings['use_path_style_endpoint'] ?? true,
            ] : null,
        ]);
    }

    public function update(UpdateWorkspaceRequest $request): RedirectResponse
    {
        $workspace = current_workspace();

        $data = $request->safe()->only(['name', 'description']);
        $workspace->fill($data);

        // Handle storage settings (always S3-compatible)
        if ($request->has('storage_key')) {
            $settings = $workspace->settings ?? [];
            $storageConfig = [
                'driver' => 's3',
                'key' => $request->input('storage_key', ''),
                'region' => $request->input('storage_region', 'auto'),
                'bucket' => $request->input('storage_bucket', ''),
                'endpoint' => $request->input('storage_endpoint', ''),
                'url' => $request->input('storage_url', ''),
                'use_path_style_endpoint' => (bool) $request->input('storage_use_path_style_endpoint', true),
            ];

            // Only update secret if a new one is provided (not the masked value)
            $newSecret = $request->input('storage_secret');
            if ($newSecret && $newSecret !== '••••••••') {
                $storageConfig['secret'] = $newSecret;
            } else {
                $storageConfig['secret'] = $settings['storage']['secret'] ?? '';
            }

            $settings['storage'] = $storageConfig;
            $workspace->settings = $settings;
        }

        // Handle MCP settings
        $settings = $workspace->settings ?? [];

        if ($request->has('mcp_instructions')) {
            $mcpInstructions = $request->validated('mcp_instructions');

            if ($mcpInstructions) {
                $settings['mcp_instructions'] = $mcpInstructions;
            } else {
                unset($settings['mcp_instructions']);
            }
        }

        if ($request->has('mcp_custom_prompt')) {
            $customPrompt = $request->validated('mcp_custom_prompt');

            if ($customPrompt) {
                $settings['mcp_custom_prompt'] = $customPrompt;
            } else {
                unset($settings['mcp_custom_prompt']);
            }
        }

        // Handle memory limits
        if ($request->has('memory_max_entries')) {
            $settings['memory_max_entries'] = (int) $request->validated('memory_max_entries') ?: 50;
        }

        if ($request->has('collection_memory_max_entries')) {
            $settings['collection_memory_max_entries'] = (int) $request->validated('collection_memory_max_entries') ?: 20;
        }

        $workspace->settings = $settings ?: null;

        $workspace->save();

        return to_route('workspace.settings');
    }
}
