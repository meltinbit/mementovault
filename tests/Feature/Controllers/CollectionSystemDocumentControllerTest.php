<?php

use App\Models\Collection;
use App\Models\CollectionSystemDocument;
use App\Models\CollectionSystemDocumentRevision;
use App\Models\User;
use App\Models\Workspace;

function createSysDocTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can create a collection system document', function () {
    [$user, $workspace] = createSysDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}/documents/instructions", [
            'content' => 'Collection instructions content',
        ])
        ->assertRedirect();

    $doc = CollectionSystemDocument::where('collection_id', $collection->id)->where('type', 'instructions')->first();
    expect($doc)->not->toBeNull();
    expect($doc->content)->toBe('Collection instructions content');
    expect($doc->version)->toBe(1);
});

test('can update an existing collection system document', function () {
    [$user, $workspace] = createSysDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    CollectionSystemDocument::create([
        'collection_id' => $collection->id,
        'type' => 'context',
        'content' => 'Original context',
        'version' => 1,
    ]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}/documents/context", [
            'content' => 'Updated context',
        ])
        ->assertRedirect();

    $doc = CollectionSystemDocument::where('collection_id', $collection->id)->where('type', 'context')->first();
    expect($doc->content)->toBe('Updated context');
    expect($doc->version)->toBe(2);
});

test('revision is created on update', function () {
    [$user, $workspace] = createSysDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    CollectionSystemDocument::create([
        'collection_id' => $collection->id,
        'type' => 'memory',
        'content' => 'V1 content',
        'version' => 1,
    ]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}/documents/memory", ['content' => 'V2 content']);

    $doc = CollectionSystemDocument::where('collection_id', $collection->id)->where('type', 'memory')->first();
    $revisions = CollectionSystemDocumentRevision::where('collection_system_document_id', $doc->id)->get();

    expect($revisions)->toHaveCount(1);
    expect($revisions->first()->content)->toBe('V1 content');
    expect($revisions->first()->version)->toBe(1);
});

test('invalid type format returns 404', function () {
    [$user, $workspace] = createSysDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}/documents/INVALID", ['content' => 'test'])
        ->assertNotFound();
});

test('any valid type can be used for collection documents', function () {
    [$user, $workspace] = createSysDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}/documents/identity", ['content' => 'Identity override'])
        ->assertRedirect();

    $doc = CollectionSystemDocument::where('collection_id', $collection->id)->where('type', 'identity')->first();
    expect($doc)->not->toBeNull();
    expect($doc->content)->toBe('Identity override');
});

test('validation rejects empty content', function () {
    [$user, $workspace] = createSysDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}/documents/instructions", ['content' => ''])
        ->assertSessionHasErrors('content');
});

test('each type is independent per collection', function () {
    [$user, $workspace] = createSysDocTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/collections/{$collection->id}/documents/instructions", ['content' => 'Instructions']);
    $this->actingAs($user)
        ->put("/collections/{$collection->id}/documents/context", ['content' => 'Context']);

    expect(CollectionSystemDocument::where('collection_id', $collection->id)->count())->toBe(2);
});
