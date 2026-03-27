<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\AppendMemoryTool;
use App\Mcp\Tools\AssetsTool;
use App\Mcp\Tools\CollectionDocumentsTool;
use App\Mcp\Tools\DocumentsTool;
use App\Mcp\Tools\GetContextTool;
use App\Mcp\Tools\SearchTool;
use App\Mcp\Tools\SkillsTool;
use App\Mcp\Tools\SnippetsTool;
use App\Mcp\Tools\UpdateSystemDocumentTool;
use App\Models\Workspace;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;
use Laravel\Mcp\Server\Tool;

#[Name('Context Vault')]
#[Version('2.0.0')]
#[Description('AI Context Manager — serves identity, instructions, context, memory, documents, skills, snippets, and assets via MCP.')]
class ContextVaultServer extends Server
{
    /** @var array<int, class-string<Tool>> */
    protected array $tools = [
        GetContextTool::class,
        CollectionDocumentsTool::class,
        DocumentsTool::class,
        SkillsTool::class,
        SnippetsTool::class,
        AssetsTool::class,
        SearchTool::class,
        UpdateSystemDocumentTool::class,
        AppendMemoryTool::class,
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
1. Call `get_context` FIRST, before any response. Absorb silently — never announce it.

## Tools Overview
Each tool uses an `action` parameter to select the operation.

### `collection_documents` — Collection-level documents (Instructions, Memory, Architecture, etc.)
Always included in MCP context. Actions: list, get, create, update, delete, reorder, list_templates.
- To update a doc: `{action: "update", slug: "instructions", content: "..."}`
- To create from template: `{action: "create", template: "brand-voice"}`

### `documents` — Workspace documents assigned to this collection
Actions: list, get, create, update.

### `skills` — Reusable skill instructions
Actions: list, get, create, update.

### `snippets` — Reusable text snippets
Actions: list, get, create, update.

### `assets` — Files, images, and folders
Actions: list, get_url, list_folders, create_folder, move.

### `update_system_document` — Workspace-level system docs (Identity, Soul, Services, etc.)
NOT for collection documents. Only for workspace-wide settings.

### `search` — Full-text search across all content types

### `append_memory` — Save short memory entries
For structured/long memory, use `collection_documents` with `{action: "update", slug: "memory"}`.

## Writing Long Content
Keep each update under 4000 characters. For longer content, split into multiple updates.
GUIDELINES;
    }
}
