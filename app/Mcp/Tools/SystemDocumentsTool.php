<?php

namespace App\Mcp\Tools;

use App\Models\SystemDocument;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;

#[Name('system_documents')]
#[Description('Manage workspace-level system documents (identity, instructions, soul, services, portfolio, products, icp). Actions: list, get, update, append. NOT for collection documents — use collection_documents for those.')]
class SystemDocumentsTool extends Tool
{
    public function handle(Request $request): Response
    {
        return match ($request->get('action')) {
            'list' => $this->list(),
            'get' => $this->get($request),
            'update' => $this->update($request),
            'append' => $this->append($request),
            default => Response::error("Unknown action '{$request->get('action')}'. Use: list, get, update, append."),
        };
    }

    private function list(): Response
    {
        $workspace = app('current_workspace');

        $docs = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->get(['type', 'updated_at']);

        if ($docs->isEmpty()) {
            return Response::text('No system documents found.');
        }

        $list = $docs->map(function ($d) {
            $hasContent = ! empty($d->content);

            return '- **'.ucfirst($d->type).'** — '.($hasContent ? 'has content' : 'empty');
        })->join("\n");

        return Response::text($list);
    }

    private function get(Request $request): Response
    {
        $workspace = app('current_workspace');
        $type = $request->get('type');

        $document = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', $type)
            ->first();

        if (! $document) {
            return Response::error("System document '{$type}' not found.");
        }

        return Response::text('# '.ucfirst($document->type)."\n\n".($document->content ?: '_(empty)_'));
    }

    private function update(Request $request): Response
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

    private function append(Request $request): Response
    {
        $workspace = app('current_workspace');
        $type = $request->get('type');

        $document = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', $type)
            ->first();

        if (! $document) {
            return Response::error("System document '{$type}' not found.");
        }

        $document->update(['content' => $document->content.$request->get('content')]);

        $length = mb_strlen($document->content);

        return Response::text("Appended to {$type} (now v{$document->version}, {$length} chars total).");
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'action' => $schema->string()->enum(['list', 'get', 'update', 'append'])->description('The action to perform.')->required(),
            'type' => $schema->string()->description('System document type (e.g. identity, instructions, soul, services, portfolio, products, icp). Required for get/update/append.'),
            'content' => $schema->string()->description('Markdown content. Required for update, appended for append.'),
        ];
    }
}
