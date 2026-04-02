<?php

namespace App\Mcp\Tools;

use App\Models\Snippet;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('snippets')]
#[Description('Manage reusable text snippets in this collection. Actions: list, get, create, update, append, delete. Use append to add content in chunks.')]
class SnippetsTool extends Tool
{
    public function handle(Request $request): Response
    {
        if (! mcp_collection()) {
            return Response::text('No collection active. Call get_context(collection: "slug") to select one.');
        }

        return match ($request->get('action')) {
            'list' => $this->list(),
            'get' => $this->get($request),
            'create' => $this->create($request),
            'update' => $this->update($request),
            'append' => $this->append($request),
            'delete' => $this->delete($request),
            default => Response::error("Unknown action '{$request->get('action')}'. Use: list, get, create, update, append, delete."),
        };
    }

    private function list(): Response
    {
        $collection = app('mcp_collection');
        $snippets = $collection->snippets()
            ->where('is_active', true)
            ->get(['snippets.id', 'name', 'slug']);

        $list = $snippets->map(fn ($s) => "- **{$s->name}** (`{$s->slug}`)")->join("\n");

        return Response::text($list ?: 'No snippets in this collection.');
    }

    private function get(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $snippet = $collection->snippets()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $snippet) {
            return Response::error("Snippet with slug '{$slug}' not found in this collection.");
        }

        return Response::text($snippet->content);
    }

    private function create(Request $request): Response
    {
        $collection = app('mcp_collection');
        $workspace = app('current_workspace');

        $snippet = Snippet::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'name' => $request->get('name'),
            'content' => $request->get('content'),
            'is_active' => true,
        ]);

        $collection->snippets()->syncWithoutDetaching([$snippet->id]);

        return Response::text("Created snippet \"{$snippet->name}\" (slug: `{$snippet->slug}`). Added to collection \"{$collection->name}\".");
    }

    private function update(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $snippet = $collection->snippets()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $snippet) {
            return Response::error("Snippet with slug '{$slug}' not found in this collection.");
        }

        $fields = [];
        if ($request->get('name')) {
            $fields['name'] = $request->get('name');
        }
        if ($request->get('content') !== null) {
            $fields['content'] = $request->get('content');
        }

        $snippet->update($fields);

        return Response::text("Updated snippet \"{$snippet->name}\".");
    }

    private function append(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $snippet = $collection->snippets()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $snippet) {
            return Response::error("Snippet with slug '{$slug}' not found in this collection.");
        }

        $snippet->update(['content' => $snippet->content.$request->get('content')]);

        $length = mb_strlen($snippet->content);

        return Response::text("Appended to \"{$snippet->name}\" ({$length} chars total).");
    }

    private function delete(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $snippet = $collection->snippets()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $snippet) {
            return Response::error("Snippet with slug '{$slug}' not found in this collection.");
        }

        $snippet->update(['is_active' => false]);

        return Response::text("Deleted snippet \"{$snippet->name}\".");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'action' => $schema->string()->enum(['list', 'get', 'create', 'update', 'append', 'delete'])->description('The action to perform. Use append to add content in chunks.')->required(),
            'slug' => $schema->string()->description('Snippet slug. Required for get/update.'),
            'name' => $schema->string()->description('Snippet name. Required for create.'),
            'content' => $schema->string()->description('Text content. Required for create.'),
        ];
    }
}
