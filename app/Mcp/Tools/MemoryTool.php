<?php

namespace App\Mcp\Tools;

use App\Models\Collection;
use App\Models\CollectionMemoryEntry;
use App\Models\MemoryEntry;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('memory')]
#[Description('Manage memory entries. Actions: list, get, create, update, delete, move, copy. Scope: "workspace" (default) or "collection" (requires active collection). Use move/copy with target_collection to transfer entries between collections or workspace.')]
class MemoryTool extends Tool
{
    public function handle(Request $request): Response
    {
        $scope = $request->get('scope', 'workspace');

        if ($scope === 'collection' && ! mcp_collection()) {
            return Response::text('No collection active. Call get_context(collection: "slug") to select one, or use scope "workspace".');
        }

        return match ($request->get('action')) {
            'list' => $this->list($request),
            'get' => $this->get($request),
            'create' => $this->create($request),
            'update' => $this->update($request),
            'delete' => $this->delete($request),
            'move' => $this->moveOrCopy($request, delete: true),
            'copy' => $this->moveOrCopy($request, delete: false),
            default => Response::error("Unknown action '{$request->get('action')}'. Use: list, get, create, update, delete, move, copy."),
        };
    }

    private function list(Request $request): Response
    {
        $scope = $request->get('scope', 'workspace');

        if ($scope === 'collection') {
            $collection = mcp_collection();
            $entries = CollectionMemoryEntry::where('collection_id', $collection->id)
                ->active()
                ->orderByDesc('is_pinned')
                ->orderByDesc('created_at')
                ->get();
        } else {
            $workspace = app('current_workspace');
            $entries = MemoryEntry::where('workspace_id', $workspace->id)
                ->active()
                ->orderByDesc('is_pinned')
                ->orderByDesc('created_at')
                ->get();
        }

        if ($entries->isEmpty()) {
            return Response::text("No memory entries ({$scope} scope).");
        }

        $list = $entries->map(function ($e) {
            $pin = $e->is_pinned ? '📌 ' : '';
            $cat = $e->category ? " [{$e->category}]" : '';

            return "- {$pin}**#{$e->id}**{$cat}: {$e->content}";
        })->join("\n");

        return Response::text($list);
    }

    private function get(Request $request): Response
    {
        $entry = $this->findEntry($request);

        if (! $entry) {
            return Response::error("Memory entry #{$request->get('id')} not found.");
        }

        $pin = $entry->is_pinned ? ' (pinned)' : '';
        $cat = $entry->category ? " [{$entry->category}]" : '';

        return Response::text("**#{$entry->id}**{$cat}{$pin}\n\n{$entry->content}");
    }

    private function create(Request $request): Response
    {
        $scope = $request->get('scope', 'workspace');
        $targetCollection = $request->get('target_collection');
        $workspace = app('current_workspace');

        if ($targetCollection) {
            $token = app()->bound('mcp_token') ? app('mcp_token') : null;

            if (! $token || ! $token->isWorkspaceToken()) {
                return Response::error('Cross-collection operations require a workspace token.');
            }

            $collection = Collection::where('workspace_id', $workspace->id)
                ->where('slug', $targetCollection)
                ->first();

            if (! $collection) {
                return Response::error("Collection '{$targetCollection}' not found.");
            }

            $entry = CollectionMemoryEntry::create([
                'collection_id' => $collection->id,
                'content' => $request->get('content'),
                'category' => $request->get('category'),
            ]);

            return Response::text("Memory entry saved to collection \"{$collection->name}\" (id: #{$entry->id}).");
        }

        if ($scope === 'collection') {
            $collection = mcp_collection();
            $entry = CollectionMemoryEntry::create([
                'collection_id' => $collection->id,
                'content' => $request->get('content'),
                'category' => $request->get('category'),
            ]);
        } else {
            $entry = MemoryEntry::create([
                'workspace_id' => $workspace->id,
                'content' => $request->get('content'),
                'category' => $request->get('category'),
            ]);
        }

        return Response::text("Memory entry saved (id: #{$entry->id}, scope: {$scope}).");
    }

