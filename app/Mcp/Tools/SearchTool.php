<?php

namespace App\Mcp\Tools;

use App\Models\Asset;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('search')]
#[Description('Full-text search across all content. Searches documents, skills, snippets, assets, and collection documents. By default searches within the active collection. Pass scope: "workspace" to search across all workspace content regardless of collection assignment.')]
#[IsReadOnly]
class SearchTool extends Tool
{
    public function handle(Request $request): Response
    {
        $query = $request->get('query');
        $scope = $request->get('scope', 'collection');
        $collection = mcp_collection();
        $workspace = app('current_workspace');
        $results = [];

        if ($scope === 'collection' && ! $collection) {
            $scope = 'workspace';
        }

        // Search documents
        $docQuery = $scope === 'collection'
            ? $collection->documents()->where('is_active', true)
            : Document::where('workspace_id', $workspace->id)->where('is_active', true);

        $documents = $docQuery->where(function ($q) use ($query) {
            $q->where('title', 'like', "%{$query}%")
                ->orWhere('content', 'like', "%{$query}%");
        })->get(['documents.id', 'title', 'slug', 'type', 'content']);

        foreach ($documents as $doc) {
            $excerpt = $this->excerpt($doc->content, $query);
            $collections = $scope === 'workspace' ? $this->collectionsFor($doc, 'App\Models\Document') : '';
            $results[] = "**Document: {$doc->title}** (slug: `{$doc->slug}`, type: {$doc->type}){$collections}\n> {$excerpt}";
        }

        // Search skills
        $skillQuery = $scope === 'collection'
            ? $collection->skills()->where('is_active', true)
            : Skill::where('workspace_id', $workspace->id)->where('is_active', true);

        $skills = $skillQuery->where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orWhere('content', 'like', "%{$query}%");
        })->get(['skills.id', 'name', 'slug', 'description', 'content']);

        foreach ($skills as $skill) {
            $excerpt = $this->excerpt($skill->content, $query);
            $collections = $scope === 'workspace' ? $this->collectionsFor($skill, 'App\Models\Skill') : '';
            $results[] = "**Skill: {$skill->name}** (slug: `{$skill->slug}`){$collections}\n> {$excerpt}";
        }

        // Search snippets
        $snippetQuery = $scope === 'collection'
            ? $collection->snippets()->where('is_active', true)
            : Snippet::where('workspace_id', $workspace->id)->where('is_active', true);

        $snippets = $snippetQuery->where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('content', 'like', "%{$query}%");
        })->get(['snippets.id', 'name', 'slug', 'content']);

        foreach ($snippets as $snippet) {
            $excerpt = $this->excerpt($snippet->content, $query);
            $collections = $scope === 'workspace' ? $this->collectionsFor($snippet, 'App\Models\Snippet') : '';
            $results[] = "**Snippet: {$snippet->name}** (slug: `{$snippet->slug}`){$collections}\n> {$excerpt}";
        }

        // Search assets
        $assetQuery = $scope === 'collection'
            ? $collection->assets()->where('is_active', true)
            : Asset::where('workspace_id', $workspace->id)->where('is_active', true);

        $assets = $assetQuery->where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orWhere('original_filename', 'like', "%{$query}%");
        })->get(['assets.id', 'name', 'mime_type', 'description', 'size_bytes']);

        foreach ($assets as $asset) {
            $size = number_format($asset->size_bytes / 1024, 1).' KB';
            $desc = $asset->description ? " — {$asset->description}" : '';
            $collections = $scope === 'workspace' ? $this->collectionsFor($asset, 'App\Models\Asset') : '';
            $results[] = "**Asset: {$asset->name}** ({$asset->mime_type}, {$size}){$collections}{$desc}";
        }

        // Search collection documents (only when scoped to a collection)
        if ($scope === 'collection' && $collection) {
            $collectionDocs = $collection->collectionDocuments()
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('content', 'like', "%{$query}%");
                })
                ->get(['name', 'slug', 'content']);

            foreach ($collectionDocs as $doc) {
                $excerpt = $this->excerpt($doc->content, $query);
                $results[] = "**Collection Document: {$doc->name}** (slug: `{$doc->slug}`)\n> {$excerpt}";
            }
        }

        $scopeLabel = $scope === 'workspace' ? ' (workspace-wide)' : '';

        if (empty($results)) {
            return Response::text("No results found for '{$query}'{$scopeLabel}.");
        }

        return Response::text('Found '.count($results)." result(s) for '{$query}'{$scopeLabel}:\n\n".implode("\n\n", $results));
    }

    /**
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()->description('The search query to find matching content.')->required(),
            'scope' => $schema->string()->description('Search scope: "collection" (default, active collection only) or "workspace" (all content in the workspace regardless of collection).'),
        ];
    }

    private function collectionsFor($item, string $type): string
    {
        $names = \DB::table('collectables')
            ->join('collections', 'collections.id', '=', 'collectables.collection_id')
            ->where('collectables.collectable_id', $item->id)
            ->where('collectables.collectable_type', $type)
            ->pluck('collections.name');

        if ($names->isEmpty()) {
            return ' [not assigned to any collection]';
        }

        return ' [in: '.implode(', ', $names->toArray()).']';
    }

    private function excerpt(string $content, string $query, int $radius = 100): string
    {
        $pos = stripos($content, $query);

        if ($pos === false) {
            return mb_substr($content, 0, $radius * 2).'...';
        }

        $start = max(0, $pos - $radius);
        $length = strlen($query) + ($radius * 2);
        $excerpt = mb_substr($content, $start, $length);

        if ($start > 0) {
            $excerpt = '...'.$excerpt;
        }
        if ($start + $length < strlen($content)) {
            $excerpt .= '...';
        }

        return $excerpt;
    }
}
