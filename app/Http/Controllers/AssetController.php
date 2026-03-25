<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Models\Asset;
use App\Models\Tag;
use App\Services\WorkspaceStorageService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        $query = Asset::with('tags');

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

        $paginated = $query->latest()->paginate(15)->withQueryString();

        $paginated->through(function (Asset $asset) {
            if (str_starts_with($asset->mime_type, 'image/')) {
                $asset->thumbnail_url = route('assets.download', $asset->id);
            }

            return $asset;
        });

        return Inertia::render('assets/index', [
            'assets' => $paginated,
            'filters' => $request->only(['search', 'mime', 'tag']),
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('assets/create', [
            'tags' => Tag::orderBy('name')->get(),
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

        return to_route('assets.index');
    }

    public function edit(Asset $asset): Response
    {
        $asset->load('tags');

        return Inertia::render('assets/edit', [
            'asset' => $asset,
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function update(UpdateAssetRequest $request, Asset $asset): RedirectResponse
    {
        $asset->update($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $asset->tags()->sync($request->validated('tag_ids', []));
        }

        return back();
    }

    public function destroy(Asset $asset): RedirectResponse
    {
        $this->storage->disk()->deleteDirectory(dirname($asset->storage_path));

        $asset->delete();

        return to_route('assets.index');
    }

    public function download(Asset $asset): StreamedResponse
    {
        return $this->storage->disk()->download($asset->storage_path, $asset->original_filename);
    }
}
