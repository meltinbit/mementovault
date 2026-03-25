<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Models\Document;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Document::with('tags');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        if ($tagId = $request->input('tag')) {
            $query->whereHas('tags', fn ($q) => $q->where('tags.id', $tagId));
        }

        return Inertia::render('documents/index', [
            'documents' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'type', 'tag']),
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('documents/create', [
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function store(StoreDocumentRequest $request): RedirectResponse
    {
        $document = Document::create($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $document->tags()->sync($request->validated('tag_ids', []));
        }

        return to_route('documents.edit', $document);
    }

    public function edit(Document $document): Response
    {
        $document->load('tags');

        $revisions = $document->revisions()
            ->latest('version')
            ->limit(20)
            ->get()
            ->map(fn ($revision) => [
                'id' => $revision->id,
                'content' => $revision->content,
                'version' => $revision->version,
                'created_by' => null,
                'created_at' => $revision->created_at->diffForHumans(),
            ]);

        return Inertia::render('documents/edit', [
            'document' => $document,
            'revisions' => $revisions,
            'tags' => Tag::orderBy('name')->get(),
        ]);
    }

    public function update(UpdateDocumentRequest $request, Document $document): RedirectResponse
    {
        $document->update($request->safe()->except('tag_ids'));

        if ($request->has('tag_ids')) {
            $document->tags()->sync($request->validated('tag_ids', []));
        }

        return back();
    }

    public function destroy(Document $document): RedirectResponse
    {
        $document->delete();

        return to_route('documents.index');
    }
}
