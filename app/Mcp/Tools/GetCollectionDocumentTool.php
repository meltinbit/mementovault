<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_collection_document')]
#[Description('Returns the full content of a specific collection document by slug.')]
#[IsReadOnly]
class GetCollectionDocumentTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $doc = $collection->collectionDocuments()
            ->where('slug', $slug)
            ->first();

        if (! $doc) {
            return Response::error("Collection document with slug '{$slug}' not found.");
        }

        return Response::text("# {$doc->name}\n\n{$doc->content}");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'slug' => $schema->string()->description('The slug of the collection document to retrieve.')->required(),
        ];
    }
}
