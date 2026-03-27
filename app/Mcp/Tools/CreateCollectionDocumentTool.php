<?php

namespace App\Mcp\Tools;

use App\Models\CollectionDocument;
use App\Models\CollectionDocumentTemplate;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('create_collection_document')]
#[Description('Creates a new collection document. Optionally use a template slug to pre-fill content. Collection documents are system-level and always included in MCP context.')]
class CreateCollectionDocumentTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');

        $name = $request->get('name');
        $content = $request->get('content') ?? '';

        if ($templateSlug = $request->get('template')) {
            $template = CollectionDocumentTemplate::where('slug', $templateSlug)->first();

            if (! $template) {
                return Response::error("Template with slug '{$templateSlug}' not found. Use list_collection_document_templates to see available templates.");
            }

            $name = $name ?: $template->name;
            $content = $content ?: $template->placeholder;
        }

        if (! $name) {
            return Response::error('A name is required (either directly or via template).');
        }

        $maxOrder = $collection->collectionDocuments()->max('sort_order') ?? -1;

        $doc = CollectionDocument::create([
            'collection_id' => $collection->id,
            'name' => $name,
            'content' => $content,
            'sort_order' => $maxOrder + 1,
        ]);

        return Response::text("Created collection document \"{$doc->name}\" (slug: `{$doc->slug}`). It will be included in MCP context automatically.");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('The document name. Optional if using a template (will use template name as default).'),
            'content' => $schema->string()->description('The markdown content. Optional if using a template (will use template placeholder as default).'),
            'template' => $schema->string()->description('Optional template slug to pre-fill name and content. Use list_collection_document_templates to see available templates.'),
        ];
    }
}
