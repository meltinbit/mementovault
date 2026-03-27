<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\CollectionDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CollectionDocumentController extends Controller
{
    public function store(Request $request, Collection $collection): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string', 'max:65535'],
        ]);

        $maxOrder = $collection->collectionDocuments()->max('sort_order') ?? -1;

        CollectionDocument::create([
            'collection_id' => $collection->id,
            'name' => $validated['name'],
            'content' => $validated['content'] ?? '',
            'sort_order' => $maxOrder + 1,
        ]);

        return back();
    }

    public function update(Request $request, Collection $collection, CollectionDocument $document): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string', 'max:65535'],
        ]);

        $document->update($validated);

        return back();
    }

    public function destroy(Collection $collection, CollectionDocument $document): RedirectResponse
    {
        if ($document->is_required) {
            abort(403, 'Cannot delete a required document.');
        }

        $document->delete();

        return back();
    }

    public function reorder(Request $request, Collection $collection): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        foreach ($validated['ids'] as $index => $id) {
            $collection->collectionDocuments()
                ->where('id', $id)
                ->update(['sort_order' => $index]);
        }

        return back();
    }
}
