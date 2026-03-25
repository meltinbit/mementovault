<?php

use App\Models\Asset;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function createAssetTestUser(): array
{
    $user = User::factory()->create();
    $workspace = Workspace::factory()->create(['user_id' => $user->id]);

    return [$user, $workspace];
}

test('can view assets index', function () {
    [$user] = createAssetTestUser();

    $this->actingAs($user)->get('/assets')->assertOk()
        ->assertInertia(fn ($page) => $page->component('assets/index'));
});

test('can view asset create form', function () {
    [$user] = createAssetTestUser();

    $this->actingAs($user)->get('/assets/create')->assertOk()
        ->assertInertia(fn ($page) => $page->component('assets/create'));
});

test('can upload an asset', function () {
    Storage::fake('assets');
    [$user, $workspace] = createAssetTestUser();

    $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');

    $this->actingAs($user)
        ->post('/assets', [
            'file' => $file,
            'name' => 'My Document',
            'description' => 'A test PDF',
        ])
        ->assertRedirect('/assets');

    $asset = Asset::withoutGlobalScopes()->where('workspace_id', $workspace->id)->first();
    expect($asset)->not->toBeNull();
    expect($asset->original_filename)->toBe('document.pdf');
    expect($asset->mime_type)->toBe('application/pdf');
    Storage::disk('assets')->assertExists($asset->storage_path);
});

test('can view asset edit form', function () {
    [$user, $workspace] = createAssetTestUser();
    $asset = Asset::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)->get("/assets/{$asset->id}/edit")->assertOk()
        ->assertInertia(fn ($page) => $page->component('assets/edit')->has('asset'));
});

test('can update asset metadata', function () {
    [$user, $workspace] = createAssetTestUser();
    $asset = Asset::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->put("/assets/{$asset->id}", ['name' => 'New Name', 'description' => 'New desc'])
        ->assertRedirect();

    expect($asset->fresh()->name)->toBe('New Name');
});

test('can delete an asset', function () {
    Storage::fake('assets');
    [$user, $workspace] = createAssetTestUser();
    $asset = Asset::factory()->create(['workspace_id' => $workspace->id, 'storage_path' => 'test/assets/file.pdf']);

    Storage::disk('assets')->put('test/assets/file.pdf', 'content');

    $this->actingAs($user)->delete("/assets/{$asset->id}")->assertRedirect('/assets');

    expect(Asset::withoutGlobalScopes()->find($asset->id))->toBeNull();
});

test('can download an asset', function () {
    Storage::fake('assets');
    [$user, $workspace] = createAssetTestUser();

    $asset = Asset::factory()->create([
        'workspace_id' => $workspace->id,
        'storage_path' => 'test/assets/file.pdf',
        'original_filename' => 'my-file.pdf',
    ]);

    Storage::disk('assets')->put('test/assets/file.pdf', 'file content');

    $this->actingAs($user)->get("/assets/{$asset->id}/download")->assertOk();
});

test('validation rejects missing file on upload', function () {
    [$user] = createAssetTestUser();

    $this->actingAs($user)
        ->post('/assets', ['name' => 'Test', 'description' => 'desc'])
        ->assertSessionHasErrors('file');
});

test('guests cannot access assets', function () {
    $this->get('/assets')->assertRedirect('/login');
});

test('assets are scoped to workspace on index', function () {
    [$user1, $workspace1] = createAssetTestUser();
    [$user2, $workspace2] = createAssetTestUser();

    Asset::factory()->create(['workspace_id' => $workspace1->id, 'name' => 'My Asset']);
    Asset::factory()->create(['workspace_id' => $workspace2->id, 'name' => 'Other Asset']);

    $this->actingAs($user1)->get('/assets')
        ->assertInertia(fn ($page) => $page->has('assets.data', 1));
});
