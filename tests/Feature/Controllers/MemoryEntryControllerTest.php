<?php

use App\Models\MemoryEntry;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createMemoryTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can view memory index', function () {
    [$user] = createMemoryTestUser();

    $this->actingAs($user)
        ->get('/memory')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('memory/index'));
});

test('can store a memory entry', function () {
    [$user, $workspace] = createMemoryTestUser();

    $this->actingAs($user)
        ->post('/memory', [
            'content' => 'User prefers dark mode.',
            'category' => 'preference',
        ])
        ->assertRedirect();

    expect(MemoryEntry::where('workspace_id', $workspace->id)->where('content', 'User prefers dark mode.')->exists())->toBeTrue();
});

test('can update a memory entry', function () {
    [$user, $workspace] = createMemoryTestUser();
    $entry = MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Old content']);

    $this->actingAs($user)
        ->put("/memory/{$entry->id}", [
            'content' => 'Updated content',
            'category' => 'decision',
        ])
        ->assertRedirect();

    expect($entry->fresh()->content)->toBe('Updated content');
    expect($entry->fresh()->category)->toBe('decision');
});

test('can toggle pin on memory entry', function () {
    [$user, $workspace] = createMemoryTestUser();
    $entry = MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'is_pinned' => false]);

    $this->actingAs($user)->post("/memory/{$entry->id}/pin")->assertRedirect();
    expect($entry->fresh()->is_pinned)->toBeTrue();

    $this->actingAs($user)->post("/memory/{$entry->id}/pin")->assertRedirect();
    expect($entry->fresh()->is_pinned)->toBeFalse();
});

test('can archive a memory entry', function () {
    [$user, $workspace] = createMemoryTestUser();
    $entry = MemoryEntry::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->post("/memory/{$entry->id}/archive")->assertRedirect();
    expect($entry->fresh()->is_archived)->toBeTrue();
});

test('can unarchive a memory entry', function () {
    [$user, $workspace] = createMemoryTestUser();
    $entry = MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'is_archived' => true]);

    $this->actingAs($user)->post("/memory/{$entry->id}/unarchive")->assertRedirect();
    expect($entry->fresh()->is_archived)->toBeFalse();
});

test('can delete a memory entry', function () {
    [$user, $workspace] = createMemoryTestUser();
    $entry = MemoryEntry::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->delete("/memory/{$entry->id}")->assertRedirect();
    expect(MemoryEntry::find($entry->id))->toBeNull();
});

test('can batch archive memory entries', function () {
    [$user, $workspace] = createMemoryTestUser();
    $entry1 = MemoryEntry::factory()->create(['workspace_id' => $workspace->id]);
    $entry2 = MemoryEntry::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post('/memory/batch-archive', ['ids' => [$entry1->id, $entry2->id]])
        ->assertRedirect();

    expect($entry1->fresh()->is_archived)->toBeTrue();
    expect($entry2->fresh()->is_archived)->toBeTrue();
});

test('can filter by search', function () {
    [$user, $workspace] = createMemoryTestUser();
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Prefers dark mode']);
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'content' => 'Uses Laravel']);

    $this->actingAs($user)
        ->get('/memory?search=dark')
        ->assertInertia(fn ($page) => $page->has('entries.data', 1));
});

test('can filter by status', function () {
    [$user, $workspace] = createMemoryTestUser();
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'is_archived' => false]);
    MemoryEntry::factory()->create(['workspace_id' => $workspace->id, 'is_archived' => true]);

    $this->actingAs($user)
        ->get('/memory?status=archived')
        ->assertInertia(fn ($page) => $page->has('entries.data', 1));
});

test('validation rejects empty content', function () {
    [$user] = createMemoryTestUser();

    $this->actingAs($user)
        ->post('/memory', ['content' => ''])
        ->assertSessionHasErrors('content');
});

test('guests cannot access memory', function () {
    $this->get('/memory')->assertRedirect('/login');
});

test('entries are scoped to workspace', function () {
    [$user1, $workspace1] = createMemoryTestUser();
    [$user2, $workspace2] = createMemoryTestUser();

    MemoryEntry::factory()->create(['workspace_id' => $workspace1->id, 'content' => 'My entry']);
    MemoryEntry::factory()->create(['workspace_id' => $workspace2->id, 'content' => 'Other entry']);

    $this->actingAs($user1)
        ->get('/memory')
        ->assertInertia(fn ($page) => $page->has('entries.data', 1));
});
