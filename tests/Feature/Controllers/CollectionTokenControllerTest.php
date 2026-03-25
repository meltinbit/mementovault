<?php

use App\Models\ApiToken;
use App\Models\Collection;
use App\Models\User;
use App\Models\Workspace;

function createTokenTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can generate a token', function () {
    [$user, $workspace] = createTokenTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/tokens", ['name' => 'test-token'])
        ->assertRedirect()
        ->assertSessionHas('newToken');

    expect(ApiToken::where('collection_id', $collection->id)->count())->toBe(1);
    expect(ApiToken::where('collection_id', $collection->id)->first()->name)->toBe('test-token');
});

test('generated token has correct prefix', function () {
    [$user, $workspace] = createTokenTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/tokens", ['name' => 'my-token']);

    $plainToken = session('newToken');
    expect($plainToken)->toStartWith('cv_live_');
    expect(strlen($plainToken))->toBe(40); // cv_live_ (8) + 32 random
});

test('token is stored as sha256 hash', function () {
    [$user, $workspace] = createTokenTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/tokens", ['name' => 'hash-test']);

    $plainToken = session('newToken');
    $token = ApiToken::where('collection_id', $collection->id)->first();
    expect($token->token_hash)->toBe(hash('sha256', $plainToken));
});

test('can revoke a token', function () {
    [$user, $workspace] = createTokenTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);
    $token = ApiToken::factory()->create(['collection_id' => $collection->id]);

    $this->actingAs($user)
        ->delete("/collections/{$collection->id}/tokens/{$token->id}")
        ->assertRedirect();

    expect(ApiToken::find($token->id))->toBeNull();
});

test('cannot revoke token from another collection', function () {
    [$user, $workspace] = createTokenTestUser();
    $collection1 = Collection::factory()->create(['workspace_id' => $workspace->id]);
    $collection2 = Collection::factory()->create(['workspace_id' => $workspace->id]);
    $token = ApiToken::factory()->create(['collection_id' => $collection2->id]);

    $this->actingAs($user)
        ->delete("/collections/{$collection1->id}/tokens/{$token->id}")
        ->assertNotFound();
});

test('default name is used when none provided', function () {
    [$user, $workspace] = createTokenTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/tokens", []);

    expect(ApiToken::where('collection_id', $collection->id)->first()->name)->toBe('default');
});
