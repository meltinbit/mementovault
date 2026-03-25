<?php

namespace App\Mcp\Tools;

use App\Models\Document;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('create_document')]
#[Description('Creates a new document in the workspace and automatically adds it to the current collection. Returns the document slug for future reference.')]
class CreateDocumentTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $workspace = app('current_workspace');

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

    public function schema(JsonSchema $schema): array
    {
        return [
            'title' => $schema->string()->description('The document title.')->required(),
            'content' => $schema->string()->description('The markdown content of the document.')->required(),
            'type' => $schema->string()->enum(['general', 'technical', 'copy', 'brand', 'process'])->description('The document type. Defaults to general.'),
        ];
    }
}
