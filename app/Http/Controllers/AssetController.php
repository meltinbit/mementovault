<?php

namespace App\Http\Controllers;

use App\Http\Requests\BatchDeleteAssetsRequest;
use App\Http\Requests\CopyAssetsRequest;
use App\Http\Requests\MoveAssetsRequest;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Models\Asset;
use App\Models\AssetFolder;
use App\Models\Tag;
use App\Services\WorkspaceStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AssetController extends Controller
{
    public function __construct(
        private WorkspaceStorageService $storage,
    ) {}

    public function index(Request $request): Response
    {
        $query = Asset::with(['tags', 'folder']);

        if ($request->has('folder_id')) {
            $folderId = $request->input('folder_id');
            if ($folderId === null || $folderId === '' || $folderId === 'root') {
                $query->whereNull('folder_id');
            } else {
                $query->where('folder_id', (int) $folderId);
            }
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($mimeGroup = $request->input('mime')) {
            $query->where('mime_type', 'like', $mimeGroup.'%');
        }

        if ($tagId = $request->input('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        $paginated = $query->latest()->paginate(24)->withQueryString();

        $paginated->through(function (Asset $asset) {
            if (str_starts_with($asset->mime_type, 'image/') || str_starts_with($asset->mime_type, 'video/')) {
                $asset->thumbnail_url = $this->assetUrl($asset);
            }

            return $asset;
        });

        $folders = AssetFolder::whereNull('parent_id')
            ->with(['allChildren' => fn ($q) => $q->withCount('assets')->orderBy('sort_order')->orderBy('name')])
            ->withCount('assets')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $currentFolder = null;
        if ($request->filled('folder_id') && $request->input('folder_id') !== 'root') {
            $currentFolder = AssetFolder::with('parent.parent.parent')->find($request->input('folder_id'));
        }

        return Inertia::render('assets/index', [
            'assets' => $paginated,
            'filters' => $request->only(['search', 'mime', 'tag', 'folder_id']),
            'tags' => Tag::orderBy('name')->get(),
            'folders' => $folders,
            'currentFolder' => $currentFolder,
            'totalCount' => Asset::count(),
            'rootCount' => Asset::whereNull('folder_id')->count(),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('assets/create', [
            'tags' => Tag::orderBy('name')->get(),
            'folderId' => $request->input('folder_id'),
        ]);
    }

    public function store(StoreAssetRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $workspace = current_workspace();

        $uuid = Str::uuid();
        $path = "{$workspace->slug}/assets/{$uuid}/{$file->getClientOriginalName()}";

        $this->storage->disk()->putFileAs(
            dirname($path),
            $file,
            basename($path),
        );

        $asset = Asset::create([
            'folder_id' => $request->validated('folder_id'),
            'name' => $request->validated('name'),
            'original_filename' => $file->getClientOriginalName(),
            'storage_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'description' => $request->validated('description'),
        ]);

        if ($request->has('tag_ids')) {
            $asset->tags()->sync($request->validated('tag_ids', []));
        }

        return back();
    }

    public function edit(Asset $asset): Response
    {
        $asset->load(['tags', 'folder']);

        $folders = AssetFolder::whereNull('parent_id')
            ->with(['allChildren' => fn ($q) => $q->withCount('assets')->orderBy('sort_order')->orderBy('name')])
            ->withCount('assets')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('assets/edit', [
            'asset' => $asset,
            'tags' => Tag::orderBy('name')->get(),
            'folders' => $folders,
        ]);
    }

    public function update(UpdateAssetRequest $request, Asset $asset): RedirectResponse
    {
        $asset->update($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $asset->tags()->sync($request->validated('tag_ids', []));
        }

        $params = $asset->folder_id ? ['folder_id' => $asset->folder_id] : [];

        return to_route('assets.index', $params);
    }

    public function destroy(Asset $asset): RedirectResponse
    {
        $otherAssetsSharePath = Asset::withoutGlobalScopes()
            ->where('storage_path', $asset->storage_path)
            ->where('id', '!=', $asset->id)
            ->exists();

        if (! $otherAssetsSharePath) {
            $this->storage->disk()->deleteDirectory(dirname($asset->storage_path));
        }

        $asset->delete();

        return back();
    }

    public function download(Asset $asset): StreamedResponse
    {
        if (request()->query('inline')) {
            return new StreamedResponse(function () use ($asset) {
                $stream = $this->storage->disk()->readStream($asset->storage_path);
                fpassthru($stream);
                fclose($stream);
            }, 200, [
                'Content-Type' => $asset->mime_type,
                'Content-Length' => $asset->size_bytes,
                'Accept-Ranges' => 'bytes',
            ]);
        }

        return $this->storage->disk()->download($asset->storage_path, $asset->original_filename);
    }

    public function move(MoveAssetsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        Asset::whereIn('id', $validated['asset_ids'])
            ->update(['folder_id' => $validated['folder_id']]);

        return back();
    }

    public function copy(CopyAssetsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $assets = Asset::with('tags')->whereIn('id', $validated['asset_ids'])->get();

            foreach ($assets as $original) {
                $copyName = $this->generateCopyName($original->name);

                $copy = Asset::create([
                    'folder_id' => $validated['folder_id'],
                    'name' => $copyName,
                    'original_filename' => $original->original_filename,
                    'storage_path' => $original->storage_path,
                    'mime_type' => $original->mime_type,
                    'size_bytes' => $original->size_bytes,
                    'description' => $original->description,
                    'is_active' => $original->is_active,
                ]);

                if ($original->tags->isNotEmpty()) {
                    $copy->tags()->sync($original->tags->pluck('id'));
                }
            }
        });

        return back();
    }

    public function batchDelete(BatchDeleteAssetsRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated) {
            $assets = Asset::whereIn('id', $validated['asset_ids'])->get();

            foreach ($assets as $asset) {
                $otherAssetsSharePath = Asset::withoutGlobalScopes()
                    ->where('storage_path', $asset->storage_path)
                    ->where('id', '!=', $asset->id)
                    ->exists();

                if (! $otherAssetsSharePath) {
                    $this->storage->disk()->deleteDirectory(dirname($asset->storage_path));
                }

                $asset->delete();
            }
        });

        return back();
    }

    private function assetUrl(Asset $asset): string
    {
        $storageConfig = current_workspace()?->settings['storage'] ?? null;
        $publicUrl = $storageConfig['url'] ?? null;

        if ($publicUrl && ($storageConfig['driver'] ?? 'local') !== 'local') {
            return rtrim($publicUrl, '/').'/'.$asset->storage_path;
        }

        return route('assets.download', $asset->id);
    }

    private function generateCopyName(string $originalName): string
    {
        $baseName = preg_replace('/\s*\(copy(?:\s+\d+)?\)$/', '', $originalName);
        $copyName = $baseName.' (copy)';
        $counter = 2;

        while (Asset::where('name', $copyName)->exists()) {
            $copyName = $baseName." (copy {$counter})";
            $counter++;
        }

        return $copyName;
    }
}
