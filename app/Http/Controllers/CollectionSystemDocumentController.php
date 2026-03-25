<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\CollectionSystemDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CollectionSystemDocumentController extends Controller
{
    public function update(Request $request, Collection $collection, string $type): RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:65535'],
        ]);

        $doc = CollectionSystemDocument::firstOrNew([
            'collection_id' => $collection->id,
            'type' => $type,
        ]);

        if ($doc->exists) {
            $doc->update(['content' => $validated['content']]);
        } else {
            $doc->fill([
                'content' => $validated['content'],
                'version' => 1,
            ])->save();
        }

        return back();
    }
}
