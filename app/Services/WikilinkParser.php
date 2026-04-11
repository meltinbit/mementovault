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

class WikilinkParser
{
    /** @var string Regex to match [[slug]] and [[slug|label]] outside code blocks */
    private const WIKILINK_PATTERN = '/\[\[([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)(?:\|[^\]]+)?\]\]/i';

    /**
     * Extract wikilink slugs from content, ignoring code blocks.
     *
     * @return string[]
     */
    public function extractLinks(string $content): array
    {
        $cleaned = $this->stripCodeBlocks($content);

        preg_match_all(self::WIKILINK_PATTERN, $cleaned, $matches);

        return array_unique(array_map('strtolower', $matches[1] ?? []));
    }

    /**
     * Resolve a slug to a (type, id) pair within a workspace.
     *
     * @return array{type: string, id: int}|null
     */
    public function resolveSlug(string $slug, int $workspaceId, ?int $collectionId = null): ?array
    {
        $slug = strtolower($slug);

        // 1. If within a collection, search collection documents first
        if ($collectionId) {
            $collDoc = CollectionDocument::where('slug', $slug)
                ->where('collection_id', $collectionId)
                ->first();

            if ($collDoc) {
                return ['type' => 'collection_document', 'id' => $collDoc->id];
            }
        }

        // 2. Search workspace-level models (documents, skills, snippets)
        $models = [
            'document' => Document::class,
            'skill' => Skill::class,
            'snippet' => Snippet::class,
        ];

        foreach ($models as $type => $modelClass) {
            $record = $modelClass::withoutGlobalScopes()
                ->where('slug', $slug)
                ->where('workspace_id', $workspaceId)
                ->first();

            if ($record) {
                return ['type' => $type, 'id' => $record->id];
            }
        }

        // 3. Search collection documents across all collections in workspace
        if ($collectionId) {
            $collDoc = CollectionDocument::whereHas('collection', function ($q) use ($workspaceId) {
                $q->where('workspace_id', $workspaceId);
            })
                ->where('slug', $slug)
                ->first();

            if ($collDoc) {
                return ['type' => 'collection_document', 'id' => $collDoc->id];
            }
        } else {
            // No collection context — search all collection documents
            $collDoc = CollectionDocument::whereHas('collection', function ($q) use ($workspaceId) {
                $q->where('workspace_id', $workspaceId);
            })
                ->where('slug', $slug)
                ->first();

            if ($collDoc) {
                return ['type' => 'collection_document', 'id' => $collDoc->id];
            }
        }

        return null;
    }

    /**
     * Re-sync all wikilink edges for a given content model.
     */
    public function syncLinks(Model $source): void
    {
        $content = $source->content ?? '';
        $workspaceId = $this->getWorkspaceId($source);
        $collectionId = $this->getCollectionId($source);
        $sourceType = ContentLink::typeKeyForModel($source);

        // Delete existing wikilinks from this source
        ContentLink::where('source_type', $sourceType)
            ->where('source_id', $source->id)
            ->where('link_type', 'wikilink')
            ->delete();

        if (empty($content)) {
            return;
        }

        $slugs = $this->extractLinks($content);

        $links = [];
        foreach ($slugs as $slug) {
            $resolved = $this->resolveSlug($slug, $workspaceId, $collectionId);
            if (! $resolved) {
                continue;
            }

            // Avoid self-links
            if ($resolved['type'] === $sourceType && $resolved['id'] === $source->id) {
                continue;
            }

            $links[] = [
                'workspace_id' => $workspaceId,
                'source_type' => $sourceType,
                'source_id' => $source->id,
                'target_type' => $resolved['type'],
                'target_id' => $resolved['id'],
                'link_type' => 'wikilink',
                'created_at' => now(),
            ];
        }

        if (! empty($links)) {
            DB::table('content_links')->insertOrIgnore($links);
        }
    }

    /**
     * Strip fenced code blocks from content to avoid matching inside them.
     */
    private function stripCodeBlocks(string $content): string
    {
        // Remove fenced code blocks (``` ... ```)
        $content = preg_replace('/```[\s\S]*?```/m', '', $content);
        // Remove inline code (`...`)
        $content = preg_replace('/`[^`]+`/', '', $content);

        return $content;
    }

    private function getWorkspaceId(Model $model): int
    {
        if (isset($model->workspace_id)) {
            return $model->workspace_id;
        }

        // CollectionDocument → Collection → workspace_id
        if ($model instanceof CollectionDocument) {
            return $model->collection->workspace_id;
        }

        // CollectionMemoryEntry → Collection → workspace_id
        if ($model instanceof CollectionMemoryEntry) {
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
}
