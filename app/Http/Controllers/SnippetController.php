<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSnippetRequest;
use App\Http\Requests\UpdateSnippetRequest;
use App\Models\Snippet;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SnippetController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Snippet::with('tags');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($tagId = $request->input('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        return Inertia::render('snippets/index', [
            'snippets' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'tag']),
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('snippets/create', [
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function store(StoreSnippetRequest $request): RedirectResponse
    {
        $snippet = Snippet::create($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $snippet->tags()->sync($request->validated('tag_ids', []));
        }

        return to_route('snippets.edit', $snippet);
    }

    public function edit(Snippet $snippet): Response
    {
        $snippet->load('tags');

        return Inertia::render('snippets/edit', [
            'snippet' => $snippet,
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function update(UpdateSnippetRequest $request, Snippet $snippet): RedirectResponse
    {
        $snippet->update($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $snippet->tags()->sync($request->validated('tag_ids', []));
        }

        return back();
    }

    public function destroy(Snippet $snippet): RedirectResponse
    {
        $snippet->delete();

        return to_route('snippets.index');
    }
}
