<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('update_collection_document')]
#[Description('Updates an existing collection document by slug. Creates a revision automatically.')]
class UpdateCollectionDocumentTool extends Tool
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

        $fields = [];
        if ($request->get('name')) {
            $fields['name'] = $request->get('name');
        }
        if ($request->get('content') !== null) {
            $fields['content'] = $request->get('content');
        }

        $doc->update($fields);

        return Response::text("Updated collection document \"{$doc->name}\" (now v{$doc->version}).");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'slug' => $schema->string()->description('The slug of the collection document to update.')->required(),
            'name' => $schema->string()->description('New name (optional).'),
            'content' => $schema->string()->description('New markdown content (optional).'),
        ];
    }
}
