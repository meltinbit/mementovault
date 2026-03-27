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
        // MCP instructions are stored in the workspace settings.
        // Only sent for MCP protocol versions 2025-06-18+.
        $base = $workspace?->settings['mcp_instructions'] ?? '';

        $customPrompt = $workspace?->settings['mcp_custom_prompt'] ?? null;

        if ($customPrompt) {
            $base .= "\n\n--- Additional Instructions ---\n\n".$customPrompt;
        }

        return $base;
    }
}
