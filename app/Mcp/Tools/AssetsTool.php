<?php

namespace App\Mcp\Tools;

use App\Models\Asset;
use App\Models\AssetFolder;
use App\Services\WorkspaceStorageService;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\URL;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('assets')]
#[Description('Manage assets and folders. Actions: list (list assets), get_url (name), list_folders, create_folder (name+parent_slug), move (asset_names+folder_slug).')]
class AssetsTool extends Tool
{
    public function handle(Request $request, WorkspaceStorageService $storage): Response
    {
        if (! mcp_collection()) {
            return Response::text('No collection active. Call get_context(collection: "slug") to select one.');
        }

        return match ($request->get('action')) {
            'list' => $this->list($request),
            'get_url' => $this->getUrl($request, $storage),
            'list_folders' => $this->listFolders(),
            'create_folder' => $this->createFolder($request),
            'move' => $this->move($request),
            default => Response::error("Unknown action '{$request->get('action')}'. Use: list, get_url, list_folders, create_folder, move."),
        };
    }

    private function list(Request $request): Response
    {
        $collection = app('mcp_collection');
        $query = $collection->assets()->where('is_active', true);

        if ($tag = $request->get('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('name', $tag)->orWhere('slug', $tag));
        }

        $assets = $query->get(['assets.id', 'name', 'mime_type', 'description', 'size_bytes']);

        $list = $assets->map(function ($a) {
            $size = number_format($a->size_bytes / 1024, 1).' KB';
            $desc = $a->description ? " — {$a->description}" : '';

            return "- **{$a->name}** ({$a->mime_type}, {$size}){$desc}";
        })->join("\n");

        return Response::text($list ?: 'No assets in this collection.');
    }

    private function getUrl(Request $request, WorkspaceStorageService $storage): Response
    {
        $collection = app('mcp_collection');
        $name = $request->get('name');

        $asset = $collection->assets()
            ->where('name', $name)
            ->where('is_active', true)
            ->first();

        if (! $asset) {
            return Response::error("Asset '{$name}' not found in this collection.");
        }

        $proxyUrl = URL::signedRoute('assets.download', ['asset' => $asset->id], now()->addHour());

        $storageConfig = app('current_workspace')?->settings['storage'] ?? null;
        $publicUrl = $storageConfig['url'] ?? null;
        $directUrl = null;

        if ($publicUrl && ($storageConfig['driver'] ?? 'local') !== 'local') {
            $directUrl = rtrim($publicUrl, '/').'/'.$asset->storage_path;
        } else {
            try {
                $directUrl = $storage->temporaryUrl($asset->storage_path, now()->addMinutes(30));
            } catch (\Exception) {
                // No direct URL available
            }
        }

        $response = "**Download URL (via server):** {$proxyUrl}";
        if ($directUrl) {
            $response .= "\n**Direct URL (S3/R2):** {$directUrl}";
            $response .= "\n\nUse the server URL if the direct URL is blocked by network restrictions.";
        }

        return Response::text($response);
    }

    private function listFolders(): Response
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

    private function createFolder(Request $request): Response
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

    private function move(Request $request): Response
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
            'action' => $schema->string()->enum(['list', 'get_url', 'list_folders', 'create_folder', 'move'])->description('The action to perform.')->required(),
            'name' => $schema->string()->description('Asset name (for get_url) or folder name (for create_folder).'),
            'slug' => $schema->string()->description('Asset or folder slug.'),
            'parent_slug' => $schema->string()->description('Parent folder slug for nesting (create_folder only).'),
            'tag' => $schema->string()->description('Filter assets by tag name or slug (list only).'),
            'asset_names' => $schema->array()->description('List of asset names to move (move only).'),
            'folder_slug' => $schema->string()->description('Target folder slug for move. Omit to move to root.'),
        ];
    }
}
