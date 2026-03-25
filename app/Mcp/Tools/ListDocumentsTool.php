<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_documents')]
#[Description('Returns a list of all active documents in this collection with their title, type, and slug.')]
#[IsReadOnly]
class ListDocumentsTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $documents = $collection->documents()
            ->where('is_active', true)
            ->get(['documents.id', 'title', 'type', 'slug']);

        $list = $documents->map(fn ($d) => "- **{$d->title}** (type: {$d->type}, slug: `{$d->slug}`)")->join("\n");

        return Response::text($list ?: 'No documents in this collection.');
    }
}
