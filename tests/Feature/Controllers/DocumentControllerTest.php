<?php

use App\Models\Document;
use App\Models\DocumentRevision;
use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;

function createUserWithWorkspace(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can view documents index', function () {
    [$user, $workspace] = createUserWithWorkspace();

    $this->actingAs($user)->get('/documents')->assertOk()
        ->assertInertia(fn ($page) => $page->component('documents/index'));
});

test('can view create form', function () {
    [$user] = createUserWithWorkspace();

    $this->actingAs($user)->get('/documents/create')->assertOk()
        ->assertInertia(fn ($page) => $page->component('documents/create'));
});

test('can store a document', function () {
    [$user, $workspace] = createUserWithWorkspace();

    $this->actingAs($user)
        ->post('/documents', [
            'title' => 'Test Document',
            'content' => 'Document content here',
            'type' => 'technical',
            'is_active' => true,
        ])
        ->assertRedirect();

    expect(Document::withoutGlobalScopes()->where('workspace_id', $workspace->id)->where('title', 'Test Document')->exists())->toBeTrue();
});

test('can store a document with tags', function () {
    [$user, $workspace] = createUserWithWorkspace();
    $tag = Tag::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post('/documents', [
            'title' => 'Tagged Doc',
            'content' => 'content',
            'type' => 'general',
            'tag_ids' => [$tag->id],
        ]);

    $doc = Document::withoutGlobalScopes()->where('title', 'Tagged Doc')->first();
    expect($doc->tags()->count())->toBe(1);
});

test('can view edit form', function () {
    [$user, $workspace] = createUserWithWorkspace();
    $doc = Document::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->get("/documents/{$doc->id}/edit")->assertOk()
        ->assertInertia(fn ($page) => $page->component('documents/edit')->has('document'));
});

test('can update a document', function () {
    [$user, $workspace] = createUserWithWorkspace();
    $doc = Document::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/documents/{$doc->id}", [
            'title' => 'Updated Title',
            'content' => 'Updated content',
            'type' => 'general',
        ])
        ->assertRedirect();

    expect($doc->fresh()->title)->toBe('Updated Title');
});

test('update creates revision when content changes', function () {
    [$user, $workspace] = createUserWithWorkspace();
    $doc = Document::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Original']);

    $this->actingAs($user)
        ->put("/documents/{$doc->id}", [
            'title' => $doc->title,
            'content' => 'Updated',
            'type' => $doc->type,
        ]);

    expect(DocumentRevision::where('document_id', $doc->id)->count())->toBe(1);
    expect($doc->fresh()->version)->toBe(2);
});

test('can delete a document', function () {
    [$user, $workspace] = createUserWithWorkspace();
    $doc = Document::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->delete("/documents/{$doc->id}")->assertRedirect('/documents');

    expect(Document::withoutGlobalScopes()->find($doc->id))->toBeNull();
});

test('can filter documents by search', function () {
    [$user, $workspace] = createUserWithWorkspace();
    Document::factory()->create(['workspace_id' => $workspace->id, 'title' => 'Laravel Guide']);
    Document::factory()->create(['workspace_id' => $workspace->id, 'title' => 'React Guide']);

    $this->actingAs($user)->get('/documents?search=Laravel')
        ->assertInertia(fn ($page) => $page->has('documents.data', 1));
});

test('can filter documents by type', function () {
    [$user, $workspace] = createUserWithWorkspace();
    Document::factory()->create(['workspace_id' => $workspace->id, 'type' => 'technical']);
    Document::factory()->create(['workspace_id' => $workspace->id, 'type' => 'general']);

    $this->actingAs($user)->get('/documents?type=technical')
        ->assertInertia(fn ($page) => $page->has('documents.data', 1));
});

test('validation rejects missing document title', function () {
    [$user] = createUserWithWorkspace();

    $this->actingAs($user)
        ->post('/documents', ['title' => '', 'content' => 'c', 'type' => 'general'])
        ->assertSessionHasErrors('title');
});

test('guests cannot access documents', function () {
    $this->get('/documents')->assertRedirect('/login');
});

test('documents are scoped to workspace on index', function () {
    [$user1, $workspace1] = createUserWithWorkspace();
    [$user2, $workspace2] = createUserWithWorkspace();

    Document::factory()->create(['workspace_id' => $workspace1->id, 'title' => 'My Doc']);
    Document::factory()->create(['workspace_id' => $workspace2->id, 'title' => 'Other Doc']);

    $this->actingAs($user1)->get('/documents')
        ->assertInertia(fn ($page) => $page->has('documents.data', 1));
});
