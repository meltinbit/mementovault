<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('search')]
#[Description('Full-text search across all content in this collection: documents, skills, snippets, assets, and neuron documents. Returns matching items with content excerpts.')]
#[IsReadOnly]
class SearchTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = mcp_collection();
        if (! $collection) {
            return Response::text('No collection active. Call get_context(collection: "slug") to select one.');
        }
        $query = $request->get('query');
        $results = [];

        // Search documents
        $documents = $collection->documents()
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                    ->orWhere('content', 'like', "%{$query}%");
            })
            ->get(['title', 'slug', 'type', 'content']);

        foreach ($documents as $doc) {
            $excerpt = $this->excerpt($doc->content, $query);
            $results[] = "**Document: {$doc->title}** (slug: `{$doc->slug}`, type: {$doc->type})\n> {$excerpt}";
        }

        // Search skills
        $skills = $collection->skills()
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('content', 'like', "%{$query}%");
            })
            ->get(['name', 'slug', 'description', 'content']);

        foreach ($skills as $skill) {
            $excerpt = $this->excerpt($skill->content, $query);
            $results[] = "**Skill: {$skill->name}** (slug: `{$skill->slug}`)\n> {$excerpt}";
        }

        // Search snippets
        $snippets = $collection->snippets()
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('content', 'like', "%{$query}%");
            })
            ->get(['name', 'slug', 'content']);

        foreach ($snippets as $snippet) {
            $excerpt = $this->excerpt($snippet->content, $query);
            $results[] = "**Snippet: {$snippet->name}** (slug: `{$snippet->slug}`)\n> {$excerpt}";
        }

        // Search assets
        $assets = $collection->assets()
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%")
                    ->orWhere('original_filename', 'like', "%{$query}%");
            })
            ->get(['name', 'mime_type', 'description', 'size_bytes']);

        foreach ($assets as $asset) {
            $size = number_format($asset->size_bytes / 1024, 1).' KB';
            $desc = $asset->description ? " — {$asset->description}" : '';
            $results[] = "**Asset: {$asset->name}** ({$asset->mime_type}, {$size}){$desc}";
        }

        // Search collection documents
        $collectionDocs = $collection->collectionDocuments()
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('content', 'like', "%{$query}%");
            })
            ->get(['name', 'slug', 'content']);

        foreach ($collectionDocs as $doc) {
            $excerpt = $this->excerpt($doc->content, $query);
            $results[] = "**Neuron Document: {$doc->name}** (slug: `{$doc->slug}`)\n> {$excerpt}";
        }

        if (empty($results)) {
            return Response::text("No results found for '{$query}'.");
        }

        return Response::text('Found '.count($results)." result(s) for '{$query}':\n\n".implode("\n\n", $results));
    }

    /**
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()->description('The search query to find matching content.')->required(),
        ];
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
