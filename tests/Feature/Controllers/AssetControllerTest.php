<?php

use App\Models\Asset;
use App\Models\AssetFolder;
use App\Models\Collection;
use App\Models\Tag;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

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
    [$user, $workspace] = createAssetTestUser();
    $workspace->update(['settings' => ['storage' => ['key' => 'test']]]);

    $this->actingAs($user)->get('/assets/create')->assertOk()
        ->assertInertia(fn ($page) => $page->component('assets/create'));
});

test('asset create redirects when storage not configured', function () {
    [$user] = createAssetTestUser();

    $this->actingAs($user)->get('/assets/create')->assertRedirect('/assets');
});

test('can upload an asset', function () {
    Storage::fake('assets');
    [$user, $workspace] = createAssetTestUser();
    $workspace->update(['settings' => ['storage' => ['key' => 'test']]]);

    $file = UploadedFile::fake()->create('document.pdf', 1024, 'application/pdf');

    $this->actingAs($user)
        ->post('/assets', [
            'file' => $file,
            'name' => 'My Document',
            'description' => 'A test PDF',
        ])
        ->assertRedirect();

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

    $this->actingAs($user)->delete("/assets/{$asset->id}")->assertRedirect();

    expect(Asset::withoutGlobalScopes()->find($asset->id))->toBeNull();
});

test('can download an asset when authenticated', function () {
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

test('can download an asset with a signed URL', function () {
    Storage::fake('assets');
    [, $workspace] = createAssetTestUser();

    $asset = Asset::factory()->create([
        'workspace_id' => $workspace->id,
        'storage_path' => 'test/assets/file.pdf',
        'original_filename' => 'my-file.pdf',
    ]);

    Storage::disk('assets')->put('test/assets/file.pdf', 'file content');

    $signedUrl = URL::signedRoute('assets.download', ['asset' => $asset->id], now()->addHour());

    $this->get($signedUrl)->assertOk();
});

test('download returns 403 without auth or valid signature', function () {
    Storage::fake('assets');
    [, $workspace] = createAssetTestUser();

    $asset = Asset::factory()->create([
        'workspace_id' => $workspace->id,
        'storage_path' => 'test/assets/file.pdf',
        'original_filename' => 'my-file.pdf',
    ]);

    $this->get("/assets/{$asset->id}/download")->assertForbidden();
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

test('index returns folders tree', function () {
    [$user, $workspace] = createAssetTestUser();
    AssetFolder::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Images']);

    $this->actingAs($user)->get('/assets')
        ->assertInertia(fn ($page) => $page->has('folders', 1));
});

test('can filter assets by folder_id', function () {
    [$user, $workspace] = createAssetTestUser();
    $folder = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);
    Asset::factory()->create(['workspace_id' => $workspace->id, 'folder_id' => $folder->id, 'name' => 'In Folder']);
    Asset::factory()->create(['workspace_id' => $workspace->id, 'folder_id' => null, 'name' => 'At Root']);

    $this->actingAs($user)->get("/assets?folder_id={$folder->id}")
        ->assertInertia(fn ($page) => $page->has('assets.data', 1)
            ->where('assets.data.0.name', 'In Folder'));
});

test('can upload asset into a specific folder', function () {
    Storage::fake('assets');
    [$user, $workspace] = createAssetTestUser();
    $workspace->update(['settings' => ['storage' => ['key' => 'test']]]);
    $folder = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);

    $file = UploadedFile::fake()->create('logo.png', 512, 'image/png');

    $this->actingAs($user)
        ->post('/assets', [
            'file' => $file,
            'name' => 'Logo',
            'description' => 'Brand logo',
            'folder_id' => $folder->id,
        ])
        ->assertRedirect();

    $asset = Asset::withoutGlobalScopes()->where('workspace_id', $workspace->id)->where('name', 'Logo')->first();
    expect($asset->folder_id)->toBe($folder->id);
});

test('can move assets to a folder', function () {
    [$user, $workspace] = createAssetTestUser();
    $folder = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);
    $asset1 = Asset::factory()->create(['workspace_id' => $workspace->id]);
    $asset2 = Asset::factory()->create(['workspace_id' => $workspace->id]);

    $this->actingAs($user)
        ->post('/assets/move', [
            'asset_ids' => [$asset1->id, $asset2->id],
            'folder_id' => $folder->id,
        ])
        ->assertRedirect();

    expect($asset1->fresh()->folder_id)->toBe($folder->id);
    expect($asset2->fresh()->folder_id)->toBe($folder->id);
});

test('can move assets to root', function () {
    [$user, $workspace] = createAssetTestUser();
    $folder = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);
    $asset = Asset::factory()->create(['workspace_id' => $workspace->id, 'folder_id' => $folder->id]);

    $this->actingAs($user)
        ->post('/assets/move', [
            'asset_ids' => [$asset->id],
            'folder_id' => null,
        ])
        ->assertRedirect();

    expect($asset->fresh()->folder_id)->toBeNull();
});

