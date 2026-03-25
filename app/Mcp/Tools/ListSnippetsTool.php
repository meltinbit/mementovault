<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_snippets')]
#[Description('Returns a list of all active snippets in this collection with their name and slug.')]
#[IsReadOnly]
class ListSnippetsTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $snippets = $collection->snippets()
            ->where('is_active', true)
            ->get(['snippets.id', 'name', 'slug']);

        $list = $snippets->map(fn ($s) => "- **{$s->name}** (`{$s->slug}`)")->join("\n");

        return Response::text($list ?: 'No snippets in this collection.');
    }
}
