<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCollectionRequest;
use App\Http\Requests\UpdateCollectionRequest;
use App\Models\Asset;
use App\Models\AssetFolder;
use App\Models\Collection;
use App\Models\CollectionDocumentTemplate;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use App\Services\CollectionTemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CollectionController extends Controller
{
    public function __construct(
        private CollectionTemplateService $templateService,
    ) {}

    public function index(Request $request): Response
    {
        $query = Collection::withCount(['documents', 'skills', 'snippets', 'assets']);

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($type = $request->input('type')) {
            $query->where('type', $type);
        }

        return Inertia::render('collections/index', [
            'collections' => $query->latest()->paginate(15)->withQueryString(),
            'filters' => $request->only(['search', 'type']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('collections/create');
    }

    public function store(StoreCollectionRequest $request): RedirectResponse
    {
        $collection = Collection::create($request->validated());

        $this->templateService->seedDocuments($collection);

        return to_route('collections.show', $collection);
    }

    public function show(Collection $collection): Response
    {
        $collection->loadCount(['documents', 'skills', 'snippets', 'assets']);

        return Inertia::render('collections/show', [
            'collection' => $collection,
            'collectionDocuments' => $collection->collectionDocuments()->get()->map(fn ($doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'slug' => $doc->slug,
                'content' => $doc->content,
                'sort_order' => $doc->sort_order,
                'is_required' => $doc->is_required,
                'version' => $doc->version,
                'updated_at' => $doc->updated_at->diffForHumans(),
            ]),
            'tokens' => $collection->apiTokens()->latest()->get()->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at?->diffForHumans(),
                'expires_at' => $token->expires_at?->toDateString(),
                'created_at' => $token->created_at->diffForHumans(),
            ]),
            'documents' => $collection->documents()->with('tags')->get(),
            'skills' => $collection->skills()->with('tags')->get(),
            'snippets' => $collection->snippets()->with('tags')->get(),
            'assets' => $collection->assets()->with('tags')->get(),
            'availableDocuments' => Document::whereDoesntHave('collections', fn ($q) => $q->where('collections.id', $collection->id))->get(['id', 'title', 'type']),
            'availableSkills' => Skill::whereDoesntHave('collections', fn ($q) => $q->where('collections.id', $collection->id))->get(['id', 'name']),
            'availableSnippets' => Snippet::whereDoesntHave('collections', fn ($q) => $q->where('collections.id', $collection->id))->get(['id', 'name']),
            'availableAssets' => Asset::whereDoesntHave('collections', fn ($q) => $q->where('collections.id', $collection->id))->get(['id', 'name', 'mime_type']),
            'assetFolders' => AssetFolder::withCount('assets')->orderBy('name')->get(['id', 'name']),
            'memoryEntries' => $collection->collectionMemoryEntries()
                ->active()
                ->orderByDesc('is_pinned')
                ->orderByDesc('created_at')
                ->limit(10)
                ->get(),
            'mcpEndpoint' => url('/mcp'),
            'documentTemplates' => CollectionDocumentTemplate::orderBy('sort_order')->get(['id', 'name', 'description', 'placeholder']),
            'newToken' => session('newToken'),
        ]);
    }

    public function edit(Collection $collection): RedirectResponse
    {
        return to_route('collections.show', $collection);
    }

    public function update(UpdateCollectionRequest $request, Collection $collection): RedirectResponse
    {
        $collection->update($request->validated());

        return back();
    }

    public function destroy(Collection $collection): RedirectResponse
    {
        $collection->delete();

        return to_route('collections.index');
    }
}
