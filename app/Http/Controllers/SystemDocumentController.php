<?php

namespace App\Http\Controllers;

use App\Enums\SystemDocumentType;
use App\Http\Requests\UpdateSystemDocumentRequest;
use App\Models\SystemDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemDocumentController extends Controller
{
    public function show(Request $request, string $type): Response|RedirectResponse
    {
        if ($type === 'memory') {
            return to_route('memory.index');
        }

        $document = SystemDocument::where('type', $type)->first();

        // Create on first visit if doesn't exist
        if (! $document) {
            $document = SystemDocument::create([
                'type' => $type,
                'content' => '',
                'version' => 1,
            ]);
        }

        $revisions = $document->revisions()
            ->latest('version')
            ->limit(20)
            ->get()
            ->map(fn ($revision) => [
                'id' => $revision->id,
                'content' => $revision->content,
                'version' => $revision->version,
                'created_by' => $revision->created_by,
                'created_at' => $revision->created_at->diffForHumans(),
            ]);

        return Inertia::render('workspace/show', [
            'document' => [
                'id' => $document->id,
                'type' => $document->type,
                'content' => $document->content,
                'version' => $document->version,
                'updated_at' => $document->updated_at->diffForHumans(),
            ],
            'revisions' => $revisions,
            'meta' => [
                'label' => SystemDocumentType::label($type),
                'description' => SystemDocumentType::description($type),
                'guidance' => SystemDocumentType::guidance($type),
                'icon' => SystemDocumentType::icon($type),
                'isCore' => SystemDocumentType::isCore($type),
            ],
        ]);
    }

    public function update(UpdateSystemDocumentRequest $request, string $type): RedirectResponse
    {
        $document = SystemDocument::where('type', $type)->firstOrFail();

        $document->update([
            'content' => $request->validated('content'),
        ]);

        return back();
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'max:50', 'regex:/^[a-z][a-z0-9_-]*$/'],
            'label' => ['nullable', 'string', 'max:100'],
        ]);

        $type = $validated['type'];

        if (SystemDocument::where('type', $type)->exists()) {
            return to_route('workspace.show', $type);
        }

        SystemDocument::create([
            'type' => $type,
            'content' => '',
            'version' => 1,
        ]);

        return to_route('workspace.show', $type);
    }
}
