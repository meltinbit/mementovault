<?php

use App\Models\Asset;
use App\Models\AssetFolder;
use App\Models\User;
use App\Models\Workspace;

function createFolderTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can view folder tree', function () {
    [$user, $workspace] = createFolderTestUser();
    AssetFolder::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Images']);

    $this->actingAs($user)->get('/asset-folders')
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['name' => 'Images']);
});

test('can create a root folder', function () {
    [$user, $workspace] = createFolderTestUser();

    $this->actingAs($user)
        ->post('/asset-folders', ['name' => 'Logos'])
        ->assertRedirect();

    $folder = AssetFolder::withoutGlobalScopes()->where('workspace_id', $workspace->id)->first();
    expect($folder)->not->toBeNull();
    expect($folder->name)->toBe('Logos');
    expect($folder->parent_id)->toBeNull();
    expect($folder->slug)->toBe('logos');
});

test('can create a nested folder', function () {
    [$user, $workspace] = createFolderTestUser();
    $parent = AssetFolder::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Images']);

    $this->actingAs($user)
        ->post('/asset-folders', ['name' => 'Brand', 'parent_id' => $parent->id])
        ->assertRedirect();

    $child = AssetFolder::withoutGlobalScopes()
        ->where('workspace_id', $workspace->id)
        ->where('parent_id', $parent->id)
        ->first();
    expect($child)->not->toBeNull();
    expect($child->name)->toBe('Brand');
});

test('can rename a folder', function () {
    [$user, $workspace] = createFolderTestUser();
    $folder = AssetFolder::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Old Name']);

    $this->actingAs($user)
        ->put("/asset-folders/{$folder->id}", ['name' => 'New Name'])
        ->assertRedirect();

    expect($folder->fresh()->name)->toBe('New Name');
});

test('cannot create circular folder reference', function () {
    [$user, $workspace] = createFolderTestUser();
    $parent = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);
    $child = AssetFolder::factory()->create(['workspace_id' => $workspace->id, 'parent_id' => $parent->id]);

    $this->actingAs($user)
        ->put("/asset-folders/{$parent->id}", ['name' => $parent->name, 'parent_id' => $child->id])
        ->assertSessionHasErrors('parent_id');
});

test('cannot set folder as its own parent', function () {
    [$user, $workspace] = createFolderTestUser();
    $folder = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/asset-folders/{$folder->id}", ['name' => $folder->name, 'parent_id' => $folder->id])
        ->assertSessionHasErrors('parent_id');
});

test('deleting folder moves assets to root', function () {
    [$user, $workspace] = createFolderTestUser();
    $folder = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);
    $asset = Asset::factory()->create(['workspace_id' => $workspace->id, 'folder_id' => $folder->id]);

    $this->actingAs($user)
        ->delete("/asset-folders/{$folder->id}")
        ->assertRedirect();

    expect(AssetFolder::withoutGlobalScopes()->find($folder->id))->toBeNull();
    expect($asset->fresh()->folder_id)->toBeNull();
});

test('deleting folder moves sub-folders to root', function () {
    [$user, $workspace] = createFolderTestUser();
    $parent = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);
    $child = AssetFolder::factory()->create(['workspace_id' => $workspace->id, 'parent_id' => $parent->id]);

    $this->actingAs($user)
        ->delete("/asset-folders/{$parent->id}")
        ->assertRedirect();

    expect(AssetFolder::withoutGlobalScopes()->find($parent->id))->toBeNull();
    expect($child->fresh()->parent_id)->toBeNull();
});

test('folders are scoped to workspace', function () {
    [$user1, $workspace1] = createFolderTestUser();
    [$user2, $workspace2] = createFolderTestUser();

    AssetFolder::factory()->create(['workspace_id' => $workspace1->id, 'name' => 'My Folder']);
    AssetFolder::factory()->create(['workspace_id' => $workspace2->id, 'name' => 'Other Folder']);

    $this->actingAs($user1)->get('/asset-folders')
        ->assertOk()
        ->assertJsonCount(1)
        ->assertJsonFragment(['name' => 'My Folder'])
        ->assertJsonMissing(['name' => 'Other Folder']);
});

test('validation rejects missing folder name', function () {
    [$user] = createFolderTestUser();

    $this->actingAs($user)
        ->post('/asset-folders', ['name' => ''])
        ->assertSessionHasErrors('name');
});

test('guests cannot access folder endpoints', function () {
    $this->get('/asset-folders')->assertRedirect('/login');
    $this->post('/asset-folders', ['name' => 'Test'])->assertRedirect('/login');
});
