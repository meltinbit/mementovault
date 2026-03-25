<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateSystemDocumentRequest;
use App\Models\SystemDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemDocumentController extends Controller
{
    public function show(Request $request, string $type): Response
    {
        $document = SystemDocument::where('type', $type)->firstOrFail();

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

        return Inertia::render('workspace/'.$type, [
            'document' => [
                'id' => $document->id,
                'type' => $document->type,
                'content' => $document->content,
                'version' => $document->version,
                'updated_at' => $document->updated_at->diffForHumans(),
            ],
            'revisions' => $revisions,
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
}
