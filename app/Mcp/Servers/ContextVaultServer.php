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
        $base = <<<'GUIDE'
Call get_context first. If no collection is active, it lists available ones — pass a slug to select. Tools use action param. Write max 1500 chars per call, use append for more. One document per turn.
GUIDE;

        $customPrompt = $workspace?->settings['mcp_custom_prompt'] ?? null;
        if ($customPrompt) {
            $base .= "\n".$customPrompt;
        }

        return $base;
    }
}
