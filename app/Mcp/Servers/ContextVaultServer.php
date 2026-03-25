<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\GetAssetUrlTool;
use App\Mcp\Tools\GetContextTool;
use App\Mcp\Tools\GetDocumentTool;
use App\Mcp\Tools\GetSkillTool;
use App\Mcp\Tools\GetSnippetTool;
use App\Mcp\Tools\ListAssetsTool;
use App\Mcp\Tools\ListDocumentsTool;
use App\Mcp\Tools\ListSkillsTool;
use App\Mcp\Tools\ListSnippetsTool;
use App\Mcp\Tools\SearchTool;
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
        SearchTool::class,
    ];
}
