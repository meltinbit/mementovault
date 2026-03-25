<?php

namespace App\Mcp\Tools;

use App\Models\SystemDocument;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('append_memory')]
#[Description('Appends content to the workspace memory document. Useful for saving decisions, preferences, and important context that should persist across conversations.')]
class AppendMemoryTool extends Tool
{
    public function handle(Request $request): Response
    {
        $workspace = app('current_workspace');
        $content = $request->get('content');

        $memory = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'memory')
            ->first();

        if (! $memory) {
            return Response::error('Memory document not found.');
        }

        $newContent = $memory->content
            ? $memory->content."\n\n".$content
            : $content;

        $memory->update(['content' => $newContent]);

        return Response::text("Appended to memory (now v{$memory->version}).");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'content' => $schema->string()->description('The content to append to memory. Will be added after existing memory content with a blank line separator.')->required(),
        ];
    }
}
