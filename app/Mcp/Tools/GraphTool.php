<?php

namespace App\Mcp\Tools;

use App\Services\GraphService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('graph')]
#[Description('Navigate the workspace knowledge graph. View all content nodes and their connections (hierarchy, wikilinks, mentions). IMPORTANT: Call graph(action: "overview") as your FIRST action when connecting to a workspace — it gives you the full map of all collections, their contents, and connections. Use this BEFORE get_context to understand the workspace structure. Then use get_context(collection: "slug") to activate the collection you need to work with. Actions: "overview" — full workspace map (collections, content counts, connections). Use as first call. "collection" — all nodes and connections for a specific collection (pass slug). "connections" — find everything linked to a specific content node (pass slug + content_type). Useful before creating content to avoid duplicates. "path" — find shortest path between two content nodes (pass slug + target_slug).')]
#[IsReadOnly]
class GraphTool extends Tool
{
    public function handle(Request $request, GraphService $graphService): Response
    {
        $action = $request->get('action');
        $workspace = app('current_workspace');

        return match ($action) {
            'overview' => Response::text($graphService->overview($workspace)),
            'collection' => $this->handleCollection($request, $graphService, $workspace),
            'connections' => $this->handleConnections($request, $graphService, $workspace),
            'path' => $this->handlePath($request, $graphService, $workspace),
            default => Response::error("Unknown action '{$action}'. Available: overview, collection, connections, path."),
        };
    }

    /**
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'action' => $schema->string()
                ->enum(['overview', 'collection', 'connections', 'path'])
                ->description('Action to perform on the graph.')
                ->required(),
            'slug' => $schema->string()
                ->description('Collection slug (for "collection" action) or content slug (for "connections" and "path" actions).'),
            'content_type' => $schema->string()
                ->enum(['document', 'collection_document', 'skill', 'snippet', 'memory'])
                ->description('Content type filter. Required with "connections" action to disambiguate slugs across types.'),
            'link_type' => $schema->string()
                ->enum(['all', 'wikilink', 'mention'])
                ->description('Filter edges by type. Default: all.'),
            'target_slug' => $schema->string()
                ->description('Target content slug for "path" action — finds shortest path between slug and target_slug.'),
        ];
    }

    private function handleCollection(Request $request, GraphService $graphService, $workspace): Response
    {
        $slug = $request->get('slug');
        if (! $slug) {
            return Response::error('The "slug" parameter (collection slug) is required for the "collection" action.');
        }

        return Response::text($graphService->collection($workspace, $slug, $request->get('link_type', 'all')));
    }

    private function handleConnections(Request $request, GraphService $graphService, $workspace): Response
    {
        $slug = $request->get('slug');
        if (! $slug) {
            return Response::error('The "slug" parameter (content slug) is required for the "connections" action.');
        }

        return Response::text($graphService->connections(
            $workspace,
            $slug,
            $request->get('content_type'),
            $request->get('link_type', 'all'),
        ));
    }

    private function handlePath(Request $request, GraphService $graphService, $workspace): Response
    {
        $slug = $request->get('slug');
        $targetSlug = $request->get('target_slug');

        if (! $slug || ! $targetSlug) {
            return Response::error('Both "slug" (source) and "target_slug" (target) are required for the "path" action.');
        }

        return Response::text($graphService->path(
            $workspace,
            $slug,
            $request->get('content_type'),
            $targetSlug,
        ));
    }
}
