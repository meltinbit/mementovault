<?php

namespace App\Services;

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
            ->get()
            ->keyBy('type');

        $collectionDocs = $collection->collectionSystemDocuments()
            ->get()
            ->keyBy('type');

        $sections = [];

        // 1. Identity (workspace only)
        $identity = $workspaceDocs->get('identity');
        if ($identity && $identity->content) {
            $sections[] = "# IDENTITY\n\n".$identity->content;
        }

        // 2. Instructions (workspace + collection override)
        $instructions = $this->mergeSection('INSTRUCTIONS', $workspaceDocs->get('instructions'), $collectionDocs->get('instructions'));
        if ($instructions) {
            $sections[] = $instructions;
        }

        // 3. Context (workspace + collection override)
        $context = $this->mergeSection('CONTEXT', $workspaceDocs->get('context'), $collectionDocs->get('context'));
        if ($context) {
            $sections[] = $context;
        }

        // 4. Memory (workspace + collection override)
        $memory = $this->mergeSection('MEMORY', $workspaceDocs->get('memory'), $collectionDocs->get('memory'));
        if ($memory) {
            $sections[] = $memory;
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

    private function mergeSection(string $title, ?object $workspaceDoc, ?object $collectionDoc): ?string
    {
        $parts = [];

        if ($workspaceDoc && $workspaceDoc->content) {
            $parts[] = $workspaceDoc->content;
        }

        if ($collectionDoc && $collectionDoc->content) {
            $parts[] = $collectionDoc->content;
        }

        if (empty($parts)) {
            return null;
        }

        return "# {$title}\n\n".implode("\n\n", $parts);
    }
}
