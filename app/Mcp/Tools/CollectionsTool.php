<?php

namespace App\Mcp\Tools;

use App\Models\Collection;
use App\Services\CollectionTemplateService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('collections')]
#[Description('Manage workspace collections (neurons). Collections are project packages with their own documents, MCP endpoint, and assigned content. Actions: list, get, create, update, delete. Requires a workspace token for create/update/delete.')]
class CollectionsTool extends Tool
{
    public function handle(Request $request, CollectionTemplateService $templateService): Response
    {
        $action = $request->get('action');

        if (in_array($action, ['create', 'update', 'delete']) && ! $this->isWorkspaceToken()) {
            return Response::error('Collection management requires a workspace token.');
        }

        return match ($action) {
            'list' => $this->list(),
            'get' => $this->get($request),
            'create' => $this->create($request, $templateService),
            'update' => $this->update($request),
            'delete' => $this->delete($request),
            default => Response::error("Unknown action '{$action}'. Use: list, get, create, update, delete."),
        };
    }

    private function list(): Response
    {
        $workspace = app('current_workspace');

        $collections = Collection::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('is_active', true)
            ->withCount(['documents', 'skills', 'snippets', 'assets'])
            ->get();

        if ($collections->isEmpty()) {
            return Response::text('No collections found.');
        }

        $list = $collections->map(function ($c) {
            $desc = $c->description ? " — {$c->description}" : '';
            $counts = "docs: {$c->documents_count}, skills: {$c->skills_count}, snippets: {$c->snippets_count}, assets: {$c->assets_count}";

            return "- **{$c->name}** (`{$c->slug}`, {$c->type}){$desc}\n  {$counts}";
        })->join("\n");

        return Response::text("Collections ({$collections->count()}):\n\n{$list}");
    }

    private function get(Request $request): Response
    {
        $slug = $request->get('slug');
        if (! $slug) {
            return Response::error('The "slug" parameter is required for the "get" action.');
        }

        $workspace = app('current_workspace');
        $collection = Collection::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('slug', $slug)
            ->withCount(['documents', 'skills', 'snippets', 'assets'])
            ->first();

        if (! $collection) {
            return Response::error("Collection '{$slug}' not found.");
        }

        $collDocs = $collection->collectionDocuments()->get(['name', 'slug']);
        $collDocList = $collDocs->map(fn ($d) => "- {$d->name} (`{$d->slug}`)")->join("\n");

        $lines = [
            "# {$collection->name}",
            '',
            "- **Slug:** `{$collection->slug}`",
            "- **Type:** {$collection->type}",
            "- **Color:** {$collection->color}",
            $collection->description ? "- **Description:** {$collection->description}" : null,
            "- **Documents:** {$collection->documents_count}",
            "- **Skills:** {$collection->skills_count}",
            "- **Snippets:** {$collection->snippets_count}",
            "- **Assets:** {$collection->assets_count}",
        ];

        if ($collDocs->isNotEmpty()) {
            $lines[] = '';
            $lines[] = "## Collection Documents\n{$collDocList}";
        }

        return Response::text(implode("\n", array_filter($lines, fn ($l) => $l !== null)));
    }

    private function create(Request $request, CollectionTemplateService $templateService): Response
    {
        $workspace = app('current_workspace');
        $name = $request->get('name');

        if (! $name) {
            return Response::error('The "name" parameter is required for the "create" action.');
        }

        $type = $request->get('type', 'custom');
        $validTypes = ['software_project', 'client_project', 'product_saas', 'marketing', 'sales_agent', 'social_manager', 'strategy_brainstorm', 'custom'];

        if (! in_array($type, $validTypes)) {
            return Response::error("Invalid type '{$type}'. Valid types: ".implode(', ', $validTypes));
        }

        $color = $request->get('color', $this->generateColor());

        if (! preg_match('/^#[0-9a-fA-F]{6}$/', $color)) {
            return Response::error("Invalid color '{$color}'. Use hex format: #RRGGBB.");
        }

        $collection = Collection::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'name' => $name,
            'description' => $request->get('description'),
            'type' => $type,
            'color' => $color,
            'is_active' => true,
        ]);

        $templateService->seedDocuments($collection);

        $docCount = $collection->collectionDocuments()->count();

        return Response::text(
            "Created collection \"{$collection->name}\" (slug: `{$collection->slug}`, type: {$type})."
            .($docCount > 0 ? " Seeded {$docCount} template document(s)." : '')
            ."\n\nUse `get_context(collection: \"{$collection->slug}\")` to activate it."
        );
    }

    private function update(Request $request): Response
    {
        $slug = $request->get('slug');
        if (! $slug) {
            return Response::error('The "slug" parameter is required for the "update" action.');
        }

        $workspace = app('current_workspace');
        $collection = Collection::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('slug', $slug)
            ->first();

        if (! $collection) {
            return Response::error("Collection '{$slug}' not found.");
        }

        $fields = [];
        if ($request->get('name') !== null) {
            $fields['name'] = $request->get('name');
        }
        if ($request->get('description') !== null) {
            $fields['description'] = $request->get('description');
        }
        if ($request->get('color') !== null) {
            if (! preg_match('/^#[0-9a-fA-F]{6}$/', $request->get('color'))) {
                return Response::error('Invalid color. Use hex format: #RRGGBB.');
            }
            $fields['color'] = $request->get('color');
        }

        if (empty($fields)) {
            return Response::error('No fields to update. Provide at least one of: name, description, color.');
        }

        $collection->update($fields);

        return Response::text("Updated collection \"{$collection->name}\" (`{$collection->slug}`).");
    }

    private function delete(Request $request): Response
    {
        $slug = $request->get('slug');
        if (! $slug) {
            return Response::error('The "slug" parameter is required for the "delete" action.');
        }

        $workspace = app('current_workspace');
        $collection = Collection::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('slug', $slug)
            ->first();

        if (! $collection) {
            return Response::error("Collection '{$slug}' not found.");
        }

        $collection->update(['is_active' => false]);

        return Response::text("Deleted collection \"{$collection->name}\".");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'action' => $schema->string()
                ->enum(['list', 'get', 'create', 'update', 'delete'])
                ->description('The action to perform.')
                ->required(),
            'slug' => $schema->string()
                ->description('Collection slug. Required for get/update/delete.'),
            'name' => $schema->string()
                ->description('Collection name. Required for create.'),
            'description' => $schema->string()
                ->description('Collection description. Optional for create/update.'),
            'type' => $schema->string()
                ->enum(['software_project', 'client_project', 'product_saas', 'marketing', 'sales_agent', 'social_manager', 'strategy_brainstorm', 'custom'])
                ->description('Collection type. Determines which template documents are seeded. Default: custom.'),
            'color' => $schema->string()
                ->description('Collection color in hex format (#RRGGBB). Auto-generated if omitted on create.'),
        ];
    }

    private function isWorkspaceToken(): bool
    {
        $token = app()->bound('mcp_token') ? app('mcp_token') : null;

        return $token && $token->isWorkspaceToken();
    }

    private function generateColor(): string
    {
        $colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#3b82f6', '#ef4444', '#eab308', '#14b8a6'];

        return $colors[array_rand($colors)];
    }
}
