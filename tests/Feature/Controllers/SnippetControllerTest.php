<?php

use App\Models\Snippet;
use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;

function createSnippetTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can view snippets index', function () {
    [$user] = createSnippetTestUser();

    $this->actingAs($user)->get('/snippets')->assertOk()
        ->assertInertia(fn ($page) => $page->component('snippets/index'));
});

test('can view snippet create form', function () {
    [$user] = createSnippetTestUser();

    $this->actingAs($user)->get('/snippets/create')->assertOk()
        ->assertInertia(fn ($page) => $page->component('snippets/create'));
});

test('can store a snippet', function () {
    [$user, $workspace] = createSnippetTestUser();

    $this->actingAs($user)
        ->post('/snippets', [
            'name' => 'Test Snippet',
            'content' => 'Snippet content here',
            'is_active' => true,
        ])
        ->assertRedirect();

    expect(Snippet::withoutGlobalScopes()->where('workspace_id', $workspace->id)->where('name', 'Test Snippet')->exists())->toBeTrue();
});

test('can store a snippet with tags', function () {
    [$user, $workspace] = createSnippetTestUser();
    $tag = Tag::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post('/snippets', [
            'name' => 'Tagged Snippet',
            'content' => 'content',
            'tag_ids' => [$tag->id],
        ]);

    $snippet = Snippet::withoutGlobalScopes()->where('name', 'Tagged Snippet')->first();
    expect($snippet->tags()->count())->toBe(1);
});

test('can view snippet edit form', function () {
    [$user, $workspace] = createSnippetTestUser();
    $snippet = Snippet::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->get("/snippets/{$snippet->id}/edit")->assertOk()
        ->assertInertia(fn ($page) => $page->component('snippets/edit')->has('snippet'));
});

test('can update a snippet', function () {
    [$user, $workspace] = createSnippetTestUser();
    $snippet = Snippet::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/snippets/{$snippet->id}", [
            'name' => 'Updated Snippet',
            'content' => 'Updated content',
        ])
        ->assertRedirect();

    expect($snippet->fresh()->name)->toBe('Updated Snippet');
});

test('can delete a snippet', function () {
    [$user, $workspace] = createSnippetTestUser();
    $snippet = Snippet::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->delete("/snippets/{$snippet->id}")->assertRedirect('/snippets');

    expect(Snippet::withoutGlobalScopes()->find($snippet->id))->toBeNull();
});

test('can filter snippets by search', function () {
    [$user, $workspace] = createSnippetTestUser();
    Snippet::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Laravel Helper']);
    Snippet::factory()->create(['workspace_id' => $workspace->id, 'name' => 'React Helper']);

    $this->actingAs($user)->get('/snippets?search=Laravel')
        ->assertInertia(fn ($page) => $page->has('snippets.data', 1));
});

test('validation rejects missing snippet name', function () {
    [$user] = createSnippetTestUser();

    $this->actingAs($user)
        ->post('/snippets', ['name' => '', 'content' => 'content'])
        ->assertSessionHasErrors('name');
});

test('validation rejects missing snippet content', function () {
    [$user] = createSnippetTestUser();

    $this->actingAs($user)
        ->post('/snippets', ['name' => 'test', 'content' => ''])
        ->assertSessionHasErrors('content');
});

test('guests cannot access snippets', function () {
    $this->get('/snippets')->assertRedirect('/login');
});

test('snippets are scoped to workspace on index', function () {
    [$user1, $workspace1] = createSnippetTestUser();
    [$user2, $workspace2] = createSnippetTestUser();

    Snippet::factory()->create(['workspace_id' => $workspace1->id, 'name' => 'My Snippet']);
    Snippet::factory()->create(['workspace_id' => $workspace2->id, 'name' => 'Other Snippet']);

    $this->actingAs($user1)->get('/snippets')
        ->assertInertia(fn ($page) => $page->has('snippets.data', 1));
});
