<?php

namespace App\Mcp\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('update_snippet')]
#[Description('Updates an existing snippet by slug.')]
class UpdateSnippetTool extends Tool
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

        $fields = [];
        if ($request->get('name')) {
            $fields['name'] = $request->get('name');
        }
        if ($request->get('content') !== null) {
            $fields['content'] = $request->get('content');
        }

        $snippet->update($fields);

        return Response::text("Updated snippet \"{$snippet->name}\".");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'slug' => $schema->string()->description('The slug of the snippet to update.')->required(),
            'name' => $schema->string()->description('New name (optional).'),
            'content' => $schema->string()->description('New text content (optional).'),
        ];
    }
}
