<?php

namespace App\Services;

use App\Models\CollectionDocument;
use App\Models\CollectionMemoryEntry;
use App\Models\ContentLink;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class MentionDetector
{
    /** @var string[] Titles too generic to produce reliable mentions (lowercase) */
    private const TITLE_SKIPLIST = [
        'instructions', 'architecture', 'roadmap', 'memory', 'context',
        'identity', 'soul', 'notes', 'todo', 'readme', 'overview',
        'changelog', 'config', 'configuration', 'settings', 'draft',
        'template', 'test', 'summary', 'content', 'assets', 'setup',
        'guide', 'documentation', 'docs',
    ];

    /** @var string[] Template slugs common across collections — skip cross-collection mentions */
    private const TEMPLATE_SLUGS = [
        'instructions', 'architecture', 'memory',
    ];

    /**
     * Re-sync mention edges outgoing from a content model.
     */
    public function syncMentions(Model $source): void
    {
        $content = $source->content ?? '';
        $workspaceId = $this->getWorkspaceId($source);
        $sourceType = ContentLink::typeKeyForModel($source);
        $sourceSlug = $source->slug ?? null;
        $sourceCollectionId = $this->getCollectionId($source);

        // Delete existing mentions from this source
        ContentLink::where('source_type', $sourceType)
            ->where('source_id', $source->id)
            ->where('link_type', 'mention')
            ->delete();

        if (empty($content)) {
            return;
        }

        $cleaned = $this->stripCodeBlocks($content);
        $candidates = $this->getAllLinkableContent($workspaceId);

        // Pre-load existing wikilinks from this source to avoid duplicate checks per candidate
        $existingWikilinks = ContentLink::where('source_type', $sourceType)
            ->where('source_id', $source->id)
            ->where('link_type', 'wikilink')
            ->get()
            ->map(fn ($l) => "{$l->target_type}:{$l->target_id}")
            ->flip()
            ->all();

        $links = [];
        foreach ($candidates as $candidate) {
            // Skip self-references
            if ($candidate['type'] === $sourceType && $candidate['id'] === $source->id) {
                continue;
            }

            // Skip if an explicit wikilink already exists to this target
            if (isset($existingWikilinks["{$candidate['type']}:{$candidate['id']}"])) {
                continue;
            }

            // Skip same-slug content in different collections (e.g. two "instructions")
            if ($sourceSlug && $candidate['slug'] === $sourceSlug && $candidate['collection_id'] !== $sourceCollectionId) {
                continue;
            }

            // Skip cross-collection mentions targeting template slugs
            if ($sourceCollectionId !== $candidate['collection_id']
                && in_array($candidate['slug'], self::TEMPLATE_SLUGS, true)) {
                continue;
            }

            $matched = false;

            // Match by slug
            if (! $matched && $this->shouldMatchBySlug($candidate['slug'])) {
                if (preg_match('/\b'.preg_quote($candidate['slug'], '/').'\b/i', $cleaned)) {
                    $matched = true;
                }
            }

            // Match by title (minimum 3 words, not in skiplist)
            if (! $matched && $this->shouldMatchByTitle($candidate['title'])) {
                if (preg_match('/\b'.preg_quote($candidate['title'], '/').'\b/i', $cleaned)) {
                    $matched = true;
                }
            }

            if ($matched) {
                $links[] = [
                    'workspace_id' => $workspaceId,
                    'source_type' => $sourceType,
                    'source_id' => $source->id,
                    'target_type' => $candidate['type'],
                    'target_id' => $candidate['id'],
                    'link_type' => 'mention',
                    'created_at' => now(),
                ];
            }
        }

        if (! empty($links)) {
            DB::table('content_links')->insertOrIgnore($links);
        }
    }

    /**
     * On-save of a new content, check if existing content mentions this content's slug/title.
     */
    public function syncReverseMentions(Model $newContent): void
    {
        $workspaceId = $this->getWorkspaceId($newContent);
        $contentType = ContentLink::typeKeyForModel($newContent);
        $slug = $newContent->slug ?? null;
        $title = $this->getTitle($newContent);

        // Only search for slugs/titles that would pass our filters
        $searchSlug = ($slug && $this->shouldMatchBySlug($slug)) ? $slug : null;
        $searchTitle = ($title && $this->shouldMatchByTitle($title)) ? $title : null;

        if (! $searchSlug && ! $searchTitle) {
            return;
        }

        $modelsToCheck = [
            'document' => Document::class,
            'skill' => Skill::class,
            'snippet' => Snippet::class,
        ];

        foreach ($modelsToCheck as $type => $modelClass) {
            $query = $modelClass::withoutGlobalScopes()
                ->where('workspace_id', $workspaceId)
                ->where('content', '!=', '');

            $query->where(function ($q) use ($searchSlug, $searchTitle) {
                if ($searchSlug) {
                    $q->where('content', 'LIKE', '%'.$searchSlug.'%');
                }
                if ($searchTitle) {
                    $q->orWhere('content', 'LIKE', '%'.$searchTitle.'%');
                }
            });

            foreach ($query->cursor() as $existing) {
                if ($type === $contentType && $existing->id === $newContent->id) {
                    continue;
                }

                $this->syncMentions($existing);
            }
        }

        // Also check collection documents
        $collDocQuery = CollectionDocument::whereHas('collection', function ($q) use ($workspaceId) {
            $q->where('workspace_id', $workspaceId);
        })->where('content', '!=', '');

        $collDocQuery->where(function ($q) use ($searchSlug, $searchTitle) {
            if ($searchSlug) {
                $q->where('content', 'LIKE', '%'.$searchSlug.'%');
            }
            if ($searchTitle) {
                $q->orWhere('content', 'LIKE', '%'.$searchTitle.'%');
            }
        });

        foreach ($collDocQuery->cursor() as $existing) {
            if ($contentType === 'collection_document' && $existing->id === $newContent->id) {
                continue;
            }

            $this->syncMentions($existing);
        }
    }

    /**
     * Whether a slug is specific enough to match as a mention.
     */
    private function shouldMatchBySlug(?string $slug): bool
    {
        if (! $slug || strlen($slug) < 6) {
            return false;
        }

        // Single-word slugs (no hyphen) are too generic
        if (! str_contains($slug, '-')) {
            return false;
        }

        return true;
    }

    /**
     * Whether a title is specific enough to match as a mention.
     */
    private function shouldMatchByTitle(?string $title): bool
    {
        if (! $title) {
            return false;
        }

        if (str_word_count($title) < 3) {
            return false;
        }

        if (in_array(strtolower($title), self::TITLE_SKIPLIST, true)) {
            return false;
        }

        return true;
    }

    /**
     * Get all linkable content in a workspace (slugs + titles + collection context).
     *
     * @return array<array{type: string, id: int, slug: string|null, title: string|null, collection_id: int|null}>
     */
    private function getAllLinkableContent(int $workspaceId): array
    {
        $items = [];

        foreach (Document::withoutGlobalScopes()->where('workspace_id', $workspaceId)->select('id', 'slug', 'title')->cursor() as $doc) {
            // Get first collection assignment
            $collId = DB::table('collectables')
                ->where('collectable_type', 'App\\Models\\Document')
                ->where('collectable_id', $doc->id)
                ->value('collection_id');

            $items[] = ['type' => 'document', 'id' => $doc->id, 'slug' => $doc->slug, 'title' => $doc->title, 'collection_id' => $collId];
        }

        foreach (Skill::withoutGlobalScopes()->where('workspace_id', $workspaceId)->select('id', 'slug', 'name')->cursor() as $skill) {
            $collId = DB::table('collectables')
                ->where('collectable_type', 'App\\Models\\Skill')
                ->where('collectable_id', $skill->id)
                ->value('collection_id');

            $items[] = ['type' => 'skill', 'id' => $skill->id, 'slug' => $skill->slug, 'title' => $skill->name, 'collection_id' => $collId];
        }

        foreach (Snippet::withoutGlobalScopes()->where('workspace_id', $workspaceId)->select('id', 'slug', 'name')->cursor() as $snippet) {
            $collId = DB::table('collectables')
                ->where('collectable_type', 'App\\Models\\Snippet')
                ->where('collectable_id', $snippet->id)
                ->value('collection_id');

            $items[] = ['type' => 'snippet', 'id' => $snippet->id, 'slug' => $snippet->slug, 'title' => $snippet->name, 'collection_id' => $collId];
        }

        $collectionIds = DB::table('collections')->where('workspace_id', $workspaceId)->pluck('id');
        foreach (CollectionDocument::whereIn('collection_id', $collectionIds)->select('id', 'collection_id', 'slug', 'name')->cursor() as $collDoc) {
            $items[] = ['type' => 'collection_document', 'id' => $collDoc->id, 'slug' => $collDoc->slug, 'title' => $collDoc->name, 'collection_id' => $collDoc->collection_id];
        }

        return $items;
    }

    private function stripCodeBlocks(string $content): string
    {
        $content = preg_replace('/```[\s\S]*?```/m', '', $content);
        $content = preg_replace('/`[^`]+`/', '', $content);

        return $content;
    }

    private function getWorkspaceId(Model $model): int
    {
        if (isset($model->workspace_id)) {
            return $model->workspace_id;
        }

        if ($model instanceof CollectionDocument || $model instanceof CollectionMemoryEntry) {
            return $model->collection->workspace_id;
        }

        throw new \RuntimeException('Cannot determine workspace_id for '.get_class($model));
    }

    private function getCollectionId(Model $model): ?int
    {
        if (isset($model->collection_id)) {
            return $model->collection_id;
        }

        return null;
    }

    private function getTitle(Model $model): ?string
    {
        return $model->title ?? $model->name ?? null;
    }
}
