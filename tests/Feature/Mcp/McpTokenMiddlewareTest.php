<?php

use App\Models\ApiToken;
use App\Models\Collection;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

function createMcpTokenTestSetup(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $plainToken = 'cv_live_'.Str::random(32);
    $apiToken = ApiToken::factory()->create([
        'collection_id' => $collection->id,
        'token_hash' => hash('sha256', $plainToken),
    ]);

    return [$user, $workspace, $collection, $apiToken, $plainToken];
}

test('valid token via query param passes authentication', function () {
    [, , , , $plainToken] = createMcpTokenTestSetup();

    $response = $this->postJson('/mcp?token='.$plainToken);

    expect($response->status())->not->toBe(401);
});

test('valid token via bearer header passes authentication', function () {
    [, , , , $plainToken] = createMcpTokenTestSetup();

    $response = $this->postJson('/mcp', [], ['Authorization' => 'Bearer '.$plainToken]);

    expect($response->status())->not->toBe(401);
});

test('invalid token returns 401', function () {
    createMcpTokenTestSetup();

    $this->postJson('/mcp?token=invalid_token_here')
        ->assertStatus(401);
});

test('missing token returns 401', function () {
    $this->postJson('/mcp')
        ->assertStatus(401);
});

test('expired token returns 401', function () {
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $plainToken = 'cv_live_'.Str::random(32);
    ApiToken::factory()->create([
        'collection_id' => $collection->id,
        'token_hash' => hash('sha256', $plainToken),
        'expires_at' => now()->subDay(),
    ]);

    $this->postJson('/mcp?token='.$plainToken)
        ->assertStatus(401);
});

test('last_used_at is updated on valid token use', function () {
    [, , , $apiToken, $plainToken] = createMcpTokenTestSetup();

    expect($apiToken->last_used_at)->toBeNull();

    $this->postJson('/mcp?token='.$plainToken);

    expect($apiToken->fresh()->last_used_at)->not->toBeNull();
});

test('token binds workspace and collection to container', function () {
    [, $workspace, $collection, , $plainToken] = createMcpTokenTestSetup();

    $this->postJson('/mcp?token='.$plainToken);

    expect(app('current_workspace')->id)->toBe($workspace->id);
    expect(app('mcp_collection')->id)->toBe($collection->id);
});
