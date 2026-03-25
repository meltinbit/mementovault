<?php

use App\Models\Collection;
use App\Models\User;
use App\Models\Workspace;

function createCollectionTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can view collections index', function () {
    [$user, $workspace] = createCollectionTestUser();
    Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->get('/collections')->assertOk()
        ->assertInertia(fn ($page) => $page->component('collections/index'));
});

test('can view create form', function () {
    [$user] = createCollectionTestUser();

    $this->actingAs($user)->get('/collections/create')->assertOk()
        ->assertInertia(fn ($page) => $page->component('collections/create'));
});

test('can store a collection', function () {
    [$user, $workspace] = createCollectionTestUser();

    $this->actingAs($user)
        ->post('/collections', [
            'name' => 'My Project',
            'description' => 'A test collection',
            'type' => 'software_project',
            'color' => '#6366f1',
            'is_active' => true,
        ])
        ->assertRedirect();

    expect(Collection::withoutGlobalScopes()->where('workspace_id', $workspace->id)->where('name', 'My Project')->exists())->toBeTrue();
});

test('can view collection detail page', function () {
    [$user, $workspace] = createCollectionTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->get("/collections/{$collection->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('collections/show')->has('collection')->has('tokens'));
});

test('can view edit form', function () {
    [$user, $workspace] = createCollectionTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->get("/collections/{$collection->id}/edit")->assertOk()
        ->assertInertia(fn ($page) => $page->component('collections/edit')->has('collection'));
});

test('can update a collection', function () {
    [$user, $workspace] = createCollectionTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}", [
            'name' => 'Updated Name',
            'description' => 'Updated desc',
            'type' => 'custom',
            'color' => '#ef4444',
            'is_active' => false,
        ])
        ->assertRedirect();

    expect($collection->fresh()->name)->toBe('Updated Name');
});

test('can delete a collection', function () {
    [$user, $workspace] = createCollectionTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->delete("/collections/{$collection->id}")->assertRedirect('/collections');
    expect(Collection::withoutGlobalScopes()->find($collection->id))->toBeNull();
});

test('can filter collections by search', function () {
    [$user, $workspace] = createCollectionTestUser();
    Collection::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Laravel App']);
    Collection::factory()->create(['workspace_id' => $workspace->id, 'name' => 'React App']);

    $this->actingAs($user)->get('/collections?search=Laravel')
        ->assertInertia(fn ($page) => $page->has('collections.data', 1));
});

test('can filter collections by type', function () {
    [$user, $workspace] = createCollectionTestUser();
    Collection::factory()->create(['workspace_id' => $workspace->id, 'type' => 'software_project']);
    Collection::factory()->create(['workspace_id' => $workspace->id, 'type' => 'marketing']);

    $this->actingAs($user)->get('/collections?type=software_project')
        ->assertInertia(fn ($page) => $page->has('collections.data', 1));
});

test('validation rejects missing name', function () {
    [$user] = createCollectionTestUser();

    $this->actingAs($user)
        ->post('/collections', ['name' => '', 'type' => 'custom', 'color' => '#6366f1'])
        ->assertSessionHasErrors('name');
});

test('validation rejects invalid type', function () {
    [$user] = createCollectionTestUser();

    $this->actingAs($user)
        ->post('/collections', ['name' => 'Test', 'type' => 'invalid', 'color' => '#6366f1'])
        ->assertSessionHasErrors('type');
});

test('validation rejects invalid color format', function () {
    [$user] = createCollectionTestUser();

    $this->actingAs($user)
        ->post('/collections', ['name' => 'Test', 'type' => 'custom', 'color' => 'red'])
        ->assertSessionHasErrors('color');
});

test('guests cannot access collections', function () {
    $this->get('/collections')->assertRedirect('/login');
});

test('collections are scoped to workspace on index', function () {
    [$user1, $workspace1] = createCollectionTestUser();
    [$user2, $workspace2] = createCollectionTestUser();

    Collection::factory()->create(['workspace_id' => $workspace1->id, 'name' => 'My Collection']);
    Collection::factory()->create(['workspace_id' => $workspace2->id, 'name' => 'Other Collection']);

    $this->actingAs($user1)->get('/collections')
        ->assertInertia(fn ($page) => $page->has('collections.data', 1));
});
