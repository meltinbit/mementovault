<?php

namespace App\Mcp\Tools;

use App\Models\AssetFolder;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('list_asset_folders')]
#[Description('Returns the folder tree for organizing assets. Shows folder hierarchy with asset counts.')]
#[IsReadOnly]
class ListAssetFoldersTool extends Tool
{
    public function handle(Request $request): Response
    {
        $folders = AssetFolder::whereNull('parent_id')
            ->with(['allChildren' => fn ($q) => $q->withCount('assets')->orderBy('sort_order')->orderBy('name')])
            ->withCount('assets')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        if ($folders->isEmpty()) {
            return Response::text('No asset folders. All assets are in the root.');
        }

        $lines = [];
        $this->renderTree($folders, $lines);

        return Response::text(implode("\n", $lines));
    }

    private function renderTree($folders, array &$lines, string $prefix = ''): void
    {
        foreach ($folders as $folder) {
            $count = $folder->assets_count;
            $lines[] = "{$prefix}- **{$folder->name}** (slug: `{$folder->slug}`, {$count} assets)";

            if ($folder->children && $folder->children->isNotEmpty()) {
                $this->renderTree($folder->children, $lines, $prefix.'  ');
            }
        }
    }
}
