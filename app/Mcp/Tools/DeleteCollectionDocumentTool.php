<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('delete_collection_document')]
#[Description('Deletes a collection document by slug. Required documents cannot be deleted.')]
class DeleteCollectionDocumentTool extends Tool
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

        if ($doc->is_required) {
            return Response::error("Cannot delete \"{$doc->name}\" — it is a required document.");
        }

        $name = $doc->name;
        $doc->delete();

        return Response::text("Deleted collection document \"{$name}\".");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'slug' => $schema->string()->description('The slug of the collection document to delete.')->required(),
        ];
    }
}
