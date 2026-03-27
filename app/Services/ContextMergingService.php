<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\SystemDocument;

class ContextMergingService
{
    public function __construct(
        private MemoryContextBuilder $memoryBuilder,
    ) {}

    /**
     * Build the merged context markdown for a collection's MCP endpoint.
     */
    public function merge(Collection $collection): string
    {
        $workspace = $collection->workspace;
        $sections = [];

        // 1. Workspace Identity
        $identity = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'identity')
            ->where('content', '!=', '')
            ->first();

        if ($identity) {
            $sections[] = "# IDENTITY\n\n".$identity->content;
        }

        // 2. Workspace Instructions
        $instructions = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'instructions')
            ->where('content', '!=', '')
            ->first();

        if ($instructions) {
            $sections[] = "# INSTRUCTIONS\n\n".$instructions->content;
        }

        // 3. Collection header
        $collectionHeader = "# COLLECTION: {$collection->name}";
        if ($collection->description) {
            $collectionHeader .= "\n\n".$collection->description;
        }
        $sections[] = $collectionHeader;

        // 4. Collection documents (in sort_order)
        foreach ($collection->collectionDocuments as $doc) {
            if ($doc->content) {
                $sections[] = "## {$doc->name}\n\n".$doc->content;
            }
        }

        // 5. Memory (workspace + collection)
        $memoryMarkdown = $this->memoryBuilder->build($workspace, $collection);
        if ($memoryMarkdown) {
            $sections[] = "# MEMORY\n\n".$memoryMarkdown;
        }

        // 6. Available Skills
        $skills = $collection->skills()->where('is_active', true)->get(['name', 'description']);
        if ($skills->isNotEmpty()) {
            $skillList = $skills->map(fn ($s) => "- **{$s->name}**: {$s->description}")->join("\n");
            $sections[] = "# AVAILABLE SKILLS\n\n{$skillList}";
        }

        // 7. Available Documents
        $documents = $collection->documents()->where('is_active', true)->get(['title', 'type']);
        if ($documents->isNotEmpty()) {
            $docList = $documents->map(fn ($d) => "- {$d->title} ({$d->type})")->join("\n");
            $sections[] = "# AVAILABLE DOCUMENTS\n\n{$docList}";
        }

        // 8. Available Snippets
        $snippets = $collection->snippets()->where('is_active', true)->get(['name']);
        if ($snippets->isNotEmpty()) {
            $snippetList = $snippets->map(fn ($s) => "- {$s->name}")->join("\n");
            $sections[] = "# AVAILABLE SNIPPETS\n\n{$snippetList}";
        }

        // 9. Available Assets
        $assets = $collection->assets()->where('is_active', true)->get(['name', 'description']);
        if ($assets->isNotEmpty()) {
            $assetList = $assets->map(fn ($a) => "- **{$a->name}**".($a->description ? ": {$a->description}" : ''))->join("\n");
            $sections[] = "# AVAILABLE ASSETS\n\n{$assetList}";
        }

        return implode("\n\n---\n\n", $sections);
    }
}
