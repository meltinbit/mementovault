<?php

namespace App\Mcp\Tools;

use App\Models\SystemDocument;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('update_system_document')]
#[Description('Updates a workspace system document (e.g., identity, instructions, context, memory, soul, services, portfolio, products, icp, or any custom type). The HasRevisions trait automatically creates a version history entry.')]
class UpdateSystemDocumentTool extends Tool
{
    public function handle(Request $request): Response
    {
        $workspace = app('current_workspace');
        $type = $request->get('type');
        $content = $request->get('content');

        $document = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', $type)
            ->first();

        if (! $document) {
            return Response::error("System document '{$type}' not found.");
        }

        $document->update(['content' => $content]);

        return Response::text("Updated {$type} (now v{$document->version}).");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'type' => $schema->string()->description('The system document type to update (e.g., identity, instructions, context, memory, soul, services, portfolio, products, icp, or any custom type).')->required(),
            'content' => $schema->string()->description('The new markdown content.')->required(),
        ];
    }
}
