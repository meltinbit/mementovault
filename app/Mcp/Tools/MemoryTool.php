<?php

namespace App\Mcp\Tools;

use App\Models\CollectionMemoryEntry;
use App\Models\MemoryEntry;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('memory')]
#[Description('Manage memory entries. Actions: list, get, create, update, delete. Scope: "workspace" (default) or "collection" (requires active collection). Memory entries store preferences, decisions, and patterns for future conversations.')]
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
            default => Response::error("Unknown action '{$request->get('action')}'. Use: list, get, create, update, delete."),
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

        if ($scope === 'collection') {
            $collection = mcp_collection();
            $entry = CollectionMemoryEntry::create([
                'collection_id' => $collection->id,
                'content' => $request->get('content'),
                'category' => $request->get('category'),
            ]);
        } else {
            $workspace = app('current_workspace');
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
            'action' => $schema->string()->enum(['list', 'get', 'create', 'update', 'delete'])->description('The action to perform.')->required(),
            'id' => $schema->integer()->description('Memory entry ID. Required for get/update/delete.'),
            'content' => $schema->string()->description('The memory content. Required for create, optional for update. Keep concise — 1-2 sentences.'),
            'category' => $schema->string()->description('Optional category label (e.g. preference, decision, workflow, technical).'),
            'is_pinned' => $schema->boolean()->description('Pin/unpin a memory entry (update only).'),
            'scope' => $schema->string()->description('Scope: "workspace" (default) or "collection" (requires active collection).'),
        ];
    }
}
