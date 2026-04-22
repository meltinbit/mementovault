<?php

namespace App\Mcp\Tools;

use App\Models\SystemDocument;
use App\Services\MemoryContextBuilder;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Tool;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('export_claude_md')]
#[Description('Export the current neuron\'s context as CLAUDE.md content, ready to save in a project repo. Includes identity, instructions, all neuron documents, and an inventory of available content.')]
#[IsReadOnly]
class ExportClaudeMdTool extends Tool
{
    public function handle(Request $request): Response
    {
        $collection = mcp_collection();

        if (! $collection) {
            return Response::text('No collection active. Call get_context(collection: "slug") to select one.');
        }

        $workspace = $collection->workspace;
        $includeMemory = (bool) ($request->get('include_memory') ?? false);
        $includeSkillsContent = (bool) ($request->get('include_skills_content') ?? false);

        $sections = [];

        // Header
        $date = now()->format('Y-m-d');
        $sections[] = "# {$collection->name} — AI Context\n\n> Generated from Memento Vault on {$date}. Do not edit manually.\n> Regenerate with: `export_claude_md` via MCP.";

        // Identity
        $identity = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'identity')
            ->where('content', '!=', '')
            ->first();

        if ($identity) {
            $sections[] = "## Identity\n\n{$identity->content}";
        }

        // Instructions
        $instructions = SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'instructions')
            ->where('content', '!=', '')
            ->first();

        if ($instructions) {
            $sections[] = "## Instructions\n\n{$instructions->content}";
        }

        // Collection documents (full content)
        $collectionDocs = $collection->collectionDocuments()
            ->orderBy('sort_order')
            ->get();

        foreach ($collectionDocs as $doc) {
            if (! empty(trim($doc->content))) {
                $sections[] = "## {$doc->name}\n\n{$doc->content}";
            }
        }

        // Skills
        $skills = $collection->skills()->where('is_active', true)->get();
        if ($skills->isNotEmpty()) {
            $skillLines = $skills->map(function ($skill) use ($includeSkillsContent) {
                $line = "### {$skill->name}\n\n";
                if ($skill->description) {
                    $line .= "{$skill->description}\n\n";
                }
                if ($includeSkillsContent && ! empty($skill->content)) {
                    $line .= "{$skill->content}";
                }

                return $line;
            })->join("\n\n");

            $sections[] = "## Skills\n\n{$skillLines}";
        }

        // Documents (workspace-level, assigned to this collection)
        $docs = $collection->documents()->where('is_active', true)->get();
        if ($docs->isNotEmpty()) {
            $docLines = $docs->map(function ($doc) {
                $preview = mb_substr(strip_tags($doc->content), 0, 100);

                return "- **{$doc->title}** ({$doc->type}) — {$preview}…";
            })->join("\n");

            $sections[] = "## Available Documents\n\n{$docLines}";
        }

        // Assets
        $assets = $collection->assets()->where('is_active', true)->get();
        if ($assets->isNotEmpty()) {
            $assetLines = $assets->map(function ($asset) {
                $desc = $asset->description ? " — {$asset->description}" : '';

                return "- **{$asset->name}**{$desc}";
            })->join("\n");

            $sections[] = "## Available Assets\n\n{$assetLines}";
        }

        // Memory (optional)
        if ($includeMemory) {
            $builder = app(MemoryContextBuilder::class);
            $memoryContent = $builder->build($workspace, $collection);

            if (! empty(trim($memoryContent))) {
                $sections[] = "## Memory\n\n{$memoryContent}";
            }
        }

        return Response::text(implode("\n\n---\n\n", $sections));
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'include_memory' => $schema->boolean()->description('Include memory entries in export. Default false — memory changes frequently.'),
            'include_skills_content' => $schema->boolean()->description('Include full skill content, not just names/descriptions. Default false.'),
        ];
    }
}
