<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\AssetsTool;
use App\Mcp\Tools\CollectionDocumentsTool;
use App\Mcp\Tools\DocumentsTool;
use App\Mcp\Tools\GetContextTool;
use App\Mcp\Tools\MemoryTool;
use App\Mcp\Tools\SearchTool;
use App\Mcp\Tools\SkillsTool;
use App\Mcp\Tools\SnippetsTool;
use App\Mcp\Tools\SystemDocumentsTool;
use App\Models\Workspace;
use Laravel\Mcp\Server;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Version;
use Laravel\Mcp\Server\Tool;

#[Name('Memento Vault')]
#[Version('2.1.0')]
#[Description('AI Context Manager — serves identity, instructions, documents, skills, snippets, and assets via MCP.')]
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
        SystemDocumentsTool::class,
        MemoryTool::class,
    ];

    protected function boot(): void
    {
        $workspace = current_workspace();

        $this->instructions = $this->buildInstructions($workspace);
    }

    private function buildInstructions(?Workspace $workspace): string
    {
        $base = <<<'GUIDE'
# Memento Vault — AI Context Manager

## What you already have
When context loads, you receive: the user's **identity**, **instructions**, and an **inventory** of the active neuron (collection) — document slugs, content counts. Read this before calling any tool.

## How to work efficiently
- **Find content → use `search`** (covers documents, skills, snippets, assets, and neuron documents in one call). Don't list-then-get sequentially.
- **Read a specific item → use the right tool with `get` action and the slug** (visible in your loaded context or search results).
- **Don't call `get_context` again** if you already have context loaded — it's already in your conversation.

## Tool reference (all use `action` param)
- `get_context` — Load context. Pass `collection: "slug"` to switch neuron. No action param.
- `collection_documents` — Neuron-level docs (Instructions, Architecture, etc.). Always in context. Actions: list, get, create, update, append, delete, reorder, list_templates
- `documents` — Workspace reference docs assigned to this neuron. Actions: list, get, create, update, append, delete
- `skills` — Operational instructions with triggers. Actions: list, get, create, update, append, delete
- `snippets` — Reusable text blocks. Actions: list, get, create, update, append, delete
- `assets` — Files and media. Actions: list, get_url, list_folders, create_folder, move, delete
- `search` — Full-text search across ALL content types in one call. No action param, just `query`.
- `system_documents` — Workspace-level docs (identity, instructions, soul, etc.). Actions: list, get, update, append
- `memory` — Short notes AI should remember. Actions: list, get, create, update, delete, move, copy. Supports `scope` (workspace/collection) and cross-neuron operations via `target_collection`.

## Writing long content
Max ~1500 chars per call. Use `create` first, then `append` with the slug for additional chunks. One document per turn.

## Cross-neuron operations
To create content in a different neuron without switching: pass `target_collection: "slug"` on `create` (documents, skills, snippets, memory). Requires a nucleus (workspace) token. For memory, `move` and `copy` also support `target_collection`.

## Key distinctions
- **collection_documents** = neuron-level system docs, always loaded in context (Instructions, Architecture, Memory...)
- **documents** = workspace-level reference docs, fetched on demand (specs, guides, notes...)
- **system_documents** = workspace-level identity docs (identity, instructions, soul...) — shared across all neurons
GUIDE;

        $customPrompt = $workspace?->settings['mcp_custom_prompt'] ?? null;
        if ($customPrompt) {
            $base .= "\n".$customPrompt;
        }

        return $base;
    }
}
