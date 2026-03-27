<?php

namespace App\Mcp\Tools;

use App\Models\CollectionDocumentTemplate;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_collection_document_templates')]
#[Description('Returns a list of available document templates that can be used when creating new collection documents.')]
#[IsReadOnly]
class ListCollectionDocumentTemplatesTool extends Tool
{
    public function handle(Request $request): Response
    {
        $templates = CollectionDocumentTemplate::orderBy('sort_order')->get();

        $list = $templates->map(function ($t) {
            $desc = $t->description ? " — {$t->description}" : '';

            return "- **{$t->name}** (slug: `{$t->slug}`){$desc}";
        })->join("\n");

        return Response::text($list ?: 'No document templates available.');
    }
}
