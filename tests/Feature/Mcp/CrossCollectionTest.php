<?php

use App\Mcp\Servers\ContextVaultServer;
use App\Mcp\Tools\DocumentsTool;
use App\Mcp\Tools\MemoryTool;
use App\Mcp\Tools\SkillsTool;
use App\Mcp\Tools\SnippetsTool;
use App\Models\ApiToken;
use App\Models\Collection;
use App\Models\CollectionMemoryEntry;
use App\Models\MemoryEntry;
use App\Models\SystemDocument;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function setupCrossCollectionTest(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    foreach (['identity', 'instructions'] as $type) {
        SystemDocument::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'type' => $type,
            'content' => "Test {$type}",
        ]);
    }

    $sourceCollection = Collection::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Source Project',
    ]);

    $targetCollection = Collection::factory()->create([
        'workspace_id' => $workspace->id,
        'name' => 'Target Project',
    ]);

    $workspaceToken = ApiToken::create([
        'workspace_id' => $workspace->id,
        'name' => 'ws-token',
        'token_hash' => hash('sha256', 'test-ws-token'),
    ]);

    $collectionToken = ApiToken::create([
        'collection_id' => $sourceCollection->id,
        'name' => 'col-token',
        'token_hash' => hash('sha256', 'test-col-token'),
    ]);

    app()->instance('current_workspace', $workspace);
    app()->instance('mcp_collection', $sourceCollection);

    return [$workspace, $sourceCollection, $targetCollection, $workspaceToken, $collectionToken];
}

// --- Memory: create with target_collection ---

test('memory create with target_collection works with workspace token', function () {
    [$workspace, $source, $target, $wsToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $wsToken);

    $response = ContextVaultServer::tool(MemoryTool::class, [
        'action' => 'create',
        'target_collection' => $target->slug,
        'content' => 'Cross-collection note',
        'category' => 'test',
    ]);

    $response->assertOk()->assertSee('Target Project');

    expect(CollectionMemoryEntry::where('collection_id', $target->id)->count())->toBe(1);
});

test('memory create with target_collection is denied with collection token', function () {
    [,,,, $colToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $colToken);

    $response = ContextVaultServer::tool(MemoryTool::class, [
        'action' => 'create',
        'target_collection' => 'target-project',
        'content' => 'Should not work',
    ]);

    $response->assertHasErrors();
});

// --- Memory: move ---

test('memory move works with workspace token', function () {
    [$workspace, $source, $target, $wsToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $wsToken);

    $entry = CollectionMemoryEntry::create([
        'collection_id' => $source->id,
        'content' => 'Entry to move',
        'category' => 'test',
    ]);

    $response = ContextVaultServer::tool(MemoryTool::class, [
        'action' => 'move',
        'id' => $entry->id,
        'scope' => 'collection',
        'target_collection' => $target->slug,
    ]);

    $response->assertOk()->assertSee('Moved');

    $entry->refresh();
    expect($entry->is_archived)->toBeTrue();
    expect(CollectionMemoryEntry::where('collection_id', $target->id)->active()->count())->toBe(1);
});

test('memory move is denied with collection token', function () {
    [, $source,,, $colToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $colToken);

    $entry = CollectionMemoryEntry::create([
        'collection_id' => $source->id,
        'content' => 'Entry to move',
    ]);

    $response = ContextVaultServer::tool(MemoryTool::class, [
        'action' => 'move',
        'id' => $entry->id,
        'scope' => 'collection',
        'target_collection' => 'target-project',
    ]);

    $response->assertHasErrors();
});

// --- Memory: copy ---

test('memory copy works with workspace token', function () {
    [$workspace, $source, $target, $wsToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $wsToken);

    $entry = CollectionMemoryEntry::create([
        'collection_id' => $source->id,
        'content' => 'Entry to copy',
        'category' => 'test',
    ]);

    $response = ContextVaultServer::tool(MemoryTool::class, [
        'action' => 'copy',
        'id' => $entry->id,
        'scope' => 'collection',
        'target_collection' => $target->slug,
    ]);

    $response->assertOk()->assertSee('Copied');

    $entry->refresh();
    expect($entry->is_archived)->toBeFalse();
    expect(CollectionMemoryEntry::where('collection_id', $target->id)->active()->count())->toBe(1);
    expect(CollectionMemoryEntry::where('collection_id', $source->id)->active()->count())->toBe(1);
});

