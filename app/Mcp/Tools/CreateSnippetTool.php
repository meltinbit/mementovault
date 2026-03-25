<?php

namespace App\Mcp\Tools;

use App\Models\Snippet;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('create_snippet')]
#[Description('Creates a new reusable text snippet in the workspace and adds it to the current collection.')]
class CreateSnippetTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = app('mcp_collection');
        $workspace = app('current_workspace');

        $snippet = Snippet::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'name' => $request->get('name'),
            'content' => $request->get('content'),
            'is_active' => true,
        ]);

        $collection->snippets()->syncWithoutDetaching([$snippet->id]);

        return Response::text("Created snippet \"{$snippet->name}\" (slug: `{$snippet->slug}`). Added to collection \"{$collection->name}\".");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'name' => $schema->string()->description('The snippet name.')->required(),
            'content' => $schema->string()->description('The raw text content of the snippet.')->required(),
        ];
    }
}
