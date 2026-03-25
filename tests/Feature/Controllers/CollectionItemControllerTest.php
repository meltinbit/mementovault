<?php

use App\Models\Collection;
use App\Models\Document;
use App\Models\Skill;
use App\Models\Snippet;
use App\Models\User;
use App\Models\Workspace;

function createItemTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can attach a document to a collection', function () {
    [$user, $workspace] = createItemTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);
    $doc = Document::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/items", [
            'items' => [['type' => 'document', 'id' => $doc->id]],
        ])
        ->assertRedirect();

    expect($collection->documents()->count())->toBe(1);
});

test('can detach a document from a collection', function () {
    [$user, $workspace] = createItemTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);
    $doc = Document::factory()->create(['workspace_id' => $workspace->id]);
    $collection->documents()->attach($doc->id);

    $this->actingAs($user)
        ->delete("/collections/{$collection->id}/items", [
            'items' => [['type' => 'document', 'id' => $doc->id]],
        ])
        ->assertRedirect();

    expect($collection->documents()->count())->toBe(0);
});

test('can attach multiple item types', function () {
    [$user, $workspace] = createItemTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);
    $doc = Document::factory()->create(['workspace_id' => $workspace->id]);
    $skill = Skill::factory()->create(['workspace_id' => $workspace->id]);
    $snippet = Snippet::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/items", [
            'items' => [
                ['type' => 'document', 'id' => $doc->id],
                ['type' => 'skill', 'id' => $skill->id],
                ['type' => 'snippet', 'id' => $snippet->id],
            ],
        ])
        ->assertRedirect();

    expect($collection->documents()->count())->toBe(1);
    expect($collection->skills()->count())->toBe(1);
    expect($collection->snippets()->count())->toBe(1);
});

test('attaching same item twice does not duplicate', function () {
    [$user, $workspace] = createItemTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);
    $doc = Document::factory()->create(['workspace_id' => $workspace->id]);
    $collection->documents()->attach($doc->id);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/items", [
            'items' => [['type' => 'document', 'id' => $doc->id]],
        ])
        ->assertRedirect();

    expect($collection->documents()->count())->toBe(1);
});

test('validation rejects invalid item type', function () {
    [$user, $workspace] = createItemTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/items", [
            'items' => [['type' => 'invalid', 'id' => 1]],
        ])
        ->assertSessionHasErrors('items.0.type');
});

test('validation rejects empty items array', function () {
    [$user, $workspace] = createItemTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post("/collections/{$collection->id}/items", [
            'items' => [],
        ])
        ->assertSessionHasErrors('items');
});
