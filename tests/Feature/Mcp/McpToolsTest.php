<?php

use App\Mcp\Servers\ContextVaultServer;
use App\Mcp\Tools\GetContextTool;
use App\Mcp\Tools\GetDocumentTool;
use App\Mcp\Tools\GetSkillTool;
use App\Mcp\Tools\GetSnippetTool;
use App\Mcp\Tools\ListAssetsTool;
use App\Mcp\Tools\ListDocumentsTool;
use App\Mcp\Tools\ListSkillsTool;
use App\Mcp\Tools\ListSnippetsTool;
use App\Mcp\Tools\SearchTool;
use App\Models\Asset;
use App\Models\Collection;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use App\Models\SystemDocument;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function setupMcpToolTest(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    foreach (['identity', 'instructions', 'context'] as $type) {
        SystemDocument::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'type' => $type,
            'content' => "Test {$type}",
        ]);
    }

    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    app()->instance('current_workspace', $workspace);
    app()->instance('mcp_collection', $collection);

    return [$workspace, $collection];
}

test('get_context returns merged context', function () {
    setupMcpToolTest();

    $response = ContextVaultServer::tool(GetContextTool::class);

    $response->assertOk()->assertSee('IDENTITY');
});

test('list_documents returns collection documents', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $doc = Document::factory()->create(['workspace_id' => $workspace->id, 'title' => 'My Doc']);
    $collection->documents()->attach($doc->id);

    $response = ContextVaultServer::tool(ListDocumentsTool::class);

    $response->assertOk()->assertSee('My Doc');
});

test('list_documents returns empty message when no documents', function () {
    setupMcpToolTest();

    $response = ContextVaultServer::tool(ListDocumentsTool::class);

    $response->assertOk()->assertSee('No documents in this collection.');
});

test('get_document returns document content by slug', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $doc = Document::factory()->create([
        'workspace_id' => $workspace->id,
        'title' => 'Test Document',
        'slug' => 'test-document',
        'content' => 'Full document content here',
    ]);
    $collection->documents()->attach($doc->id);

    $response = ContextVaultServer::tool(GetDocumentTool::class, ['slug' => 'test-document']);

    $response->assertOk()->assertSee('Full document content here');
});

test('get_document returns error for missing slug', function () {
    setupMcpToolTest();

    $response = ContextVaultServer::tool(GetDocumentTool::class, ['slug' => 'nonexistent']);

    $response->assertHasErrors();
});

test('list_skills returns collection skills', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $skill = Skill::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Code Review']);
    $collection->skills()->attach($skill->id);

    $response = ContextVaultServer::tool(ListSkillsTool::class);

    $response->assertOk()->assertSee('Code Review');
});

test('get_skill returns skill content by slug', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $skill = Skill::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Skill',
        'slug' => 'test-skill',
        'content' => 'Skill instructions content',
    ]);
    $collection->skills()->attach($skill->id);

    $response = ContextVaultServer::tool(GetSkillTool::class, ['slug' => 'test-skill']);

    $response->assertOk()->assertSee('Skill instructions content');
});

test('get_skill returns error for missing slug', function () {
    setupMcpToolTest();

    $response = ContextVaultServer::tool(GetSkillTool::class, ['slug' => 'nonexistent']);

    $response->assertHasErrors();
});

test('list_snippets returns collection snippets', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $snippet = Snippet::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Email Sig']);
    $collection->snippets()->attach($snippet->id);

    $response = ContextVaultServer::tool(ListSnippetsTool::class);

    $response->assertOk()->assertSee('Email Sig');
});

test('get_snippet returns snippet content by slug', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $snippet = Snippet::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Test Snippet',
        'slug' => 'test-snippet',
        'content' => 'Snippet text content',
    ]);
    $collection->snippets()->attach($snippet->id);

    $response = ContextVaultServer::tool(GetSnippetTool::class, ['slug' => 'test-snippet']);

    $response->assertOk()->assertSee('Snippet text content');
});

test('get_snippet returns error for missing slug', function () {
    setupMcpToolTest();

    $response = ContextVaultServer::tool(GetSnippetTool::class, ['slug' => 'nonexistent']);

    $response->assertHasErrors();
});

test('list_assets returns collection assets', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $asset = Asset::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Logo']);
    $collection->assets()->attach($asset->id);

    $response = ContextVaultServer::tool(ListAssetsTool::class);

    $response->assertOk()->assertSee('Logo');
});

test('search returns matching documents', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $doc = Document::factory()->create([
        'workspace_id' => $workspace->id,
        'title' => 'Laravel Guide',
        'content' => 'This guide covers Laravel routing and controllers',
    ]);
    $collection->documents()->attach($doc->id);

    $response = ContextVaultServer::tool(SearchTool::class, ['query' => 'Laravel']);

    $response->assertOk()->assertSee('Laravel Guide');
});

test('search returns matching skills', function () {
    [$workspace, $collection] = setupMcpToolTest();

    $skill = Skill::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Debugging Tips',
        'content' => 'Advanced debugging techniques',
    ]);
    $collection->skills()->attach($skill->id);

    $response = ContextVaultServer::tool(SearchTool::class, ['query' => 'debugging']);

    $response->assertOk()->assertSee('Debugging Tips');
});

test('search returns no results message when nothing matches', function () {
    setupMcpToolTest();

    $response = ContextVaultServer::tool(SearchTool::class, ['query' => 'nonexistent-term-xyz']);

    $response->assertOk()->assertSee('No results found');
});
