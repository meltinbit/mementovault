<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\AppendMemoryTool;
use App\Mcp\Tools\CreateAssetFolderTool;
use App\Mcp\Tools\CreateCollectionDocumentTool;
use App\Mcp\Tools\CreateDocumentTool;
use App\Mcp\Tools\CreateSkillTool;
use App\Mcp\Tools\CreateSnippetTool;
use App\Mcp\Tools\DeleteCollectionDocumentTool;
use App\Mcp\Tools\GetAssetUrlTool;
use App\Mcp\Tools\GetCollectionDocumentTool;
use App\Mcp\Tools\GetContextTool;
use App\Mcp\Tools\GetDocumentTool;
use App\Mcp\Tools\GetSkillTool;
use App\Mcp\Tools\GetSnippetTool;
use App\Mcp\Tools\ListAssetFoldersTool;
use App\Mcp\Tools\ListAssetsTool;
use App\Mcp\Tools\ListCollectionDocumentsTool;
use App\Mcp\Tools\ListCollectionDocumentTemplatesTool;
use App\Mcp\Tools\ListDocumentsTool;
use App\Mcp\Tools\ListSkillsTool;
use App\Mcp\Tools\ListSnippetsTool;
use App\Mcp\Tools\MoveAssetsTool;
use App\Mcp\Tools\ReorderCollectionDocumentsTool;
use App\Mcp\Tools\SearchTool;
use App\Mcp\Tools\UpdateCollectionDocumentTool;
use App\Mcp\Tools\UpdateDocumentTool;
use App\Mcp\Tools\UpdateSkillTool;
use App\Mcp\Tools\UpdateSnippetTool;
use App\Mcp\Tools\UpdateSystemDocumentTool;
use App\Models\Workspace;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;
use Laravel\Mcp\Server\Tool;

#[Name('Context Vault')]
#[Version('1.0.0')]
#[Description('AI Context Manager — serves identity, instructions, context, memory, documents, skills, snippets, and assets via MCP.')]
class ContextVaultServer extends Server
{
    /** @var array<int, class-string<Tool>> */
    protected array $tools = [
        GetContextTool::class,
        ListDocumentsTool::class,
        GetDocumentTool::class,
        ListSkillsTool::class,
        GetSkillTool::class,
        ListSnippetsTool::class,
        GetSnippetTool::class,
        ListAssetsTool::class,
        GetAssetUrlTool::class,
        ListAssetFoldersTool::class,
        CreateAssetFolderTool::class,
        MoveAssetsTool::class,
        SearchTool::class,
        UpdateSystemDocumentTool::class,
        AppendMemoryTool::class,
        CreateDocumentTool::class,
        UpdateDocumentTool::class,
        CreateSkillTool::class,
        UpdateSkillTool::class,
        CreateSnippetTool::class,
        UpdateSnippetTool::class,
        ListCollectionDocumentsTool::class,
        GetCollectionDocumentTool::class,
        CreateCollectionDocumentTool::class,
        UpdateCollectionDocumentTool::class,
        DeleteCollectionDocumentTool::class,
        ReorderCollectionDocumentsTool::class,
        ListCollectionDocumentTemplatesTool::class,
    ];

    protected function boot(): void
    {
        $workspace = current_workspace();

        $this->instructions = $this->buildInstructions($workspace);
    }

    private function buildInstructions(?Workspace $workspace): string
    {
        $base = $this->serverGuidelines();

        // Workspace-level MCP instructions from settings.
        $workspaceInstructions = $workspace?->settings['mcp_instructions'] ?? '';
        if ($workspaceInstructions) {
            $base .= "\n\n--- Workspace Instructions ---\n\n".$workspaceInstructions;
        }

        $customPrompt = $workspace?->settings['mcp_custom_prompt'] ?? null;
        if ($customPrompt) {
            $base .= "\n\n--- Additional Instructions ---\n\n".$customPrompt;
        }

        return $base;
    }

    private function serverGuidelines(): string
    {
        return <<<'GUIDELINES'
# MementoVault MCP — Operating Guidelines

## Startup
1. Call `get_context` FIRST, before any response. It returns your identity, instructions, collection documents, memory, and available content. Absorb silently — never announce it.

## Tool Selection — Critical Distinction

There are TWO levels of documents. Using the wrong tool will fail.

### Collection Documents (use these tools)
Documents that belong to the current collection: Instructions, Memory, Architecture, Brand Voice, etc.
- `list_collection_documents` — see all docs with their slugs
- `get_collection_document` — read one by slug
- `create_collection_document` — create new (optionally from a template)
- `update_collection_document` — update by slug
- `delete_collection_document` — delete by slug (required docs are protected)
- `reorder_collection_documents` — change display/context order

### Workspace System Documents (different tools)
Global workspace-level docs like Identity, Instructions, Soul, Services — shared across all collections.
- `update_system_document` — update by type (e.g., "identity", "instructions")

### Rule: if in doubt, call `list_collection_documents` first to see what belongs to this collection.

## Writing Long Content
When updating a document with long content, keep each update under 4000 characters. If you need to write more:
1. Write the first part with `update_collection_document`
2. Read it back with `get_collection_document`
3. Append the rest in a follow-up update with the full combined content

Never try to send extremely long content in a single tool call — it may get truncated.

## Memory
- `append_memory` — save a short memory entry (facts, preferences, context). Use this for quick notes.
- For structured/long memory, update the collection's Memory document via `update_collection_document` with slug "memory".

## Content Items (workspace-level, assigned to collections)
- Documents: `list_documents`, `get_document`, `create_document`, `update_document`
- Skills: `list_skills`, `get_skill`, `create_skill`, `update_skill`
- Snippets: `list_snippets`, `get_snippet`, `create_snippet`, `update_snippet`
- Assets: `list_assets`, `get_asset_url`, `list_asset_folders`, `create_asset_folder`, `move_assets`

## Templates
Call `list_collection_document_templates` to see available document templates before creating new collection documents.
GUIDELINES;
    }
}