    private function update(Request $request): Response
    {
        $entry = $this->findEntry($request);

        if (! $entry) {
            return Response::error("Memory entry #{$request->get('id')} not found.");
        }

        $fields = [];
        if ($request->get('content') !== null) {
            $fields['content'] = $request->get('content');
        }
        if ($request->get('category') !== null) {
            $fields['category'] = $request->get('category');
        }
        if ($request->get('is_pinned') !== null) {
            $fields['is_pinned'] = $request->get('is_pinned');
        }

        $entry->update($fields);

        return Response::text("Updated memory entry #{$entry->id}.");
    }

    private function delete(Request $request): Response
    {
        $entry = $this->findEntry($request);

        if (! $entry) {
            return Response::error("Memory entry #{$request->get('id')} not found.");
        }

        $id = $entry->id;
        $entry->update(['is_archived' => true]);

        return Response::text("Deleted memory entry #{$id}.");
    }

    private function moveOrCopy(Request $request, bool $delete): Response
    {
        $token = app()->bound('mcp_token') ? app('mcp_token') : null;

        if (! $token || ! $token->isWorkspaceToken()) {
            return Response::error('Cross-collection operations require a workspace token.');
        }

        $entry = $this->findEntry($request);

        if (! $entry) {
            return Response::error("Memory entry #{$request->get('id')} not found.");
        }

        $targetScope = $request->get('target_scope', 'collection');
        $targetCollection = $request->get('target_collection');
        $workspace = app('current_workspace');
        $action = $delete ? 'Moved' : 'Copied';

        if ($targetScope === 'workspace') {
            $new = MemoryEntry::create([
                'workspace_id' => $workspace->id,
                'content' => $entry->content,
                'category' => $entry->category,
            ]);

            if ($delete) {
                $entry->update(['is_archived' => true]);
            }

            return Response::text("{$action} memory entry #{$entry->id} → workspace (new id: #{$new->id}).");
        }

        if (! $targetCollection) {
            return Response::error('target_collection (slug) is required when target_scope is "collection".');
        }

        $collection = Collection::where('workspace_id', $workspace->id)
            ->where('slug', $targetCollection)
            ->first();

        if (! $collection) {
            return Response::error("Collection '{$targetCollection}' not found.");
        }

        $new = CollectionMemoryEntry::create([
            'collection_id' => $collection->id,
            'content' => $entry->content,
            'category' => $entry->category,
        ]);

        if ($delete) {
            $entry->update(['is_archived' => true]);
        }

        return Response::text("{$action} memory entry #{$entry->id} → collection \"{$collection->name}\" (new id: #{$new->id}).");
    }

    private function findEntry(Request $request): MemoryEntry|CollectionMemoryEntry|null
    {
        $id = $request->get('id');
        $scope = $request->get('scope', 'workspace');

        if ($scope === 'collection') {
            $collection = mcp_collection();

            return CollectionMemoryEntry::where('collection_id', $collection->id)
                ->active()
                ->find($id);
        }

        $workspace = app('current_workspace');

        return MemoryEntry::where('workspace_id', $workspace->id)
            ->active()
            ->find($id);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'action' => $schema->string()->enum(['list', 'get', 'create', 'update', 'delete', 'move', 'copy'])->description('The action to perform.')->required(),
            'id' => $schema->integer()->description('Memory entry ID. Required for get/update/delete/move/copy.'),
            'content' => $schema->string()->description('The memory content. Required for create, optional for update. Keep concise — 1-2 sentences.'),
            'category' => $schema->string()->description('Optional category label (e.g. preference, decision, workflow, technical).'),
            'is_pinned' => $schema->boolean()->description('Pin/unpin a memory entry (update only).'),
            'scope' => $schema->string()->description('Source scope: "workspace" (default) or "collection" (requires active collection).'),
            'target_scope' => $schema->string()->description('Target scope for move/copy: "workspace" or "collection" (default).'),
            'target_collection' => $schema->string()->description('Target collection slug for move/copy when target_scope is "collection".'),
        ];
    }
}
