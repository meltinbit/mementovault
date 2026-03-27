<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAssetFolderRequest;
use App\Http\Requests\UpdateAssetFolderRequest;
use App\Models\Asset;
use App\Models\AssetFolder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class AssetFolderController extends Controller
{
    public function index(): JsonResponse
    {
        $folders = AssetFolder::whereNull('parent_id')
            ->with(['allChildren' => fn ($q) => $q->withCount('assets')->orderBy('sort_order')->orderBy('name')])
            ->withCount('assets')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json($folders);
    }

    public function store(StoreAssetFolderRequest $request): RedirectResponse
    {
        AssetFolder::create($request->validated());

        return back();
    }

    public function update(UpdateAssetFolderRequest $request, AssetFolder $assetFolder): RedirectResponse
    {
        $assetFolder->update($request->safe()->only(['name', 'parent_id']));

        return back();
    }

    public function destroy(AssetFolder $assetFolder): RedirectResponse
    {
        DB::transaction(function () use ($assetFolder) {
            Asset::where('folder_id', $assetFolder->id)->update(['folder_id' => null]);
            AssetFolder::where('parent_id', $assetFolder->id)->update(['parent_id' => null]);
            $assetFolder->delete();
        });

        return back();
    }
}
