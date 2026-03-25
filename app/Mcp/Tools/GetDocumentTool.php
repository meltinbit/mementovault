<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_document')]
#[Description('Returns the full content of a specific document by slug.')]
#[IsReadOnly]
class GetDocumentTool extends Tool
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

        return Response::text("# {$document->title}\n\n{$document->content}");
    }

    /**
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'slug' => $schema->string()->description('The slug of the document to retrieve.')->required(),
        ];
    }
}
