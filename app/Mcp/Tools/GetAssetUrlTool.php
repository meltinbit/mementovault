<?php

namespace App\Mcp\Tools;

use App\Services\WorkspaceStorageService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\URL;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_asset_url')]
#[Description('Returns a download URL for a specific asset by name.')]
#[IsReadOnly]
class GetAssetUrlTool extends Tool
{
    public function handle(Request $request, WorkspaceStorageService $storage): Response
    {
        $collection = app('mcp_collection');
        $name = $request->get('name');

        $asset = $collection->assets()
            ->where('name', $name)
            ->where('is_active', true)
            ->first();

        if (! $asset) {
            return Response::error("Asset with name '{$name}' not found in this collection.");
        }

        $workspace = $collection->workspace;

        // Try to generate a temporary signed URL (works with S3/R2)
        // Falls back to a direct download route for local storage
        try {
            $url = $storage->disk($workspace)->temporaryUrl($asset->storage_path, now()->addHour());
        } catch (\RuntimeException $e) {
            $url = URL::route('assets.download', $asset->id);
        }

        return Response::text($url);
    }

    /**
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('The name of the asset to get the download URL for.')->required(),
        ];
    }
}
