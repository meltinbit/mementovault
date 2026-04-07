<?php

namespace App\Mcp\Tools;

use App\Models\Collection;
use App\Models\Document;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('documents')]
#[Description('Manage workspace documents in this collection. Actions: list, get, create, update, append, delete. Use append to add content in chunks.')]
class DocumentsTool extends Tool
{
    public function handle(Request $request): Response
    {
        $action = $request->get('action');

        if (! mcp_collection() && ! in_array($action, ['list', 'get'])) {
            return Response::text('No collection active. Call get_context(collection: "slug") to select one.');
        }

        return match ($action) {
            'list' => $this->list(),
            'get' => $this->get($request),
            'create' => $this->create($request),
            'update' => $this->update($request),
            'append' => $this->append($request),
            'delete' => $this->delete($request),
            default => Response::error("Unknown action '{$action}'. Use: list, get, create, update, append, delete."),
        };
    }

    private function list(): Response
    {
        $collection = mcp_collection();
        $docs = $collection
            ? $collection->documents()->where('is_active', true)->get(['documents.id', 'title', 'type', 'slug'])
            : Document::where('workspace_id', app('current_workspace')->id)->where('is_active', true)->get(['id', 'title', 'type', 'slug']);

        $list = $docs->map(fn ($d) => "- **{$d->title}** (`{$d->slug}`, {$d->type})")->join("\n");

        return Response::text($list ?: 'No documents in this collection.');
    }

    private function get(Request $request): Response
    {
        $collection = mcp_collection();
        $slug = $request->get('slug');

        $document = $collection
            ? $collection->documents()->where('slug', $slug)->where('is_active', true)->first()
            : Document::where('workspace_id', app('current_workspace')->id)->where('slug', $slug)->where('is_active', true)->first();

        if (! $document) {
            return Response::error("Document with slug '{$slug}' not found.");
        }

        return Response::text("# {$document->title}\n\n{$document->content}");
    }

    private function create(Request $request): Response
    {
        $workspace = app('current_workspace');
        $targetCollection = $request->get('target_collection');

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
        } else {
            $collection = app('mcp_collection');
        }

        $document = Document::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'title' => $request->get('title'),
            'content' => $request->get('content'),
            'type' => $request->get('type', 'general'),
            'is_active' => true,
        ]);

        $collection->documents()->syncWithoutDetaching([$document->id]);

        return Response::text("Created document \"{$document->title}\" (slug: `{$document->slug}`). Added to collection \"{$collection->name}\".");
    }

    private function update(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $document = $collection->documents()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $document) {
            return Response::error("Document with slug '{$slug}' not found in this collection.");
        }

        $fields = [];
        if ($request->get('title')) {
            $fields['title'] = $request->get('title');
        }
        if ($request->get('content') !== null) {
            $fields['content'] = $request->get('content');
        }

        $document->update($fields);

        return Response::text("Updated document \"{$document->title}\" (now v{$document->version}).");
    }

    private function append(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $document = $collection->documents()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $document) {
            return Response::error("Document with slug '{$slug}' not found in this collection.");
        }

        $document->update(['content' => $document->content.$request->get('content')]);

        $length = mb_strlen($document->content);

        return Response::text("Appended to \"{$document->title}\" (now v{$document->version}, {$length} chars total).");
    }

    private function delete(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $document = $collection->documents()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $document) {
            return Response::error("Document with slug '{$slug}' not found in this collection.");
        }

        $document->update(['is_active' => false]);

        return Response::text("Deleted document \"{$document->title}\".");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'action' => $schema->string()->enum(['list', 'get', 'create', 'update', 'append', 'delete'])->description('The action to perform. Use append to add content in chunks.')->required(),
            'slug' => $schema->string()->description('Document slug. Required for get/update.'),
            'title' => $schema->string()->description('Document title. Required for create.'),
            'content' => $schema->string()->description('Markdown content. Required for create, optional for update.'),
            'type' => $schema->string()->enum(['general', 'technical', 'copy', 'brand', 'process'])->description('Document type. For create only, defaults to general.'),
            'target_collection' => $schema->string()->description('Create in a different collection by slug (create only). Skips active collection context.'),
        ];
    }
}
