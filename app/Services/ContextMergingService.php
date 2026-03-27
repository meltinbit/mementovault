<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\SystemDocument;

class ContextMergingService
{
    /**
     * Build a minimal context for MCP — just enough to orient the AI.
     * All content is fetched on-demand via tools.
     */
    public function merge(Collection $collection): string
    {
        $workspace = $collection->workspace;
        $sections = [];

        // 1. Workspace Identity (compact)
        $identity = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'identity')
            ->where('content', '!=', '')
            ->first();

        if ($identity) {
            $sections[] = $identity->content;
        }

        // 2. Workspace Instructions (compact)
        $instructions = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'instructions')
            ->where('content', '!=', '')
            ->first();

        if ($instructions) {
            $sections[] = $instructions->content;
        }

        // 3. Collection + inventory (slugs only, no content)
        $inventory = "Collection: {$collection->name}";
        if ($collection->description) {
            $inventory .= " — {$collection->description}";
        }

        $docs = $collection->collectionDocuments()->pluck('slug')->join(', ');
        if ($docs) {
            $inventory .= "\nCollection docs: {$docs}";
        }

        $counts = [];
        $skillCount = $collection->skills()->where('is_active', true)->count();
        $docCount = $collection->documents()->where('is_active', true)->count();
        $snippetCount = $collection->snippets()->where('is_active', true)->count();
        $assetCount = $collection->assets()->where('is_active', true)->count();

        if ($skillCount) {
            $counts[] = "{$skillCount} skills";
        }
        if ($docCount) {
            $counts[] = "{$docCount} documents";
        }
        if ($snippetCount) {
            $counts[] = "{$snippetCount} snippets";
        }
        if ($assetCount) {
            $counts[] = "{$assetCount} assets";
        }

        if ($counts) {
            $inventory .= "\nContent: ".implode(', ', $counts);
        }

        $sections[] = $inventory;

        return implode("\n\n---\n\n", $sections);
    }
}
