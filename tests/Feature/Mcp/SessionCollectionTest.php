<?php

use App\Models\ApiToken;
use App\Models\Collection;
use App\Models\CollectionDocument;
use App\Models\SystemDocument;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function setupSessionCollectionTest(): array
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

    $alpha = Collection::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Alpha']);
    $beta = Collection::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Beta']);

    foreach ([$alpha, $beta] as $collection) {
        CollectionDocument::create([
            'collection_id' => $collection->id,
            'name' => "{$collection->name} Notes",
            'slug' => 'notes',
            'content' => "Notes of {$collection->name}",
        ]);
    }

    ApiToken::create([
        'workspace_id' => $workspace->id,
        'name' => 'ws-token',
        'token_hash' => hash('sha256', 'test-ws-token'),
    ]);

    return [$alpha, $beta];
}

function mcpCall($test, string $tool, array $arguments = [], ?string $session = null, string $token = 'test-ws-token')
{
    $headers = ['Authorization' => "Bearer {$token}"];
    if ($session) {
        $headers['MCP-Session-Id'] = $session;
    }

    return $test->postJson('/mcp', [
        'jsonrpc' => '2.0',
        'id' => 1,
        'method' => 'tools/call',
        'params' => ['name' => $tool, 'arguments' => $arguments],
    ], $headers);
}

function mcpText($response): string
{
    return collect($response->json('result.content'))->pluck('text')->join("\n");
}

test('each session keeps its own active collection', function () {
    [$alpha, $beta] = setupSessionCollectionTest();

    mcpCall($this, 'get_context', ['collection' => $alpha->slug], 'session-a');
    mcpCall($this, 'get_context', ['collection' => $beta->slug], 'session-b');

    expect(mcpText(mcpCall($this, 'collection_documents', ['action' => 'get', 'slug' => 'notes'], 'session-a')))
        ->toContain('Notes of Alpha');
    expect(mcpText(mcpCall($this, 'collection_documents', ['action' => 'get', 'slug' => 'notes'], 'session-b')))
        ->toContain('Notes of Beta');
});

test('a session that never switched is pinned to the collection active when it started', function () {
    [$alpha, $beta] = setupSessionCollectionTest();

    mcpCall($this, 'get_context', ['collection' => $alpha->slug], 'session-a');
    // session-c starts while Alpha is the token default
    mcpCall($this, 'collection_documents', ['action' => 'list'], 'session-c');
    // another session switches to Beta
    mcpCall($this, 'get_context', ['collection' => $beta->slug], 'session-b');

    expect(mcpText(mcpCall($this, 'collection_documents', ['action' => 'get', 'slug' => 'notes'], 'session-c')))
        ->toContain('Notes of Alpha');
});

test('without a session id the token-wide active collection is used', function () {
    [$alpha, $beta] = setupSessionCollectionTest();

    mcpCall($this, 'get_context', ['collection' => $beta->slug]);

    expect(mcpText(mcpCall($this, 'collection_documents', ['action' => 'get', 'slug' => 'notes'])))
        ->toContain('Notes of Beta');
});

test('collection argument targets that collection for one call only', function () {
    [$alpha, $beta] = setupSessionCollectionTest();

    mcpCall($this, 'get_context', ['collection' => $alpha->slug], 'session-a');

    $response = mcpCall($this, 'collection_documents', [
        'action' => 'update',
        'slug' => 'notes',
        'content' => 'Updated Beta notes',
        'collection' => $beta->slug,
    ], 'session-a');

    expect($response->json('result.isError'))->not->toBeTrue();
    expect(CollectionDocument::where('collection_id', $beta->id)->value('content'))->toBe('Updated Beta notes');
    expect(CollectionDocument::where('collection_id', $alpha->id)->value('content'))->toBe('Notes of Alpha');

    // The session's active collection is unchanged
    expect(mcpText(mcpCall($this, 'collection_documents', ['action' => 'get', 'slug' => 'notes'], 'session-a')))
        ->toContain('Notes of Alpha');
});

test('unknown collection argument returns a tool error and writes nothing', function () {
    [$alpha] = setupSessionCollectionTest();

    mcpCall($this, 'get_context', ['collection' => $alpha->slug], 'session-a');

    $response = mcpCall($this, 'collection_documents', [
        'action' => 'update',
        'slug' => 'notes',
        'content' => 'Should not be written',
        'collection' => 'does-not-exist',
    ], 'session-a');

    expect($response->json('result.isError'))->toBeTrue();
    expect(mcpText($response))->toContain("Collection 'does-not-exist' not found");
    expect(CollectionDocument::where('collection_id', $alpha->id)->value('content'))->toBe('Notes of Alpha');
});

test('collection token cannot target another collection', function () {
    [$alpha, $beta] = setupSessionCollectionTest();

    ApiToken::create([
        'collection_id' => $alpha->id,
        'name' => 'col-token',
        'token_hash' => hash('sha256', 'test-col-token'),
    ]);

    $response = mcpCall($this, 'collection_documents', [
        'action' => 'get',
        'slug' => 'notes',
        'collection' => $beta->slug,
    ], null, 'test-col-token');

    expect($response->json('result.isError'))->toBeTrue();
    expect(mcpText($response))->not->toContain('Notes of Beta');
});
