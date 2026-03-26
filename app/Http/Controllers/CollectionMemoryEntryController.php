<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMemoryEntryRequest;
use App\Http\Requests\UpdateMemoryEntryRequest;
use App\Models\Collection;
use App\Models\CollectionMemoryEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollectionMemoryEntryController extends Controller
{
    public function index(Request $request, Collection $collection): Response
    {
        $query = $collection->collectionMemoryEntries();

        $status = $request->input('status', 'active');

        match ($status) {
            'active' => $query->active(),
            'pinned' => $query->pinned(),
            'archived' => $query->where('is_archived', true),
            default => null,
        };

        if ($search = $request->input('search')) {
            $query->where('content', 'like', "%{$search}%");
        }

        if ($category = $request->input('category')) {
            $query->where('category', $category);
        }

        $entries = $query
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString();

        $categories = $collection->collectionMemoryEntries()
            ->whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('memory/index', [
            'entries' => $entries,
            'filters' => $request->only(['search', 'status', 'category']),
            'categories' => $categories,
            'collection' => $collection->only(['id', 'name', 'slug']),
        ]);
    }

    public function store(StoreMemoryEntryRequest $request, Collection $collection): RedirectResponse
    {
        $collection->collectionMemoryEntries()->create($request->validated());

        return back();
    }

    public function update(UpdateMemoryEntryRequest $request, Collection $collection, CollectionMemoryEntry $entry): RedirectResponse
    {
        $entry->update($request->validated());

        return back();
    }

    public function togglePin(Collection $collection, CollectionMemoryEntry $entry): RedirectResponse
    {
        $entry->update(['is_pinned' => ! $entry->is_pinned]);

        return back();
    }

    public function archive(Collection $collection, CollectionMemoryEntry $entry): RedirectResponse
    {
        $entry->update(['is_archived' => true]);

        return back();
    }

    public function unarchive(Collection $collection, CollectionMemoryEntry $entry): RedirectResponse
    {
        $entry->update(['is_archived' => false]);

        return back();
    }

    public function destroy(Collection $collection, CollectionMemoryEntry $entry): RedirectResponse
    {
        $entry->delete();

        return back();
    }

    public function batchArchive(Request $request, Collection $collection): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        $collection->collectionMemoryEntries()
            ->whereIn('id', $request->input('ids'))
            ->update(['is_archived' => true]);

        return back();
    }
}
