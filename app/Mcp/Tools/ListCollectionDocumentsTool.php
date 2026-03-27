<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_collection_documents')]
#[Description('Returns a list of all collection documents (system-level documents that define how AI operates in this collection). These are always included in MCP context.')]
#[IsReadOnly]
class ListCollectionDocumentsTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $docs = $collection->collectionDocuments()->get();

        $list = $docs->map(function ($doc) {
            $required = $doc->is_required ? ' [required]' : '';
            $preview = $doc->content ? ' — '.mb_substr(strip_tags($doc->content), 0, 80).'...' : '';

            return "- **{$doc->name}** (slug: `{$doc->slug}`, v{$doc->version}){$required}{$preview}";
        })->join("\n");

        return Response::text($list ?: 'No collection documents yet.');
    }
}
