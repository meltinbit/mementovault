<?php

use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;

function createAuthenticatedUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can view tags index', function () {
    [$user, $workspace] = createAuthenticatedUser();
    Tag::factory()->create(['workspace_id' => $workspace->id, 'name' => 'php']);

    $this->actingAs($user)
        ->get('/tags')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('tags/index')->has('tags', 1));
});

test('can create a tag', function () {
    [$user, $workspace] = createAuthenticatedUser();

    $this->actingAs($user)
        ->post('/tags', ['name' => 'laravel', 'color' => '#6366f1'])
        ->assertRedirect();

    expect(Tag::withoutGlobalScopes()->where('workspace_id', $workspace->id)->where('name', 'laravel')->exists())->toBeTrue();
});

test('can delete a tag', function () {
    [$user, $workspace] = createAuthenticatedUser();
    $tag = Tag::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->delete("/tags/{$tag->id}")
        ->assertRedirect();

    expect(Tag::withoutGlobalScopes()->find($tag->id))->toBeNull();
});

test('validation rejects empty tag name', function () {
    [$user] = createAuthenticatedUser();

    $this->actingAs($user)
        ->post('/tags', ['name' => '', 'color' => '#6366f1'])
        ->assertSessionHasErrors('name');
});

test('validation rejects invalid hex color', function () {
    [$user] = createAuthenticatedUser();

    $this->actingAs($user)
        ->post('/tags', ['name' => 'test', 'color' => 'not-hex'])
        ->assertSessionHasErrors('color');
});

test('guests cannot access tags', function () {
    $this->get('/tags')->assertRedirect('/login');
});

test('tags are scoped to workspace', function () {
    [$user1, $workspace1] = createAuthenticatedUser();
    [$user2, $workspace2] = createAuthenticatedUser();

    Tag::factory()->create(['workspace_id' => $workspace2->id, 'name' => 'other-tag']);

    $this->actingAs($user1)
        ->get('/tags')
        ->assertInertia(fn ($page) => $page->has('tags', 0));
});
