<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Collection;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $query = $request->input('q', '');

        if (strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $results = [];

        $documents = Document::where('title', 'like', "%{$query}%")
            ->orWhere('content', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'title', 'type']);

        foreach ($documents as $doc) {
            $results[] = [
                'type' => 'document',
                'id' => $doc->id,
                'title' => $doc->title,
                'subtitle' => $doc->type,
                'url' => route('documents.edit', $doc->id),
            ];
        }

        $skills = Skill::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'description']);

        foreach ($skills as $skill) {
            $results[] = [
                'type' => 'skill',
                'id' => $skill->id,
                'title' => $skill->name,
                'subtitle' => mb_substr($skill->description, 0, 60),
                'url' => route('skills.edit', $skill->id),
            ];
        }

        $snippets = Snippet::where('name', 'like', "%{$query}%")
            ->orWhere('content', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name']);

        foreach ($snippets as $snippet) {
            $results[] = [
                'type' => 'snippet',
                'id' => $snippet->id,
                'title' => $snippet->name,
                'subtitle' => 'Snippet',
                'url' => route('snippets.edit', $snippet->id),
            ];
        }

        $assets = Asset::where('name', 'like', "%{$query}%")
            ->orWhere('description', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'mime_type']);

        foreach ($assets as $asset) {
            $results[] = [
                'type' => 'asset',
                'id' => $asset->id,
                'title' => $asset->name,
                'subtitle' => $asset->mime_type,
                'url' => route('assets.edit', $asset->id),
            ];
        }

        $collections = Collection::where('name', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'type']);

        foreach ($collections as $col) {
            $results[] = [
                'type' => 'collection',
                'id' => $col->id,
                'title' => $col->name,
                'subtitle' => str_replace('_', ' ', $col->type),
                'url' => route('collections.show', $col->id),
            ];
        }

        return response()->json(['results' => $results]);
    }
}
