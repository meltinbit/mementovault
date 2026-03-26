<?php

namespace App\Mcp\Tools;

use App\Models\CollectionMemoryEntry;
use App\Models\MemoryEntry;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('append_memory')]
#[Description('Save a new memory entry. Use this when you learn something important about the user\'s preferences, decisions, or patterns that should be remembered for future conversations. Keep entries concise — 1-2 sentences.')]
class AppendMemoryTool extends Tool
{
    public function handle(Request $request): Response
    {
        $workspace = app('current_workspace');
        $content = $request->get('content');
        $category = $request->get('category');
        $scope = $request->get('scope', 'workspace');

        if ($scope === 'collection') {
            $collection = app('mcp_collection');

            $entry = CollectionMemoryEntry::create([
                'collection_id' => $collection->id,
                'content' => $content,
                'category' => $category,
            ]);

            return Response::text("Memory entry saved to collection (id: {$entry->id}).");
        }

        $entry = MemoryEntry::create([
            'workspace_id' => $workspace->id,
            'content' => $content,
            'category' => $category,
        ]);

        return Response::text("Memory entry saved (id: {$entry->id}).");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'content' => $schema->string()->description('The memory to save. Keep it concise — 1-2 sentences.')->required(),
            'category' => $schema->string()->description('Optional category label (e.g. preference, decision, workflow, technical).'),
            'scope' => $schema->string()->description('Scope: "workspace" (default) for general memory, "collection" for project-specific memory.'),
        ];
    }
}