test('can copy assets to a folder', function () {
    [$user, $workspace] = createAssetTestUser();
    $folder = AssetFolder::factory()->create(['workspace_id' => $workspace->id]);
    $tag = Tag::factory()->create(['workspace_id' => $workspace->id]);
    $original = Asset::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Original']);
    $original->tags()->attach($tag);

    $this->actingAs($user)
        ->post('/assets/copy', [
            'asset_ids' => [$original->id],
            'folder_id' => $folder->id,
        ])
        ->assertRedirect();

    $copy = Asset::withoutGlobalScopes()
        ->where('workspace_id', $workspace->id)
        ->where('name', 'Original (copy)')
        ->first();

    expect($copy)->not->toBeNull();
    expect($copy->folder_id)->toBe($folder->id);
    expect($copy->storage_path)->toBe($original->storage_path);
    expect($copy->tags->pluck('id')->toArray())->toBe([$tag->id]);
});

test('copy does not duplicate collection associations', function () {
    [$user, $workspace] = createAssetTestUser();
    $collection = Collection::factory()->create(['workspace_id' => $workspace->id]);
    $original = Asset::factory()->create(['workspace_id' => $workspace->id, 'name' => 'Source']);
    $original->collections()->attach($collection);

    $this->actingAs($user)
        ->post('/assets/copy', [
            'asset_ids' => [$original->id],
            'folder_id' => null,
        ])
        ->assertRedirect();

    $copy = Asset::withoutGlobalScopes()
        ->where('workspace_id', $workspace->id)
        ->where('name', 'Source (copy)')
        ->first();

    expect($copy->collections)->toBeEmpty();
});

test('can batch delete assets', function () {
    Storage::fake('assets');
    [$user, $workspace] = createAssetTestUser();
    $asset1 = Asset::factory()->create(['workspace_id' => $workspace->id, 'storage_path' => 'test/a1/file.pdf']);
    $asset2 = Asset::factory()->create(['workspace_id' => $workspace->id, 'storage_path' => 'test/a2/file.pdf']);

    Storage::disk('assets')->put('test/a1/file.pdf', 'c');
    Storage::disk('assets')->put('test/a2/file.pdf', 'c');

    $this->actingAs($user)
        ->post('/assets/batch-delete', ['asset_ids' => [$asset1->id, $asset2->id]])
        ->assertRedirect();

    expect(Asset::withoutGlobalScopes()->find($asset1->id))->toBeNull();
    expect(Asset::withoutGlobalScopes()->find($asset2->id))->toBeNull();
});

test('delete preserves R2 file when shared by copy', function () {
    Storage::fake('assets');
    [$user, $workspace] = createAssetTestUser();
    $sharedPath = 'test/shared/file.pdf';

    $original = Asset::factory()->create(['workspace_id' => $workspace->id, 'storage_path' => $sharedPath]);
    $copy = Asset::factory()->create(['workspace_id' => $workspace->id, 'storage_path' => $sharedPath]);

    Storage::disk('assets')->put($sharedPath, 'content');

    $this->actingAs($user)->delete("/assets/{$original->id}")->assertRedirect();

    expect(Asset::withoutGlobalScopes()->find($original->id))->toBeNull();
    expect(Asset::withoutGlobalScopes()->find($copy->id))->not->toBeNull();
    Storage::disk('assets')->assertExists($sharedPath);
});
