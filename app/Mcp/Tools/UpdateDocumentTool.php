<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('update_document')]
#[Description('Updates an existing document by slug. Creates a revision automatically.')]
class UpdateDocumentTool extends Tool
{
    public function handle(Request $request): Response
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

    public function schema(JsonSchema $schema): array
    {
        return [
            'slug' => $schema->string()->description('The slug of the document to update.')->required(),
            'title' => $schema->string()->description('New title (optional).'),
            'content' => $schema->string()->description('New markdown content (optional).'),
        ];
    }
}
