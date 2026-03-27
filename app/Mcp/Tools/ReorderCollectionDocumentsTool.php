<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('reorder_collection_documents')]
#[Description('Reorders collection documents by providing an ordered list of slugs. The order determines how documents appear in MCP context.')]
class ReorderCollectionDocumentsTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slugs = $request->get('slugs');

        foreach ($slugs as $index => $slug) {
            $collection->collectionDocuments()
                ->where('slug', $slug)
                ->update(['sort_order' => $index]);
        }

        return Response::text('Collection documents reordered successfully.');
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'slugs' => $schema->array()->description('Ordered list of document slugs, from first to last.')->required(),
        ];
    }
}
