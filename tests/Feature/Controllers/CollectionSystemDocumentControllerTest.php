<?php

use App\Models\Collection;
use App\Models\CollectionDocument;
use App\Models\User;
use App\Models\Workspace;

function createCollectionDocTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can create a collection document', function () {
    [$user, $workspace] = createCollectionDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/docs", [
            'name' => 'Architecture',
        ])
        ->assertRedirect();

    $doc = CollectionDocument::where('collection_id', $collection->id)->where('name', 'Architecture')->first();
    expect($doc)->not->toBeNull();
    expect($doc->slug)->toBe('architecture');
});

test('can update a collection document', function () {
    [$user, $workspace] = createCollectionDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $doc = CollectionDocument::create([
        'collection_id' => $collection->id,
        'name' => 'Instructions',
        'content' => 'Original content',
        'sort_order' => 0,
    ]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}/docs/{$doc->id}", [
            'name' => 'Instructions',
            'content' => 'Updated content',
        ])
        ->assertRedirect();

    $doc->refresh();
    expect($doc->content)->toBe('Updated content');
});

test('can delete a non-required collection document', function () {
    [$user, $workspace] = createCollectionDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $doc = CollectionDocument::create([
        'collection_id' => $collection->id,
        'name' => 'Custom Doc',
        'content' => 'Some content',
        'sort_order' => 1,
        'is_required' => false,
    ]);

    $this->actingAs($user)
        ->delete("/collections/{$collection->id}/docs/{$doc->id}")
        ->assertRedirect();

    expect(CollectionDocument::find($doc->id))->toBeNull();
});

test('cannot delete a required collection document', function () {
    [$user, $workspace] = createCollectionDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $doc = CollectionDocument::create([
        'collection_id' => $collection->id,
        'name' => 'Instructions',
        'content' => 'Required doc',
        'sort_order' => 0,
        'is_required' => true,
    ]);

    $this->actingAs($user)
        ->delete("/collections/{$collection->id}/docs/{$doc->id}")
        ->assertForbidden();

    expect(CollectionDocument::find($doc->id))->not->toBeNull();
});

test('can reorder collection documents', function () {
    [$user, $workspace] = createCollectionDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $doc1 = CollectionDocument::create(['collection_id' => $collection->id, 'name' => 'First', 'sort_order' => 0]);
    $doc2 = CollectionDocument::create(['collection_id' => $collection->id, 'name' => 'Second', 'sort_order' => 1]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/docs/reorder", [
            'ids' => [$doc2->id, $doc1->id],
        ])
        ->assertRedirect();

    expect($doc2->fresh()->sort_order)->toBe(0);
    expect($doc1->fresh()->sort_order)->toBe(1);
});

test('new document gets next sort order', function () {
    [$user, $workspace] = createCollectionDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    CollectionDocument::create(['collection_id' => $collection->id, 'name' => 'First', 'sort_order' => 0]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/docs", ['name' => 'Second'])
        ->assertRedirect();

    $second = CollectionDocument::where('collection_id', $collection->id)->where('name', 'Second')->first();
    expect($second->sort_order)->toBe(1);
});
