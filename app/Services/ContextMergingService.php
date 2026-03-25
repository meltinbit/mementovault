<?php

namespace App\Services;

use App\Enums\SystemDocumentType;
use App\Models\Collection;
use App\Models\SystemDocument;

class ContextMergingService
{
    /**
     * Build the merged context markdown for a collection's MCP endpoint.
     */
    public function merge(Collection $collection): string
    {
        $workspace = $collection->workspace;
        $workspaceDocs = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('content', '!=', '')
            ->get()
            ->keyBy('type');

        $collectionDocs = $collection->collectionSystemDocuments()
            ->where('content', '!=', '')
            ->get()
            ->keyBy('type');

        $sections = [];

        // Iterate all workspace system documents
        foreach ($workspaceDocs as $type => $doc) {
            $label = strtoupper(SystemDocumentType::label($type));
            $parts = [$doc->content];

            // Append collection override if exists
            $collectionDoc = $collectionDocs->get($type);
            if ($collectionDoc) {
                $parts[] = $collectionDoc->content;
            }

            $sections[] = "# {$label}\n\n".implode("\n\n", $parts);
        }

        // Add collection-only docs (not in workspace)
        foreach ($collectionDocs as $type => $doc) {
            if (! $workspaceDocs->has($type)) {
                $label = strtoupper(SystemDocumentType::label($type));
                $sections[] = "# {$label}\n\n".$doc->content;
            }
        }

        // 5. Available Skills
        $skills = $collection->skills()->where('is_active', true)->get(['name', 'description']);
        if ($skills->isNotEmpty()) {
            $skillList = $skills->map(fn ($s) => "- **{$s->name}**: {$s->description}")->join("\n");
            $sections[] = "# AVAILABLE SKILLS\n\n{$skillList}";
        }

        // 6. Available Documents
        $documents = $collection->documents()->where('is_active', true)->get(['title', 'type']);
        if ($documents->isNotEmpty()) {
            $docList = $documents->map(fn ($d) => "- {$d->title} ({$d->type})")->join("\n");
            $sections[] = "# AVAILABLE DOCUMENTS\n\n{$docList}";
        }

        // 7. Available Snippets
        $snippets = $collection->snippets()->where('is_active', true)->get(['name']);
        if ($snippets->isNotEmpty()) {
            $snippetList = $snippets->map(fn ($s) => "- {$s->name}")->join("\n");
            $sections[] = "# AVAILABLE SNIPPETS\n\n{$snippetList}";
        }

        // 8. Available Assets
        $assets = $collection->assets()->where('is_active', true)->get(['name', 'description']);
        if ($assets->isNotEmpty()) {
            $assetList = $assets->map(fn ($a) => "- **{$a->name}**".($a->description ? ": {$a->description}" : ''))->join("\n");
            $sections[] = "# AVAILABLE ASSETS\n\n{$assetList}";
        }

        return implode("\n\n---\n\n", $sections);
    }
}
