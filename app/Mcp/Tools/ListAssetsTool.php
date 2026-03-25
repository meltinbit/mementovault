<?php

namespace App\Mcp\Tools;

use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_assets')]
#[Description('Returns a list of all active assets in this collection with name, mime type, description, and size.')]
#[IsReadOnly]
class ListAssetsTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $assets = $collection->assets()
            ->where('is_active', true)
            ->get(['assets.id', 'name', 'mime_type', 'description', 'size_bytes']);

        $list = $assets->map(function ($a) {
            $size = number_format($a->size_bytes / 1024, 1).' KB';
            $desc = $a->description ? " — {$a->description}" : '';

            return "- **{$a->name}** ({$a->mime_type}, {$size}){$desc}";
        })->join("\n");

        return Response::text($list ?: 'No assets in this collection.');
    }
}
