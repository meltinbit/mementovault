<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_snippet')]
#[Description('Returns the content of a specific snippet by slug.')]
#[IsReadOnly]
class GetSnippetTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $slug = $request->get('slug');

        $snippet = $collection->snippets()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (! $snippet) {
            return Response::error("Snippet with slug '{$slug}' not found in this collection.");
        }

        return Response::text($snippet->content);
    }

    /**
     * @return array<string, JsonSchema>
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'slug' => $schema->string()->description('The slug of the snippet to retrieve.')->required(),
        ];
    }
}
