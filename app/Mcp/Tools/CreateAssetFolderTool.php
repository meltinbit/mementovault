<?php

namespace App\Mcp\Tools;

use App\Models\AssetFolder;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('create_asset_folder')]
#[Description('Creates a new asset folder. Optionally nest it inside a parent folder by providing the parent slug.')]
class CreateAssetFolderTool extends Tool
{
    public function handle(Request $request): Response
    {
        $parentId = null;

        if ($parentSlug = $request->get('parent_slug')) {
            $parent = AssetFolder::where('slug', $parentSlug)->first();

            if (! $parent) {
                return Response::error("Parent folder with slug '{$parentSlug}' not found.");
            }

            $parentId = $parent->id;
        }

        $folder = AssetFolder::create([
            'name' => $request->get('name'),
            'parent_id' => $parentId,
        ]);

        return Response::text("Created folder \"{$folder->name}\" (slug: `{$folder->slug}`).");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('The folder name.')->required(),
            'parent_slug' => $schema->string()->description('Optional parent folder slug to nest this folder inside.'),
        ];
    }
}
