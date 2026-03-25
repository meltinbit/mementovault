<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Collection;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CollectionItemController extends Controller
{
    public function store(Request $request, Collection $collection): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['required', 'string', 'in:document,skill,snippet,asset'],
            'items.*.id' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            $model = match ($item['type']) {
                'document' => Document::findOrFail($item['id']),
                'skill' => Skill::findOrFail($item['id']),
                'snippet' => Snippet::findOrFail($item['id']),
                'asset' => Asset::findOrFail($item['id']),
            };

            $relation = match ($item['type']) {
                'document' => $collection->documents(),
                'skill' => $collection->skills(),
                'snippet' => $collection->snippets(),
                'asset' => $collection->assets(),
            };

            $relation->syncWithoutDetaching([$model->id]);
        }

        return back();
    }

    public function destroy(Request $request, Collection $collection): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['required', 'string', 'in:document,skill,snippet,asset'],
            'items.*.id' => ['required', 'integer'],
        ]);

        foreach ($validated['items'] as $item) {
            $relation = match ($item['type']) {
                'document' => $collection->documents(),
                'skill' => $collection->skills(),
                'snippet' => $collection->snippets(),
                'asset' => $collection->assets(),
            };

            $relation->detach($item['id']);
        }

        return back();
    }
}
