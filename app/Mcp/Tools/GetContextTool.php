<?php

namespace App\Mcp\Tools;

use App\Models\Collection;
use App\Models\SystemDocument;
use App\Services\ContextMergingService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_context')]
#[Description('Activate a collection to work with, or list available collections. Pass a collection slug to activate it and load its full context (identity, instructions, collection documents). Omit the slug to list available collections. TIP: Prefer graph(action: "overview") over calling this without a slug — the graph gives you richer information about the workspace structure.')]
#[IsReadOnly]
class GetContextTool extends Tool
{
    public function handle(Request $request, ContextMergingService $service): Response
    {
        $workspace = app('current_workspace');
        $token = app()->bound('mcp_token') ? app('mcp_token') : null;

        // Collection token or no token context — always returns that collection's context
        if (! $token || ! $token->isWorkspaceToken()) {
            $collection = mcp_collection();
            if (! $collection) {
                return Response::error('No collection available.');
            }

            return Response::text($service->merge($collection));
        }

        // Workspace token — check if switching collection
        $collectionSlug = $request->get('collection');

        if ($collectionSlug) {
            $collection = Collection::where('workspace_id', $workspace->id)
                ->where('slug', $collectionSlug)
                ->first();

            if (! $collection) {
                return Response::error("Collection '{$collectionSlug}' not found in this workspace.");
            }

            // Persist the switch
            $token->update(['active_collection_id' => $collection->id]);
            app()->instance('mcp_collection', $collection);

            return Response::text($service->merge($collection));
        }

        // No slug provided — check if there's an active collection
        $activeCollection = mcp_collection();
        if ($activeCollection) {
            return Response::text($service->merge($activeCollection));
        }

        // No active collection — return workspace overview with collection list
        return Response::text($this->workspaceOverview($workspace));
    }

    private function workspaceOverview($workspace): string
    {
        $sections = [];

        $identity = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'identity')
            ->where('content', '!=', '')
            ->first();

        if ($identity) {
            $sections[] = $identity->content;
        }

        $collections = $workspace->collections()
            ->where('is_active', true)
            ->get(['id', 'name', 'slug', 'description', 'type']);

        $list = $collections->map(function ($c) {
            $desc = $c->description ? " — {$c->description}" : '';

            return "- **{$c->name}** (`{$c->slug}`, {$c->type}){$desc}";
        })->join("\n");

        $sections[] = "Collections:\n{$list}\n\nCall get_context(collection: \"slug\") to select one.";

        return implode("\n\n---\n\n", $sections);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'collection' => $schema->string()->description('Collection slug to activate. Omit to see available collections or current context.'),
        ];
    }
}
