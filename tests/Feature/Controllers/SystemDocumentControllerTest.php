<?php

use App\Models\SystemDocument;
use App\Models\SystemDocumentRevision;
use App\Models\User;
use App\Models\Workspace;

function createUserWithWorkspaceAndDocs(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    foreach (['identity', 'instructions', 'context', 'memory'] as $type) {
        SystemDocument::withoutGlobalScopes()->create([
            'workspace_id' => $workspace->id,
            'type' => $type,
            'content' => "Initial {$type} content",
            'version' => 1,
        ]);
    }

    return [$user, $workspace];
}

test('can view each system document type', function (string $type) {
    [$user, $workspace] = createUserWithWorkspaceAndDocs();

    $this->actingAs($user)
        ->get("/workspace/{$type}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspace/show')
            ->has('document')
            ->has('revisions')
            ->has('meta')
        );
})->with(['identity', 'instructions', 'context']);

test('visiting unknown type auto-creates document', function () {
    [$user, $workspace] = createUserWithWorkspaceAndDocs();

    $this->actingAs($user)
        ->get('/workspace/custom-type')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('workspace/show')
            ->has('document')
            ->where('document.type', 'custom-type')
            ->where('document.content', '')
            ->has('meta')
        );

    expect(
        SystemDocument::withoutGlobalScopes()
            ->where('workspace_id', $workspace->id)
            ->where('type', 'custom-type')
            ->exists()
    )->toBeTrue();
});

test('invalid type format returns 404', function () {
    [$user, $workspace] = createUserWithWorkspaceAndDocs();

    $this->actingAs($user)
        ->get('/workspace/INVALID')
        ->assertNotFound();
});

test('can update system document content', function () {
    [$user, $workspace] = createUserWithWorkspaceAndDocs();

    $this->actingAs($user)
        ->put('/workspace/identity', [
            'content' => 'Updated identity content',
        ])
        ->assertRedirect();

    $doc = SystemDocument::withoutGlobalScopes()
        ->where('workspace_id', $workspace->id)
        ->where('type', 'identity')
        ->first();

    expect($doc->content)->toBe('Updated identity content');
});

test('update creates revision automatically', function () {
    [$user, $workspace] = createUserWithWorkspaceAndDocs();

    $this->actingAs($user)
        ->put('/workspace/identity', [
            'content' => 'New content',
        ]);

    $doc = SystemDocument::withoutGlobalScopes()
        ->where('workspace_id', $workspace->id)
        ->where('type', 'identity')
        ->first();

    $revisions = SystemDocumentRevision::where('system_document_id', $doc->id)->get();

    expect($revisions)->toHaveCount(1);
    expect($revisions->first()->content)->toBe('Initial identity content');
    expect($revisions->first()->version)->toBe(1);
});

test('version increments on update', function () {
    [$user, $workspace] = createUserWithWorkspaceAndDocs();

    $this->actingAs($user)
        ->put('/workspace/identity', ['content' => 'V2']);

    $doc = SystemDocument::withoutGlobalScopes()
        ->where('workspace_id', $workspace->id)
        ->where('type', 'identity')
        ->first();

    expect($doc->version)->toBe(2);
});

test('validation rejects empty content', function () {
    [$user, $workspace] = createUserWithWorkspaceAndDocs();

    $this->actingAs($user)
        ->put('/workspace/identity', ['content' => ''])
        ->assertSessionHasErrors('content');
});

test('guests cannot access system documents', function () {
    $this->get('/workspace/identity')->assertRedirect('/login');
});
