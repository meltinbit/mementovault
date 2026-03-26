<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMemoryEntryRequest;
use App\Http\Requests\UpdateMemoryEntryRequest;
use App\Models\MemoryEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemoryEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = MemoryEntry::query();

        $status = $request->input('status', 'active');

        match ($status) {
            'active' => $query->active(),
            'pinned' => $query->pinned(),
            'archived' => $query->where('is_archived', true),
            default => null, // 'all' — no filter
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

        $categories = MemoryEntry::whereNotNull('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return Inertia::render('memory/index', [
            'entries' => $entries,
            'filters' => $request->only(['search', 'status', 'category']),
            'categories' => $categories,
        ]);
    }

    public function store(StoreMemoryEntryRequest $request): RedirectResponse
    {
        MemoryEntry::create($request->validated());

        return back();
    }

    public function update(UpdateMemoryEntryRequest $request, MemoryEntry $entry): RedirectResponse
    {
        $entry->update($request->validated());

        return back();
    }

    public function togglePin(MemoryEntry $entry): RedirectResponse
    {
        $entry->update(['is_pinned' => ! $entry->is_pinned]);

        return back();
    }

    public function archive(MemoryEntry $entry): RedirectResponse
    {
        $entry->update(['is_archived' => true]);

        return back();
    }

    public function unarchive(MemoryEntry $entry): RedirectResponse
    {
        $entry->update(['is_archived' => false]);

        return back();
    }

    public function destroy(MemoryEntry $entry): RedirectResponse
    {
        $entry->delete();

        return back();
    }

    public function batchArchive(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        MemoryEntry::whereIn('id', $request->input('ids'))->update(['is_archived' => true]);

        return back();
    }
}
