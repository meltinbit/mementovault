<?php

namespace App\Services;

use App\Models\Collection;
use App\Models\CollectionDocument;
use App\Models\CollectionMemoryEntry;
use App\Models\ContentLink;
use App\Models\Document;
use App\Models\MemoryEntry;
use App\Models\Skill;
use App\Models\Snippet;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class GraphService
{
    public function overview(Workspace $workspace): string
    {
        $collections = Collection::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->get();

        $lines = ["# Workspace Graph Overview\n"];
        $lines[] = "## Collections ({$collections->count()})\n";

        $totalNodes = 0;
        $totalWikilinks = 0;
        $totalMentions = 0;

        foreach ($collections as $collection) {
            $lines[] = "### {$collection->name}";

            $collDocs = $collection->collectionDocuments()->select('id', 'name')->get();
            $docs = $collection->documents()->select('documents.id', 'title')->get();
            $skills = $collection->skills()->select('skills.id', 'name')->get();
            $snippets = $collection->snippets()->select('snippets.id', 'name')->get();
            $memories = $collection->collectionMemoryEntries()->active()->count();
            $assets = $collection->assets()->count();

            if ($collDocs->isNotEmpty()) {
                $names = $collDocs->pluck('name')->implode(', ');
                $lines[] = "- Collection documents: {$collDocs->count()} ({$names})";
            } else {
                $lines[] = '- Collection documents: 0';
            }

            if ($docs->isNotEmpty()) {
                $names = $docs->pluck('title')->implode(', ');
                $lines[] = "- Documents: {$docs->count()} ({$names})";
            } else {
                $lines[] = '- Documents: 0';
            }

            $lines[] = "- Skills: {$skills->count()}";
            $lines[] = "- Snippets: {$snippets->count()}";
            $lines[] = "- Memories: {$memories}";
            $lines[] = "- Assets: {$assets}";

            // Count connections for this collection's content
            $nodeIds = $this->collectNodeIds($collection);
            $wikilinks = $this->countLinksForNodes($nodeIds, $workspace->id, 'wikilink');
            $mentions = $this->countLinksForNodes($nodeIds, $workspace->id, 'mention');

            $lines[] = "- Connections: {$wikilinks} wikilinks, {$mentions} mentions";
            $lines[] = '';

            $nodeCount = $collDocs->count() + $docs->count() + $skills->count() + $snippets->count() + $memories + $assets;
            $totalNodes += $nodeCount;
            $totalWikilinks += $wikilinks;
            $totalMentions += $mentions;
        }

        // Orphan content (not in any collection)
        $orphanDocs = Document::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->whereDoesntHave('collections')
            ->count();
        $orphanSkills = Skill::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->whereDoesntHave('collections')
            ->count();
        $orphanSnippets = Snippet::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->whereDoesntHave('collections')
            ->count();
        $workspaceMemories = MemoryEntry::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('is_archived', false)
            ->count();

        $orphanTotal = $orphanDocs + $orphanSkills + $orphanSnippets + $workspaceMemories;
        if ($orphanTotal > 0) {
            $lines[] = '## Unassigned content';
            if ($orphanDocs > 0) {
                $lines[] = "- Documents: {$orphanDocs}";
            }
            if ($orphanSkills > 0) {
                $lines[] = "- Skills: {$orphanSkills}";
            }
            if ($orphanSnippets > 0) {
                $lines[] = "- Snippets: {$orphanSnippets}";
            }
            if ($workspaceMemories > 0) {
                $lines[] = "- Workspace memories: {$workspaceMemories}";
            }
            $lines[] = '';
            $totalNodes += $orphanTotal;
        }

        $lines[] = '## Workspace totals';
        $lines[] = "- {$totalNodes} content nodes";
        $lines[] = "- {$totalWikilinks} wikilinks";
        $lines[] = "- {$totalMentions} mentions";
        $lines[] = "- {$collections->count()} collections";

        return implode("\n", $lines);
    }

    public function collection(Workspace $workspace, string $collectionSlug, string $linkType = 'all'): string
    {
        $collection = Collection::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('slug', $collectionSlug)
            ->first();

        if (! $collection) {
            return "Collection \"{$collectionSlug}\" not found.";
        }

        $lines = ["# Graph: Collection \"{$collection->name}\"\n"];

        // Nodes
        $collDocs = $collection->collectionDocuments()->select('id', 'name', 'slug', 'version')->get();
        $docs = $collection->documents()->select('documents.id', 'title', 'slug')->get();
        $skills = $collection->skills()->select('skills.id', 'name', 'slug')->get();
        $snippets = $collection->snippets()->select('snippets.id', 'name', 'slug')->get();
        $memories = $collection->collectionMemoryEntries()->active()->select('id', 'content')->get();
        $assets = $collection->assets()->select('assets.id', 'name', 'mime_type')->get();

        $nodeCount = $collDocs->count() + $docs->count() + $skills->count() + $snippets->count() + $memories->count() + $assets->count();
        $lines[] = "## Nodes ({$nodeCount})\n";

        if ($collDocs->isNotEmpty()) {
            $lines[] = '### Collection Documents';
            foreach ($collDocs as $doc) {
                $lines[] = "- {$doc->slug} (v{$doc->version})";
            }
            $lines[] = '';
        }

        if ($docs->isNotEmpty()) {
            $lines[] = '### Documents';
            foreach ($docs as $doc) {
                $lines[] = "- {$doc->slug}";
            }
            $lines[] = '';
        }

        if ($skills->isNotEmpty()) {
            $lines[] = '### Skills';
            foreach ($skills as $skill) {
                $lines[] = "- {$skill->slug}";
            }
            $lines[] = '';
        }

        if ($snippets->isNotEmpty()) {
            $lines[] = '### Snippets';
            foreach ($snippets as $snippet) {
                $lines[] = "- {$snippet->slug}";
            }
            $lines[] = '';
        }

        if ($memories->isNotEmpty()) {
            $lines[] = '### Memories';
            foreach ($memories as $mem) {
                $lines[] = '- '.Str::limit($mem->content, 60);
            }
            $lines[] = '';
        }

        if ($assets->isNotEmpty()) {
            $lines[] = '### Assets';
            foreach ($assets as $asset) {
                $lines[] = "- {$asset->name} ({$asset->mime_type})";
            }
            $lines[] = '';
        }

        // Connections
        $nodeIds = $this->collectNodeIds($collection);
        $links = $this->getLinksForNodes($nodeIds, $workspace->id, $linkType);

        if ($links->isEmpty()) {
            $lines[] = '## Connections\n\nNo connections found.';

            return implode("\n", $lines);
        }

        $lines[] = "## Connections\n";

        $outgoing = $links->filter(fn ($l) => isset($nodeIds["{$l->source_type}:{$l->source_id}"]));
        $incoming = $links->filter(fn ($l) => isset($nodeIds["{$l->target_type}:{$l->target_id}"]) && ! isset($nodeIds["{$l->source_type}:{$l->source_id}"]));

        // Group by link type
        foreach (['wikilink', 'mention'] as $type) {
            $typeOutgoing = $outgoing->where('link_type', $type);
            $typeIncoming = $incoming->where('link_type', $type);

            if ($typeOutgoing->isEmpty() && $typeIncoming->isEmpty()) {
                continue;
            }

            $typeLabel = ucfirst($type).'s';

            if ($typeOutgoing->isNotEmpty()) {
                $lines[] = "### {$typeLabel} (outgoing)";
                foreach ($typeOutgoing as $link) {
                    $targetLabel = $this->describeNode($link->target_type, $link->target_id, $workspace->id);
                    $sourceLabel = $this->describeNodeShort($link->source_type, $link->source_id);
                    $lines[] = "- {$sourceLabel} → {$targetLabel} ({$type})";
                }
                $lines[] = '';
            }

            if ($typeIncoming->isNotEmpty()) {
                $lines[] = "### {$typeLabel} (incoming)";
                foreach ($typeIncoming as $link) {
                    $sourceLabel = $this->describeNode($link->source_type, $link->source_id, $workspace->id);
                    $targetLabel = $this->describeNodeShort($link->target_type, $link->target_id);
                    $lines[] = "- {$sourceLabel} → {$targetLabel} ({$type})";
                }
                $lines[] = '';
            }
        }

        // Cross-collection summary
        $crossCollections = $this->crossCollectionSummary($links, $nodeIds, $workspace->id);
        if (! empty($crossCollections)) {
            $lines[] = '### Cross-collection summary';
            foreach ($crossCollections as $name => $count) {
                $lines[] = "- {$count} connections to \"{$name}\"";
            }
        }

        return implode("\n", $lines);
    }

    public function connections(Workspace $workspace, string $slug, ?string $contentType, string $linkType = 'all'): string
    {
        $node = $this->resolveNode($workspace, $slug, $contentType);
        if (! $node) {
            return "Content \"{$slug}\" not found".($contentType ? " (type: {$contentType})" : '').'.';
        }

        $nodeKey = "{$node['type']}:{$node['id']}";
        $collectionName = $this->collectionNameFor($node['type'], $node['id'], $workspace->id);
        $label = "{$node['slug']} ({$node['type']})".($collectionName ? " [{$collectionName}]" : '');

        $lines = ["# Connections: {$label}\n"];

        $query = ContentLink::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where(function ($q) use ($node) {
                $q->where(function ($q2) use ($node) {
                    $q2->where('source_type', $node['type'])->where('source_id', $node['id']);
                })->orWhere(function ($q2) use ($node) {
                    $q2->where('target_type', $node['type'])->where('target_id', $node['id']);
                });
            });

        if ($linkType !== 'all') {
            $query->where('link_type', $linkType);
        }

        $links = $query->get();

        $outgoing = $links->filter(fn ($l) => $l->source_type === $node['type'] && $l->source_id === $node['id']);
        $incoming = $links->filter(fn ($l) => $l->target_type === $node['type'] && $l->target_id === $node['id']);

        if ($outgoing->isNotEmpty()) {
            $lines[] = '## Outgoing (this content links to)';
            foreach ($outgoing as $link) {
                $targetLabel = $this->describeNode($link->target_type, $link->target_id, $workspace->id);
                $lines[] = "- {$targetLabel} ({$link->link_type}) — {$link->target_type}";
            }
            $lines[] = '';
        }

        if ($incoming->isNotEmpty()) {
            $lines[] = '## Incoming (other content links here)';
            foreach ($incoming as $link) {
                $sourceLabel = $this->describeNode($link->source_type, $link->source_id, $workspace->id);
                $lines[] = "- {$sourceLabel} ({$link->link_type}) — {$link->source_type}";
            }
            $lines[] = '';
        }

        if ($outgoing->isEmpty() && $incoming->isEmpty()) {
            $lines[] = 'No connections found.';

            return implode("\n", $lines);
        }

        // Summary
        $wikilinks = $links->where('link_type', 'wikilink')->count();
        $mentions = $links->where('link_type', 'mention')->count();
        $wikiOut = $outgoing->where('link_type', 'wikilink')->count();
        $wikiIn = $incoming->where('link_type', 'wikilink')->count();
        $mentOut = $outgoing->where('link_type', 'mention')->count();
        $mentIn = $incoming->where('link_type', 'mention')->count();

        $lines[] = '## Summary';
        $lines[] = "- {$wikilinks} wikilinks ({$wikiOut} outgoing, {$wikiIn} incoming)";
        $lines[] = "- {$mentions} mentions ({$mentOut} outgoing, {$mentIn} incoming)";

        // Connected collections
        $connectedCollections = [];
        foreach ($links as $link) {
            $otherType = ($link->source_type === $node['type'] && $link->source_id === $node['id'])
                ? $link->target_type : $link->source_type;
            $otherId = ($link->source_type === $node['type'] && $link->source_id === $node['id'])
                ? $link->target_id : $link->source_id;
            $coll = $this->collectionNameFor($otherType, $otherId, $workspace->id);
            if ($coll) {
                $connectedCollections[$coll] = true;
            }
        }

        if (! empty($connectedCollections)) {
            $names = implode(', ', array_keys($connectedCollections));
            $lines[] = '- Connected to '.count($connectedCollections)." collections: {$names}";
        }

        return implode("\n", $lines);
    }

    public function path(Workspace $workspace, string $sourceSlug, ?string $sourceType, string $targetSlug): string
    {
        $source = $this->resolveNode($workspace, $sourceSlug, $sourceType);
        if (! $source) {
            return "Source \"{$sourceSlug}\" not found.";
        }

        $target = $this->resolveNode($workspace, $targetSlug);
        if (! $target) {
            return "Target \"{$targetSlug}\" not found.";
        }

        if ($source['type'] === $target['type'] && $source['id'] === $target['id']) {
            return 'Source and target are the same node.';
        }

        // BFS with max 5 hops
        $allLinks = ContentLink::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->get();

        // Build adjacency list (bidirectional)
        $adj = [];
        foreach ($allLinks as $link) {
            $sKey = "{$link->source_type}:{$link->source_id}";
            $tKey = "{$link->target_type}:{$link->target_id}";
            $adj[$sKey][] = ['node' => $tKey, 'link_type' => $link->link_type, 'type' => $link->target_type, 'id' => $link->target_id];
            $adj[$tKey][] = ['node' => $sKey, 'link_type' => $link->link_type, 'type' => $link->source_type, 'id' => $link->source_id];
        }

        $sourceKey = "{$source['type']}:{$source['id']}";
        $targetKey = "{$target['type']}:{$target['id']}";

        // BFS
        $visited = [$sourceKey => true];
        $queue = [[$sourceKey]];
        $maxDepth = 5;
        $foundPath = null;

        while (! empty($queue)) {
            $path = array_shift($queue);
            $current = end($path);

            if ($current === $targetKey) {
                $foundPath = $path;
                break;
            }

            if (count($path) > $maxDepth) {
                continue;
            }

            foreach ($adj[$current] ?? [] as $neighbor) {
                if (! isset($visited[$neighbor['node']])) {
                    $visited[$neighbor['node']] = true;
                    $newPath = $path;
                    $newPath[] = $neighbor['node'];
                    $queue[] = $newPath;
                }
            }
        }

        $sourceLabel = $this->describeNode($source['type'], $source['id'], $workspace->id);
        $targetLabel = $this->describeNode($target['type'], $target['id'], $workspace->id);

        if (! $foundPath) {
            return "# Path: {$source['slug']} → {$target['slug']}\n\nNo path found between these nodes.";
        }

        $lines = ["# Path: {$source['slug']} → {$target['slug']}\n"];

        // Render path with edge types
        $lines[] = $sourceLabel;
        for ($i = 0; $i < count($foundPath) - 1; $i++) {
            $fromKey = $foundPath[$i];
            $toKey = $foundPath[$i + 1];

            // Find the edge type
            $edgeType = 'mention';
            foreach ($allLinks as $link) {
                $sKey = "{$link->source_type}:{$link->source_id}";
                $tKey = "{$link->target_type}:{$link->target_id}";
                if (($sKey === $fromKey && $tKey === $toKey) || ($sKey === $toKey && $tKey === $fromKey)) {
                    $edgeType = $link->link_type;
                    break;
                }
            }

            [$toType, $toId] = explode(':', $toKey);
            $toLabel = $this->describeNode($toType, (int) $toId, $workspace->id);
            $lines[] = "  ──{$edgeType}──▶ {$toLabel}";
        }

        $hops = count($foundPath) - 1;
        $lines[] = "\nHops: {$hops}";

        if ($hops > 1) {
            $viaNodes = [];
            for ($i = 1; $i < count($foundPath) - 1; $i++) {
                [$vType, $vId] = explode(':', $foundPath[$i]);
                $viaNodes[] = $this->describeNodeShort($vType, (int) $vId);
            }
            $lines[] = 'Via: '.implode(' → ', $viaNodes);
        }

        return implode("\n", $lines);
    }

    // --- Helpers ---

    /**
     * Collect all node keys ("type:id") for a collection.
     *
     * @return array<string, true>
     */
    private function collectNodeIds(Collection $collection): array
    {
        $ids = [];

        foreach ($collection->collectionDocuments()->pluck('id') as $id) {
            $ids["collection_document:{$id}"] = true;
        }

        foreach ($collection->documents()->pluck('documents.id') as $id) {
            $ids["document:{$id}"] = true;
        }

        foreach ($collection->skills()->pluck('skills.id') as $id) {
            $ids["skill:{$id}"] = true;
        }

        foreach ($collection->snippets()->pluck('snippets.id') as $id) {
            $ids["snippet:{$id}"] = true;
        }

        foreach ($collection->collectionMemoryEntries()->active()->pluck('id') as $id) {
            $ids["collection_memory:{$id}"] = true;
        }

        return $ids;
    }

    private function countLinksForNodes(array $nodeIds, int $workspaceId, string $linkType): int
    {
        if (empty($nodeIds)) {
            return 0;
        }

        $query = ContentLink::withoutGlobalScopes()
            ->where('workspace_id', $workspaceId)
            ->where('link_type', $linkType);

        return $query->where(function ($q) use ($nodeIds) {
            foreach (array_keys($nodeIds) as $key) {
                [$type, $id] = explode(':', $key);
                $q->orWhere(function ($q2) use ($type, $id) {
                    $q2->where('source_type', $type)->where('source_id', $id);
                })->orWhere(function ($q2) use ($type, $id) {
                    $q2->where('target_type', $type)->where('target_id', $id);
                });
            }
        })->count();
    }

    private function getLinksForNodes(array $nodeIds, int $workspaceId, string $linkType): \Illuminate\Support\Collection
    {
        if (empty($nodeIds)) {
            return collect();
        }

        $query = ContentLink::withoutGlobalScopes()
            ->where('workspace_id', $workspaceId);

        if ($linkType !== 'all') {
            $query->where('link_type', $linkType);
        }

        return $query->where(function ($q) use ($nodeIds) {
            foreach (array_keys($nodeIds) as $key) {
                [$type, $id] = explode(':', $key);
                $q->orWhere(function ($q2) use ($type, $id) {
                    $q2->where('source_type', $type)->where('source_id', $id);
                })->orWhere(function ($q2) use ($type, $id) {
                    $q2->where('target_type', $type)->where('target_id', $id);
                });
            }
        })->get();
    }

    /**
     * Resolve a slug to a node (type + id + slug).
     *
     * @return array{type: string, id: int, slug: string}|null
     */
    private function resolveNode(Workspace $workspace, string $slug, ?string $contentType = null): ?array
    {
        $models = [
            'document' => [Document::class, 'title', 'workspace_id'],
            'skill' => [Skill::class, 'name', 'workspace_id'],
            'snippet' => [Snippet::class, 'name', 'workspace_id'],
        ];

        // If content_type specified, search only that type
        if ($contentType && $contentType !== 'collection_document' && isset($models[$contentType])) {
            [$class] = $models[$contentType];
            $item = $class::withoutGlobalScopes()
                ->where('slug', $slug)
                ->where('workspace_id', $workspace->id)
                ->first();

            return $item ? ['type' => $contentType, 'id' => $item->id, 'slug' => $item->slug] : null;
        }

        if ($contentType === 'collection_document' || ! $contentType) {
            $collDoc = CollectionDocument::whereHas('collection', fn ($q) => $q->where('workspace_id', $workspace->id))
                ->where('slug', $slug)
                ->first();

            if ($collDoc) {
                return ['type' => 'collection_document', 'id' => $collDoc->id, 'slug' => $collDoc->slug];
            }

            if ($contentType === 'collection_document') {
                return null;
            }
        }

        // Search all workspace models
        foreach ($models as $type => [$class]) {
            $item = $class::withoutGlobalScopes()
                ->where('slug', $slug)
                ->where('workspace_id', $workspace->id)
                ->first();

            if ($item) {
                return ['type' => $type, 'id' => $item->id, 'slug' => $item->slug];
            }
        }

        return null;
    }

    /**
     * Describe a node with its collection context: "slug (type) [Collection Name]"
     */
    private function describeNode(string $type, int $id, int $workspaceId): string
    {
        $slug = $this->getNodeSlug($type, $id);
        $collName = $this->collectionNameFor($type, $id, $workspaceId);

        return "{$slug} ({$type})".($collName ? " [{$collName}]" : '');
    }

    /**
     * Short node description: just slug.
     */
    private function describeNodeShort(string $type, int $id): string
    {
        return $this->getNodeSlug($type, $id);
    }

    private function getNodeSlug(string $type, int $id): string
    {
        $modelClass = ContentLink::contentTypeMap()[$type] ?? null;
        if (! $modelClass) {
            return "{$type}:{$id}";
        }

        $model = $modelClass::withoutGlobalScopes()->find($id);

        return $model?->slug ?? $model?->id ?? "{$type}:{$id}";
    }

    /**
     * Get the collection name a node belongs to.
     */
    private function collectionNameFor(string $type, int $id, int $workspaceId): ?string
    {
        if ($type === 'collection_document') {
            $doc = CollectionDocument::find($id);

            return $doc?->collection?->name;
        }

        if ($type === 'collection_memory') {
            $mem = CollectionMemoryEntry::find($id);

            return $mem?->collection?->name;
        }

        // For collectables (document, skill, snippet)
        $morphType = match ($type) {
            'document' => 'App\\Models\\Document',
            'skill' => 'App\\Models\\Skill',
            'snippet' => 'App\\Models\\Snippet',
            default => null,
        };

        if (! $morphType) {
            return null;
        }

        $collectionName = DB::table('collectables')
            ->join('collections', 'collections.id', '=', 'collectables.collection_id')
            ->where('collectables.collectable_id', $id)
            ->where('collectables.collectable_type', $morphType)
            ->where('collections.workspace_id', $workspaceId)
            ->value('collections.name');

        return $collectionName;
    }

    /**
     * Summarize cross-collection connections.
     *
     * @return array<string, int>
     */
    private function crossCollectionSummary(\Illuminate\Support\Collection $links, array $nodeIds, int $workspaceId): array
    {
        $crossCollections = [];

        foreach ($links as $link) {
            // Check if source or target is outside this collection
            $sourceKey = "{$link->source_type}:{$link->source_id}";
            $targetKey = "{$link->target_type}:{$link->target_id}";

            if (! isset($nodeIds[$sourceKey])) {
                $coll = $this->collectionNameFor($link->source_type, $link->source_id, $workspaceId);
                if ($coll) {
                    $crossCollections[$coll] = ($crossCollections[$coll] ?? 0) + 1;
                }
            }

            if (! isset($nodeIds[$targetKey])) {
                $coll = $this->collectionNameFor($link->target_type, $link->target_id, $workspaceId);
                if ($coll) {
                    $crossCollections[$coll] = ($crossCollections[$coll] ?? 0) + 1;
                }
            }
        }

        return $crossCollections;
    }
}