test('memory copy is denied with collection token', function () {
    [, $source,,, $colToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $colToken);

    $entry = CollectionMemoryEntry::create([
        'collection_id' => $source->id,
        'content' => 'Entry to copy',
    ]);

    $response = ContextVaultServer::tool(MemoryTool::class, [
        'action' => 'copy',
        'id' => $entry->id,
        'scope' => 'collection',
        'target_collection' => 'target-project',
    ]);

    $response->assertHasErrors();
});

// --- Memory: move to workspace scope ---

test('memory move to workspace scope works with workspace token', function () {
    [$workspace, $source, $target, $wsToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $wsToken);

    $entry = CollectionMemoryEntry::create([
        'collection_id' => $source->id,
        'content' => 'Entry to promote',
    ]);

    $response = ContextVaultServer::tool(MemoryTool::class, [
        'action' => 'move',
        'id' => $entry->id,
        'scope' => 'collection',
        'target_scope' => 'workspace',
    ]);

    $response->assertOk()->assertSee('Moved');

    $entry->refresh();
    expect($entry->is_archived)->toBeTrue();
    expect(MemoryEntry::where('workspace_id', $workspace->id)->count())->toBe(1);
});

// --- Documents: create with target_collection ---

test('documents create with target_collection works with workspace token', function () {
    [$workspace, $source, $target, $wsToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $wsToken);

    $response = ContextVaultServer::tool(DocumentsTool::class, [
        'action' => 'create',
        'target_collection' => $target->slug,
        'title' => 'Cross-collection doc',
        'content' => 'Some content',
    ]);

    $response->assertOk()->assertSee('Target Project');
    expect($target->documents()->count())->toBe(1);
});

test('documents create with target_collection is denied with collection token', function () {
    [,,,, $colToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $colToken);

    $response = ContextVaultServer::tool(DocumentsTool::class, [
        'action' => 'create',
        'target_collection' => 'target-project',
        'title' => 'Should not work',
        'content' => 'Nope',
    ]);

    $response->assertHasErrors();
});

// --- Skills: create with target_collection ---

test('skills create with target_collection works with workspace token', function () {
    [$workspace, $source, $target, $wsToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $wsToken);

    $response = ContextVaultServer::tool(SkillsTool::class, [
        'action' => 'create',
        'target_collection' => $target->slug,
        'name' => 'Cross-collection skill',
        'description' => 'A skill',
        'content' => 'Skill content',
    ]);

    $response->assertOk()->assertSee('Target Project');
    expect($target->skills()->count())->toBe(1);
});

test('skills create with target_collection is denied with collection token', function () {
    [,,,, $colToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $colToken);

    $response = ContextVaultServer::tool(SkillsTool::class, [
        'action' => 'create',
        'target_collection' => 'target-project',
        'name' => 'Should not work',
        'description' => 'Nope',
        'content' => 'Nope',
    ]);

    $response->assertHasErrors();
});

// --- Snippets: create with target_collection ---

test('snippets create with target_collection works with workspace token', function () {
    [$workspace, $source, $target, $wsToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $wsToken);

    $response = ContextVaultServer::tool(SnippetsTool::class, [
        'action' => 'create',
        'target_collection' => $target->slug,
        'name' => 'Cross-collection snippet',
        'content' => 'Snippet content',
    ]);

    $response->assertOk()->assertSee('Target Project');
    expect($target->snippets()->count())->toBe(1);
});

test('snippets create with target_collection is denied with collection token', function () {
    [,,,, $colToken] = setupCrossCollectionTest();
    app()->instance('mcp_token', $colToken);

    $response = ContextVaultServer::tool(SnippetsTool::class, [
        'action' => 'create',
        'target_collection' => 'target-project',
        'name' => 'Should not work',
        'content' => 'Nope',
    ]);

    $response->assertHasErrors();
});
