<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use App\Models\CollectionDocument;
use App\Models\CollectionMemoryEntry;
use App\Models\ContentLink;
use App\Models\Document;
use App\Models\MemoryEntry;
use App\Models\Skill;
use App\Models\Snippet;
use App\Services\WikilinkParser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class GraphController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('graph/index', [
            'collections' => Collection::select('id', 'name', 'slug', 'color')->get(),
        ]);
    }

    public function data(Request $request): JsonResponse
    {
        $workspace = current_workspace();
        $scope = $request->query('scope', 'workspace');
        $collectionId = $request->query('collection_id');
        $includeOrphans = $request->boolean('include_orphans', true);

        $nodes = [];
        $edges = [];
        $nodeIds = [];

        // Pre-build a lookup: "type:id" -> node_id for content link resolution
        $idToNodeId = [];

        // Nucleus node
        $nodes[] = [
            'id' => 'nucleus',
            'type' => 'nucleus',
            'label' => $workspace->name,
            'group' => null,
        ];
        $nodeIds[] = 'nucleus';

        // Eager-load collections with their relationships in bulk
        $collectionsQuery = Collection::with([
            'collectionDocuments:id,collection_id,name,slug',
        ]);

        if ($scope === 'collection' && $collectionId) {
            $collectionsQuery->where('id', $collectionId);
        }

        $collections = $collectionsQuery->get();

        // Pre-load collectable pivots for all collections
        $collectionIds = $collections->pluck('id');
        $collectablePivots = DB::table('collectables')
            ->whereIn('collection_id', $collectionIds)
            ->get()
            ->groupBy('collection_id');

        // Pre-load all workspace content in bulk for node creation
        $allDocuments = Document::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->select('id', 'title', 'slug')
            ->get()
            ->keyBy('id');

        $allSkills = Skill::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->select('id', 'name', 'slug')
            ->get()
            ->keyBy('id');

        $allSnippets = Snippet::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->select('id', 'name', 'slug')
            ->get()
            ->keyBy('id');

        $allMemories = MemoryEntry::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('is_archived', false)
            ->select('id', 'content')
            ->get()
            ->keyBy('id');

        $allCollectionMemories = CollectionMemoryEntry::whereIn('collection_id', $collectionIds)
            ->where('is_archived', false)
            ->select('id', 'collection_id', 'content')
            ->get()
            ->keyBy('id');

        // Track which items are assigned to collections
        $assignedDocIds = collect();
        $assignedSkillIds = collect();
        $assignedSnippetIds = collect();

        foreach ($collections as $collection) {
            $collNodeId = "collection:{$collection->slug}";
            $nodes[] = [
                'id' => $collNodeId,
                'type' => 'collection',
                'label' => $collection->name,
                'group' => $collection->slug,
                'color' => $collection->color ?: '#6366f1',
            ];
            $nodeIds[] = $collNodeId;

            $edges[] = [
                'source' => 'nucleus',
                'target' => $collNodeId,
                'type' => 'hierarchy',
            ];

            // Collection documents
            foreach ($collection->collectionDocuments as $doc) {
                $nodeId = "collection_document:{$doc->slug}";
                if (! in_array($nodeId, $nodeIds)) {
                    $nodes[] = [
                        'id' => $nodeId,
                        'type' => 'collection_document',
                        'label' => $doc->name,
                        'group' => $collection->slug,
                        'contentId' => $doc->id,
                        'url' => route('collections.show', $collection),
                    ];
                    $nodeIds[] = $nodeId;
                    $idToNodeId["collection_document:{$doc->id}"] = $nodeId;
                }

                $edges[] = [
                    'source' => $collNodeId,
                    'target' => $nodeId,
                    'type' => 'hierarchy',
                ];
            }

            // Collection memory entries
            $collMems = $allCollectionMemories->filter(fn ($m) => $m->collection_id === $collection->id);
            foreach ($collMems as $mem) {
                $nodeId = "collection_memory:{$mem->id}";
                if (! in_array($nodeId, $nodeIds)) {
                    $nodes[] = [
                        'id' => $nodeId,
                        'type' => 'memory',
                        'label' => Str::limit($mem->content, 40),
                        'group' => $collection->slug,
                        'contentId' => $mem->id,
                        'url' => route('collections.memory.index', $collection),
                    ];
                    $nodeIds[] = $nodeId;
                    $idToNodeId["collection_memory:{$mem->id}"] = $nodeId;
                }

                $edges[] = [
                    'source' => $collNodeId,
                    'target' => $nodeId,
                    'type' => 'hierarchy',
                ];
            }

            // Collectable items from pivot
            $pivots = $collectablePivots->get($collection->id, collect());
            foreach ($pivots as $pivot) {
                $type = match ($pivot->collectable_type) {
                    'App\\Models\\Document' => 'document',
                    'App\\Models\\Skill' => 'skill',
                    'App\\Models\\Snippet' => 'snippet',
                    default => null,
                };

                if (! $type) {
                    continue;
                }

                $item = match ($type) {
                    'document' => $allDocuments->get($pivot->collectable_id),
                    'skill' => $allSkills->get($pivot->collectable_id),
                    'snippet' => $allSnippets->get($pivot->collectable_id),
                };

                if (! $item) {
                    continue;
                }

                match ($type) {
                    'document' => $assignedDocIds->push($item->id),
                    'skill' => $assignedSkillIds->push($item->id),
                    'snippet' => $assignedSnippetIds->push($item->id),
                };

                $slug = $item->slug;
                $nodeId = "{$type}:{$slug}";

                if (! in_array($nodeId, $nodeIds)) {
                    $label = $item->title ?? $item->name;
                    $routeName = match ($type) {
                        'document' => 'documents.edit',
                        'skill' => 'skills.edit',
                        'snippet' => 'snippets.edit',
                    };

                    $nodes[] = [
                        'id' => $nodeId,
                        'type' => $type,
                        'label' => $label,
                        'group' => $collection->slug,
                        'contentId' => $item->id,
                        'url' => route($routeName, $item),
                    ];
                    $nodeIds[] = $nodeId;
                    $idToNodeId["{$type}:{$item->id}"] = $nodeId;
                }

                $edges[] = [
                    'source' => $collNodeId,
                    'target' => $nodeId,
                    'type' => 'hierarchy',
                ];
            }
        }

        // Workspace-level orphan content
        if ($scope === 'workspace') {
            foreach ($allDocuments as $doc) {
                if ($assignedDocIds->contains($doc->id)) {
                    continue;
                }

                $nodeId = "document:{$doc->slug}";
                if (! in_array($nodeId, $nodeIds)) {
                    $nodes[] = [
                        'id' => $nodeId,
                        'type' => 'document',
                        'label' => $doc->title,
                        'group' => null,
                        'contentId' => $doc->id,
                        'url' => route('documents.edit', $doc),
                    ];
                    $nodeIds[] = $nodeId;
                    $idToNodeId["document:{$doc->id}"] = $nodeId;

                    $edges[] = ['source' => 'nucleus', 'target' => $nodeId, 'type' => 'hierarchy'];
                }
            }

            foreach ($allSkills as $skill) {
                if ($assignedSkillIds->contains($skill->id)) {
                    continue;
                }

                $nodeId = "skill:{$skill->slug}";
                if (! in_array($nodeId, $nodeIds)) {
                    $nodes[] = [
                        'id' => $nodeId,
                        'type' => 'skill',
                        'label' => $skill->name,
                        'group' => null,
                        'contentId' => $skill->id,
                        'url' => route('skills.edit', $skill),
                    ];
                    $nodeIds[] = $nodeId;
                    $idToNodeId["skill:{$skill->id}"] = $nodeId;

                    $edges[] = ['source' => 'nucleus', 'target' => $nodeId, 'type' => 'hierarchy'];
                }
            }

            foreach ($allSnippets as $snippet) {
                if ($assignedSnippetIds->contains($snippet->id)) {
                    continue;
                }

                $nodeId = "snippet:{$snippet->slug}";
                if (! in_array($nodeId, $nodeIds)) {
                    $nodes[] = [
                        'id' => $nodeId,
                        'type' => 'snippet',
                        'label' => $snippet->name,
                        'group' => null,
                        'contentId' => $snippet->id,
                        'url' => route('snippets.edit', $snippet),
                    ];
                    $nodeIds[] = $nodeId;
                    $idToNodeId["snippet:{$snippet->id}"] = $nodeId;

                    $edges[] = ['source' => 'nucleus', 'target' => $nodeId, 'type' => 'hierarchy'];
                }
            }

            foreach ($allMemories as $mem) {
                $nodeId = "memory:{$mem->id}";
                if (! in_array($nodeId, $nodeIds)) {
                    $nodes[] = [
                        'id' => $nodeId,
                        'type' => 'memory',
                        'label' => Str::limit($mem->content, 40),
                        'group' => null,
                        'contentId' => $mem->id,
                        'url' => route('memory.index'),
                    ];
                    $nodeIds[] = $nodeId;
                    $idToNodeId["memory:{$mem->id}"] = $nodeId;

                    $edges[] = ['source' => 'nucleus', 'target' => $nodeId, 'type' => 'hierarchy'];
                }
            }
        }

        // Content link edges (wikilinks + mentions) — single query, no N+1
        $contentLinks = ContentLink::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->get();

        foreach ($contentLinks as $link) {
            $sourceNodeId = $idToNodeId["{$link->source_type}:{$link->source_id}"] ?? null;
            $targetNodeId = $idToNodeId["{$link->target_type}:{$link->target_id}"] ?? null;

            if ($sourceNodeId && $targetNodeId) {
                $edges[] = [
                    'source' => $sourceNodeId,
                    'target' => $targetNodeId,
                    'type' => $link->link_type,
                ];
            }
        }

        // Filter orphans if requested
        if (! $includeOrphans) {
            $connectedIds = collect($edges)->flatMap(fn ($e) => [$e['source'], $e['target']])->unique()->values()->all();
            $nodes = array_values(array_filter($nodes, fn ($n) => in_array($n['id'], $connectedIds)));
        }

        return response()->json([
            'nodes' => array_values($nodes),
            'edges' => $edges,
        ]);
    }

    /**
     * Resolve an array of slugs to their URLs for wikilink rendering.
     */
    public function resolveSlugs(Request $request, WikilinkParser $parser): JsonResponse
    {
        $slugs = $request->input('slugs', []);
        $workspace = current_workspace();

        $resolved = [];
        foreach ($slugs as $slug) {
            $result = $parser->resolveSlug($slug, $workspace->id);
            if ($result) {
                $url = $this->urlForContent($result['type'], $result['id']);
                $resolved[$slug] = $url;
            } else {
                $resolved[$slug] = null;
            }
        }

        return response()->json($resolved);
    }

    private function urlForContent(string $type, int $id): ?string
    {
        return match ($type) {
            'document' => ($d = Document::withoutGlobalScopes()->find($id)) ? route('documents.edit', $d) : null,
            'skill' => ($s = Skill::withoutGlobalScopes()->find($id)) ? route('skills.edit', $s) : null,
            'snippet' => ($s = Snippet::withoutGlobalScopes()->find($id)) ? route('snippets.edit', $s) : null,
            'collection_document' => ($cd = CollectionDocument::find($id)) ? route('collections.show', $cd->collection_id) : null,
            default => null,
        };
    }
}
