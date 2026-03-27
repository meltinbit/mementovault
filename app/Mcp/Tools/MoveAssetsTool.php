<?php

namespace App\Mcp\Tools;

use App\Models\Asset;
use App\Models\AssetFolder;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('move_assets')]
#[Description('Moves one or more assets to a folder (by folder slug), or to root by omitting the folder slug.')]
class MoveAssetsTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $assetNames = $request->get('asset_names');
        $folderSlug = $request->get('folder_slug');

        $folderId = null;
        if ($folderSlug) {
            $folder = AssetFolder::where('slug', $folderSlug)->first();

            if (! $folder) {
                return Response::error("Folder with slug '{$folderSlug}' not found.");
            }

            $folderId = $folder->id;
        }

        $assets = $collection->assets()
            ->whereIn('name', $assetNames)
            ->get();

        if ($assets->isEmpty()) {
            return Response::error('No matching assets found in this collection.');
        }

        Asset::withoutGlobalScopes()
            ->whereIn('id', $assets->pluck('id'))
            ->update(['folder_id' => $folderId]);

        $destination = $folderId ? "folder \"{$folder->name}\"" : 'root';

        return Response::text("Moved {$assets->count()} asset(s) to {$destination}.");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'asset_names' => $schema->array()->description('List of asset names to move.')->required(),
            'folder_slug' => $schema->string()->description('Target folder slug. Omit to move to root.'),
        ];
    }
}
