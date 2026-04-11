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
    /** @var string[] Titles too generic to produce reliable mentions */
    private const GENERIC_TITLES = [
        'instructions', 'architecture', 'roadmap', 'memory', 'context',
        'identity', 'soul', 'notes', 'todo', 'readme', 'overview',
        'changelog', 'config', 'settings', 'draft', 'template',
    ];

    /**
     * Re-sync mention edges outgoing from a content model.
     */
    public function syncMentions(Model $source): void
    {
        $content = $source->content ?? '';
        $workspaceId = $this->getWorkspaceId($source);
        $sourceType = ContentLink::typeKeyForModel($source);

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

        $links = [];
        foreach ($candidates as $candidate) {
            // Skip self-references
            if ($candidate['type'] === $sourceType && $candidate['id'] === $source->id) {
                continue;
            }

            // Skip if an explicit wikilink already exists to this target
            $wikilinkExists = ContentLink::where('source_type', $sourceType)
                ->where('source_id', $source->id)
                ->where('target_type', $candidate['type'])
                ->where('target_id', $candidate['id'])
                ->where('link_type', 'wikilink')
                ->exists();

            if ($wikilinkExists) {
                continue;
            }

            $matched = false;

            // Match by slug (word boundary, case-insensitive)
            if (! empty($candidate['slug']) && preg_match('/\b'.preg_quote($candidate['slug'], '/').'\b/i', $cleaned)) {
                $matched = true;
            }

            // Match by title (minimum 3 words, case-insensitive, word boundary)
            if (! $matched && ! empty($candidate['title'])) {
                $titleWords = str_word_count($candidate['title']);
                $titleLower = strtolower($candidate['title']);

                if ($titleWords >= 3 && ! in_array($titleLower, self::GENERIC_TITLES)) {
                    if (preg_match('/\b'.preg_quote($candidate['title'], '/').'\b/i', $cleaned)) {
                        $matched = true;
                    }
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

        if (! $slug && ! $title) {
            return;
        }

        // Find all content in this workspace that might mention this new content
        $modelsToCheck = [
            'document' => Document::class,
            'skill' => Skill::class,
            'snippet' => Snippet::class,
        ];

        foreach ($modelsToCheck as $type => $modelClass) {
            $query = $modelClass::withoutGlobalScopes()
                ->where('workspace_id', $workspaceId)
                ->where('content', '!=', '');

            $query->where(function ($q) use ($slug, $title) {
                if ($slug) {
                    $q->where('content', 'LIKE', '%'.$slug.'%');
                }
                if ($title && str_word_count($title) >= 3) {
                    $q->orWhere('content', 'LIKE', '%'.$title.'%');
                }
            });

            foreach ($query->cursor() as $existing) {
                // Skip self
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

        $collDocQuery->where(function ($q) use ($slug, $title) {
            if ($slug) {
                $q->where('content', 'LIKE', '%'.$slug.'%');
            }
            if ($title && str_word_count($title) >= 3) {
                $q->orWhere('content', 'LIKE', '%'.$title.'%');
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
     * Get all linkable content in a workspace (slugs + titles).
     *
     * @return array<array{type: string, id: int, slug: string|null, title: string|null}>
     */
    private function getAllLinkableContent(int $workspaceId): array
    {
        $items = [];

        // Documents
        foreach (Document::withoutGlobalScopes()->where('workspace_id', $workspaceId)->select('id', 'slug', 'title')->cursor() as $doc) {
            $items[] = ['type' => 'document', 'id' => $doc->id, 'slug' => $doc->slug, 'title' => $doc->title];
        }

        // Skills
        foreach (Skill::withoutGlobalScopes()->where('workspace_id', $workspaceId)->select('id', 'slug', 'name')->cursor() as $skill) {
            $items[] = ['type' => 'skill', 'id' => $skill->id, 'slug' => $skill->slug, 'title' => $skill->name];
        }

        // Snippets
        foreach (Snippet::withoutGlobalScopes()->where('workspace_id', $workspaceId)->select('id', 'slug', 'name')->cursor() as $snippet) {
            $items[] = ['type' => 'snippet', 'id' => $snippet->id, 'slug' => $snippet->slug, 'title' => $snippet->name];
        }

        // Collection documents (all collections in workspace)
        $collectionIds = DB::table('collections')->where('workspace_id', $workspaceId)->pluck('id');
        foreach (CollectionDocument::whereIn('collection_id', $collectionIds)->select('id', 'slug', 'name')->cursor() as $collDoc) {
            $items[] = ['type' => 'collection_document', 'id' => $collDoc->id, 'slug' => $collDoc->slug, 'title' => $collDoc->name];
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

    private function getTitle(Model $model): ?string
    {
        return $model->title ?? $model->name ?? null;
    }
}
